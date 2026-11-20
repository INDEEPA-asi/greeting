import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Track } from '../../config/schema';

type AudioSettings = {
  tracks: Track[];
  activeTrack?: Track;
  volume: number;
  enabled: boolean;
  error: string;
  toggle: () => void;
  select: (id: string) => void;
  setVolume: (volume: number) => void;
  duck: (player: HTMLMediaElement, playing: boolean) => void;
};

const Context = createContext<AudioSettings | null>(null);

export function useAudio() {
  const audio = useContext(Context);
  if (!audio) throw new Error('Audio controls require AudioProvider.');
  return audio;
}

export function AudioProvider({ tracks, selected, children }: { tracks: Track[]; selected?: string; children: ReactNode }) {
  const [selectedId, setSelectedId] = useState(selected);
  const activeTrack = tracks.find(({ id }) => id === selectedId) ?? tracks[0];
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(.45);
  const [error, setError] = useState('');
  const player = useRef<HTMLAudioElement>(null);
  const frame = useRef(0);
  const playingMedia = useRef(new Set<HTMLMediaElement>());
  const requested = useRef(false);
  const playVersion = useRef(0);

  const fade = useCallback((node: HTMLAudioElement, target: number, done?: () => void) => {
    cancelAnimationFrame(frame.current);
    const from = node.volume;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / 380));
      node.volume = Math.max(0, Math.min(1, from + (target - from) * progress));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else done?.();
    };
    frame.current = requestAnimationFrame(tick);
  }, []);

  const fail = useCallback((message: string) => {
    if (!requested.current) return;
    requested.current = false;
    setEnabled(false);
    setError(message);
  }, []);

  const play = useCallback((node: HTMLAudioElement, target: number) => {
    const version = ++playVersion.current;
    cancelAnimationFrame(frame.current);
    if (node.paused) node.volume = 0;
    const playback = node.play();
    fade(node, target);
    void playback?.catch(() => {
      if (version === playVersion.current && requested.current && !document.hidden) {
        fail('Music could not play. Try again or select another track.');
      }
    });
  }, [fade, fail]);

  function toggle() {
    const node = player.current;
    if (!node || !activeTrack) return;
    const next = !requested.current;
    requested.current = next;
    setEnabled(next);
    if (next) {
      setError('');
      if (node.getAttribute('src') !== activeTrack.src) node.src = activeTrack.src;
      else if (node.error) node.load();
      play(node, volume * (playingMedia.current.size ? .2 : 1));
    } else {
      playVersion.current++;
      fade(node, 0, () => node.pause());
    }
  }

  function select(id: string) {
    const chosen = tracks.find((track) => track.id === id);
    if (!chosen) return;
    setSelectedId(id);
    setError('');
    const node = player.current;
    if (!node || !requested.current || node.getAttribute('src') === chosen.src) return;
    node.pause();
    node.src = chosen.src;
    play(node, volume * (playingMedia.current.size ? .2 : 1));
  }

  function duck(element: HTMLMediaElement, playing: boolean) {
    if (playing) playingMedia.current.add(element);
    else playingMedia.current.delete(element);
    if (requested.current && player.current) fade(player.current, volume * (playingMedia.current.size ? .2 : 1));
  }

  useEffect(() => {
    const node = player.current;
    function visibilityChanged() {
      if (document.hidden) {
        playVersion.current++;
        if (node) {
          cancelAnimationFrame(frame.current);
          node.pause();
        }
        [...playingMedia.current].forEach((element) => element.pause());
      } else if (node && requested.current) {
        play(node, volume * (playingMedia.current.size ? .2 : 1));
      }
    }
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => document.removeEventListener('visibilitychange', visibilityChanged);
  }, [play, volume]);

  useEffect(() => {
    const node = player.current;
    return () => {
      cancelAnimationFrame(frame.current);
      if (node?.hasAttribute('src')) {
        node.pause();
        node.removeAttribute('src');
        node.load();
      }
    };
  }, []);

  return (
    <Context.Provider value={{
      tracks, activeTrack, volume, enabled, error, toggle, select,
      setVolume: (value) => {
        setVolume(value);
        if (requested.current && player.current) fade(player.current, value * (playingMedia.current.size ? .2 : 1));
      },
      duck,
    }}>
      <audio ref={player} preload="none" loop onError={() => fail('This music file is unavailable.')} />
      {children}
    </Context.Provider>
  );
}
