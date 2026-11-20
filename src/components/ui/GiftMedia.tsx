import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import type { Gift } from '../../config/schema';
import { useAudio } from '../../app/providers/AudioProvider';

export function GiftMedia({ gift }: { gift: Extract<Gift, { type: 'voice' | 'video' }> & { src: string } }) {
  const { duck } = useAudio();
  const [phase, setPhase] = useState<'ready' | 'loading' | 'playing' | 'ended' | 'error'>('ready');
  const [activated, setActivated] = useState(false);
  const player = useRef<HTMLMediaElement | null>(null);
  const duckLatest = useRef(duck);
  duckLatest.current = duck;

  useEffect(() => {
    const node = player.current;
    return () => {
      if (!node) return;
      if (!node.paused) node.pause();
      duckLatest.current(node, false);
    };
  }, []);

  function play() {
    const node = player.current;
    if (!node) return;
    if (!node.hasAttribute('src')) node.src = gift.src;
    else if (node.error) node.load();
    if (node.ended) node.currentTime = 0;
    setActivated(true);
    setPhase('loading');
    void node.play()?.catch(() => setPhase('error'));
  }

  const events = {
    preload: 'none',
    onPlaying: () => { if (player.current) duck(player.current, true); setPhase('playing'); },
    onPause: () => {
      if (!player.current) return;
      duck(player.current, false);
      if (!player.current.ended) setPhase((previous) => previous === 'error' ? previous : 'ready');
    },
    onEnded: () => { if (player.current) duck(player.current, false); setPhase('ended'); },
    onWaiting: () => setPhase('loading'),
    onError: () => { if (player.current) duck(player.current, false); setPhase('error'); },
  };

  return (
    <div className="gift-media">
      {gift.type === 'voice'
        ? <audio {...events} ref={(node) => { player.current = node; }} controls={activated && phase !== 'error'} aria-label={gift.title} />
        : <video {...events} ref={(node) => { player.current = node; }} controls={activated && phase !== 'error'} playsInline hidden={!activated || phase === 'error'} aria-label={gift.title}>
            {activated && gift.captions && <track kind="captions" src={gift.captions} label="English" srcLang="en" default />}
          </video>}
      {(phase === 'ready' && !activated) && <button type="button" className="button primary" onClick={play}><Play size={16} /> Play {gift.type === 'voice' ? 'voice note' : 'video'}</button>}
      {phase === 'loading' && <p role="status" className="status">Loading {gift.type === 'voice' ? 'voice note' : 'video'}…</p>}
      {phase === 'error' && <>
        <div role="status"><p className="status">This recording is unavailable.</p><p>{gift.fallback}</p></div>
        <button type="button" className="button ghost" onClick={play}><RotateCcw size={16} /> Retry recording</button>
      </>}
      {phase === 'ended' && <button type="button" className="button ghost" onClick={play}><RotateCcw size={16} /> Replay recording</button>}
      {gift.transcript && <details><summary>Read transcript</summary><p>{gift.transcript}</p></details>}
    </div>
  );
}
