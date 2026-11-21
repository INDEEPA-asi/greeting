import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CalendarHeart, Download, Eye, Gift, Images, Music2, Palette, PenLine, Route } from 'lucide-react';
import { App } from './App';
import { birthday } from '../config/birthday';
import { birthdaySchema, type BirthdayConfig, type ValidatedBirthday } from '../config/schema';
import { RoseMark } from '../components/ui/Ornaments';
import { acceptsMedia, mediaPath, referencedAssets, type AssetLibrary, type MediaKind } from './personalization/assets';
import { GiftsPanel, MusicPanel, PhotosPanel, TimelinePanel } from './personalization/MediaPanels';
import { BasicsPanel, ColorsPanel, MessagesPanel } from './personalization/StoryPanels';
import './editor.css';

const panels = {
  basics: { label: 'Basics', detail: 'Names, birthday, and chapters', icon: CalendarHeart, view: BasicsPanel },
  photos: { label: 'Photos', detail: 'Scrapbook and finale', icon: Images, view: PhotosPanel },
  messages: { label: 'Messages', detail: 'Opening, letter, and wishes', icon: PenLine, view: MessagesPanel },
  timeline: { label: 'Timeline', detail: 'The moments you remember', icon: Route, view: TimelinePanel },
  gifts: { label: 'Gifts', detail: 'Notes, photos, voice, and video', icon: Gift, view: GiftsPanel },
  music: { label: 'Music', detail: 'Tracks for your garden', icon: Music2, view: MusicPanel },
  colors: { label: 'Colors', detail: 'Make the palette yours', icon: Palette, view: ColorsPanel },
};

type PanelId = keyof typeof panels;
type Issue = { label: string; panel: PanelId; message: string };

const sectionFor: Partial<Record<string, PanelId>> = {
  photos: 'photos', timeline: 'timeline', gifts: 'gifts', audio: 'music', theme: 'colors',
  opening: 'messages', subtitles: 'messages', candleMessage: 'messages', letter: 'messages', wishMessage: 'messages', finale: 'messages',
};
const fieldNames: Record<string, string> = {
  girlfriendName: 'Her name', senderName: 'Your name', birthdayDate: 'Birthday', timezone: 'Time zone',
  firstLine: 'First headline line', secondLine: 'Second headline line', candleMessage: 'Candle message',
  audio: 'Music', src: 'File', alt: 'Alt text',
};

function readableIssue(path: PropertyKey[], message: string): Issue {
  const [root, field] = path.map(String);
  const panel = root === 'finale' && field === 'photo' ? 'photos' : sectionFor[root] ?? 'basics';
  const label = path.map((item) => {
    if (typeof item === 'number') return String(item + 1);
    const name = String(item);
    return fieldNames[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
  }).join(' · ');
  return { label: label || 'Personalization', panel, message };
}

export default function PersonalizationEditor() {
  const [draft, setDraft] = useState<BirthdayConfig>(birthday);
  const [section, setSection] = useState<PanelId>('basics');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<ValidatedBirthday>();
  const [exporting, setExporting] = useState(false);
  const busy = useRef(false);
  const assets = useRef<AssetLibrary>(new Map());
  const archiveUrl = useRef<string | null>(null);
  const alive = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const errors = useRef<HTMLElement>(null);
  const focusHeading = useRef(false);
  const previewTrigger = useRef<HTMLButtonElement>(null);
  const returnToPreviewButton = useRef(false);

  useEffect(() => {
    alive.current = true;
    const library = assets.current;
    return () => {
      alive.current = false;
      library.forEach(({ url }) => URL.revokeObjectURL(url));
      library.clear();
      if (archiveUrl.current) URL.revokeObjectURL(archiveUrl.current);
    };
  }, []);

  useEffect(() => {
    const paths = referencedAssets(draft);
    for (const [path, asset] of assets.current) {
      if (paths.has(path)) continue;
      URL.revokeObjectURL(asset.url);
      assets.current.delete(path);
    }
  }, [draft]);

  useEffect(() => {
    if (focusHeading.current) {
      heading.current?.focus();
      focusHeading.current = false;
    }
  }, [section]);

  useEffect(() => {
    if (issues.length) errors.current?.focus();
  }, [issues]);

  useEffect(() => {
    if (!preview && returnToPreviewButton.current) {
      previewTrigger.current?.focus();
      returnToPreviewButton.current = false;
    }
  }, [preview]);

  function changeSection(next: PanelId) {
    if (next === section) heading.current?.focus();
    else {
      focusHeading.current = true;
      setSection(next);
    }
  }

  function update(patch: Partial<BirthdayConfig>) {
    setDraft((current) => ({ ...current, ...patch }));
    setIssues([]);
  }

  function attach(files: File[], kind: MediaKind) {
    const attached = files.flatMap((file) => {
      if (!acceptsMedia(file, kind)) return [];
      const path = mediaPath(file, kind);
      assets.current.set(path, { file, url: URL.createObjectURL(file) });
      return [{ file, path }];
    });
    const skipped = files.length - attached.length;
    setNotice(skipped ? `${skipped} ${skipped === 1 ? 'file could' : 'files could'} not be added. Choose a supported format and a file with content.` : '');
    return attached;
  }

  function validate() {
    const result = birthdaySchema.safeParse(draft);
    if (!result.success) {
      setIssues(result.error.issues.map((issue) => readableIssue(issue.path, issue.code === 'too_small' ? 'Enter a value.' : issue.message)));
      return;
    }
    setIssues([]);
    return result.data;
  }

  async function download() {
    if (busy.current) return;
    const config = validate();
    if (!config) return;
    const attachments = new Map(assets.current);
    busy.current = true;
    setExporting(true);
    setNotice('');
    try {
      const { exportPersonalization } = await import('./personalization/export');
      const archive = await exportPersonalization(config, attachments);
      if (!alive.current) return;
      if (archiveUrl.current) URL.revokeObjectURL(archiveUrl.current);
      archiveUrl.current = URL.createObjectURL(archive);
      const link = document.createElement('a');
      link.href = archiveUrl.current;
      link.download = 'lovverse-personalization.zip';
      document.body.append(link);
      link.click();
      link.remove();
      setNotice('Download prepared. Extract it into your LOVVERSE project folder.');
    } catch {
      if (alive.current) setNotice('The download could not be prepared. Try again with smaller files.');
    } finally {
      busy.current = false;
      if (alive.current) setExporting(false);
    }
  }

  if (preview) return <>
    <div className="editor-preview-bar">
      <button className="editor-button secondary" type="button" autoFocus onClick={() => {
        returnToPreviewButton.current = true;
        setPreview(undefined);
      }}><ArrowLeft size={17} /> Back to editing</button>
      <span>Story preview</span>
    </div>
    <App config={preview} previews={new Map([...assets.current].map(([path, { url }]) => [path, url]))} />
  </>;

  const Panel = panels[section].view;
  const panelKeys = Object.keys(panels) as PanelId[];

  return <div className="editor-shell">
    <header className="editor-top">
      <div className="editor-brand"><RoseMark size={27} /><span>LOVVERSE</span></div>
      <a href="/">Open the garden</a>
    </header>
    <main className="editor">
      <div className="editor-intro">
        <div>
          <h1>Personalize your garden</h1>
          <p>Add your names, messages, and favorite media. Your edits stay in this tab until you download them.</p>
        </div>
        <div className="editor-actions">
          <button className="editor-button secondary" ref={previewTrigger} disabled={exporting} type="button" onClick={() => {
            setNotice('');
            const config = validate();
            if (config) setPreview(config);
          }}><Eye size={17} /> Preview story</button>
          <button className="editor-button" type="button" disabled={exporting} onClick={() => { void download(); }}>
            <Download size={17} /> {exporting ? 'Preparing download…' : 'Download personalization'}
          </button>
        </div>
      </div>
      <details className="editor-details editor-save-help">
        <summary>How to save your changes</summary>
        <p>Download the ZIP and extract it into your LOVVERSE project folder, next to <code>package.json</code>. It contains your new <code>birthday.ts</code> and the media you attached. Keep a copy of your current configuration if you want to restore it later.</p>
      </details>
      {notice && <p className="editor-notice" role="status">{notice}</p>}
      {!!issues.length && <section className="editor-errors" ref={errors} tabIndex={-1} aria-label="Fields that need attention">
        <h2>Check these fields</h2>
        <ul>{issues.map(({ label, message, panel }, index) => <li key={index}>
          <button type="button" onClick={() => changeSection(panel)}>{label}</button> · {message}
        </li>)}</ul>
      </section>}
      <div className="editor-grid">
        <nav aria-label="Personalization sections" className="editor-sidebar">
          {panelKeys.map((id) => {
            const { icon: Icon, label } = panels[id];
            return <button type="button" key={id} aria-current={id === section ? 'true' : undefined} onClick={() => changeSection(id)}>
              <Icon size={18} strokeWidth={1.7} aria-hidden="true" /> {label}
            </button>;
          })}
        </nav>
        <section className="editor-panel" aria-labelledby="editor-section-heading">
          <div className="editor-panel-heading">
            <h2 ref={heading} tabIndex={-1} id="editor-section-heading">{panels[section].label}</h2>
            <p>{panels[section].detail}</p>
          </div>
          <Panel draft={draft} update={update} media={{ assets: assets.current, attach }} />
        </section>
      </div>
    </main>
  </div>;
}
