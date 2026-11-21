import { Component, Suspense, useCallback, useEffect, useReducer, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { EnchantedGate } from '../chapters/EnchantedGate';
import { StoryFooter, StoryHeader } from '../components/layout/StoryChrome';
import { GardenParticles } from '../components/effects/GardenParticles';
import { useMotionPreference } from '../hooks/useMotionPreference';
import { useVisibility } from '../hooks/useVisibility';
import { birthdayResult, gardenConfig } from '../config/birthday';
import type { ValidatedBirthday } from '../config/schema';
import { AudioProvider } from './providers/AudioProvider';
import { ChapterTransition } from './navigation/ChapterTransition';
import { enabledChapters, type Chapter, type ChapterId } from './navigation/chapters';
import { initialNavigation, navigationReducer } from './navigation/reducer';
import { lazyScenes, loaders, scenery } from './sceneLoaders';

function Ready({ chapter, report }: { chapter: ChapterId; report: (chapter: ChapterId) => void }) {
  useEffect(() => { report(chapter); }, [chapter, report]);
  return null;
}

class SceneError extends Component<{ children: ReactNode; recover: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.recover : this.props.children; }
}

function GardenStory({ config, invalid, previews }: { config: ValidatedBirthday; invalid: boolean; previews?: ReadonlyMap<string, string> }) {
  const { reduced, system, user, setUser } = useMotionPreference();
  const hidden = useVisibility();
  const story = enabledChapters(config.enabled);
  const [state, dispatch] = useReducer(navigationReducer, story[0].id, initialNavigation);
  const index = story.findIndex(({ id }) => id === state.current);
  const active = story[index] ?? story[0];
  const next = story[index + 1];
  const [blown, setBlown] = useState(false);
  const [opened, setOpened] = useState<number[]>([]);
  const [released, setReleased] = useState(false);
  const [ready, setReady] = useState<ChapterId | null>(null);
  const [motif, setMotif] = useState<Chapter>(active);
  const scene = useRef<HTMLElement>(null);
  const focusedRevision = useRef(0);
  const busy = state.phase !== 'idle';
  const allowNext = active.id !== 'birthday' || blown;
  const inScene = state.current === ready;
  const theme = Object.fromEntries(Object.entries(config.theme).map(([name, value]) => [`--${name}`, value])) as CSSProperties;

  const complete = useCallback(() => {
    if (state.phase === 'exiting') dispatch({ type: 'covered', revision: state.revision });
    if (state.phase === 'entering') dispatch({ type: 'revealed', revision: state.revision });
  }, [state.phase, state.revision]);

  useEffect(() => {
    if (busy && (reduced || hidden)) dispatch({ type: 'skip' });
  }, [busy, hidden, reduced]);

  useEffect(() => {
    if (busy || !inScene || !state.revision || focusedRevision.current === state.revision) return;
    const heading = scene.current?.querySelector<HTMLElement>('[data-scene-heading]');
    if (!heading) return;
    focusedRevision.current = state.revision;
    window.scrollTo(0, 0);
    heading.focus({ preventScroll: true });
  }, [busy, inScene, state.revision]);

  useEffect(() => {
    if (!next || next.id === 'gate' || !inScene || busy) return;
    const id = next.id;
    const prefetch = () => {
      void loaders[id]().catch(() => undefined);
      const asset = scenery[id];
      if (asset) {
        const image = new Image();
        image.fetchPriority = 'low';
        image.sizes = asset.sizes;
        image.srcset = asset.srcset;
        image.src = asset.src;
      }
    };
    if (!('requestIdleCallback' in window)) return;
    let request: number | undefined;
    const schedule = () => { request = window.requestIdleCallback(prefetch); };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      if (request !== undefined) window.cancelIdleCallback(request);
    };
  }, [busy, inScene, next]);

  function navigate(chapter: Chapter, immediate = false) {
    if (busy || chapter.id === active.id) return;
    setMotif(active);
    if (chapter.id !== 'gate') void loaders[chapter.id]().catch(() => undefined);
    dispatch({ type: 'navigate', to: chapter.id, immediate: immediate || reduced || hidden });
  }

  function replay() {
    if (busy) return;
    setBlown(false);
    setOpened([]);
    setReleased(false);
    navigate(story[0]);
  }

  const memories = story.find(({ id }) => id === 'memories');
  const configWithAssets = previews ? replacePreviewPaths(config, previews) : config;
  const common = { config: configWithAssets };
  let content: ReactNode;
  switch (active.id) {
    case 'gate': content = <EnchantedGate {...common} busy={busy} enter={next ? () => navigate(next) : undefined} />; break;
    case 'birthday': content = <lazyScenes.birthday {...common} blown={blown} onBlow={() => setBlown(true)} />; break;
    case 'memories': content = <lazyScenes.memories {...common} />; break;
    case 'timeline': content = <lazyScenes.timeline {...common} />; break;
    case 'letter': content = <lazyScenes.letter {...common} reduced={reduced} />; break;
    case 'gifts': content = <lazyScenes.gifts {...common} opened={opened} onOpen={(gift) => setOpened((current) => current.includes(gift) ? current : [...current, gift])} />; break;
    case 'wish': content = <lazyScenes.wish {...common} reduced={reduced} hidden={hidden} released={released} onRelease={() => setReleased(true)} />; break;
    case 'finale': content = <lazyScenes.finale {...common} reduced={reduced || hidden} replay={story.length > 1 ? replay : undefined}
      memories={memories ? () => navigate(memories) : undefined} />; break;
  }

  return (
    <AudioProvider autoplay tracks={configWithAssets.audio.tracks} selected={configWithAssets.audio.selected}>
      <div className="garden" data-tone={active.tone} data-chapter={active.id} data-reduced={reduced} data-hidden={hidden} data-busy={busy} style={theme}>
        <a href="#chapter" className="visually-hidden-link" inert={busy}>Skip to chapter</a>
        <div inert={busy}><StoryHeader demo={config.demo} /></div>
        {invalid && <p role="status" className="config-warning">Personalization could not be loaded. The demo garden is shown.</p>}
        <main id="chapter" tabIndex={-1} ref={scene} inert={busy}>
          <SceneError key={active.id} recover={<div className="scene empty-scene"><Ready chapter={active.id} report={setReady} />
            <h1 tabIndex={-1} data-scene-heading>This chapter could not load</h1>
            <div className="action-row">
              <button type="button" className="button ghost" onClick={() => window.location.reload()}>Reload the garden</button>
              {next && <button type="button" className="button primary" onClick={() => navigate(next)}>Continue to the next chapter</button>}
            </div></div>}>
            <Suspense fallback={<div className="scene-pending" role="status">Opening the next chapter…</div>}>
              {content}
              <Ready chapter={active.id} report={setReady} />
            </Suspense>
          </SceneError>
        </main>
        {['birthday', 'wish', 'finale'].includes(active.id) && <GardenParticles color={config.theme.gold} reduced={reduced} hidden={hidden} petals={active.id !== 'wish'} />}
        <StoryFooter chapters={story} index={index} busy={busy} motion={{ reduced, system }} onToggleMotion={() => setUser(!user)}
          onSelect={navigate} onSkip={() => dispatch({ type: 'skip' })} allowNext={allowNext} />
        {state.phase !== 'idle' && <ChapterTransition phase={state.phase} motif={motif.motif} duration={motif.duration}
          ready={state.phase === 'exiting' || inScene} onComplete={complete} />}
      </div>
    </AudioProvider>
  );
}

function replacePreviewPaths(config: ValidatedBirthday, assets: ReadonlyMap<string, string>): ValidatedBirthday {
  return JSON.parse(JSON.stringify(config, (key, value: unknown) =>
    (key === 'src' || key === 'captions') && typeof value === 'string' ? assets.get(value) ?? value : value,
  )) as ValidatedBirthday;
}

export function App({ config = gardenConfig, previews }: { config?: ValidatedBirthday; previews?: ReadonlyMap<string, string> }) {
  return <GardenStory config={config} previews={previews} invalid={config === gardenConfig && !birthdayResult.success} />;
}
