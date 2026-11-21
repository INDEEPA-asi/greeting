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

export function AudioProvider({ tracks, selected, autoplay = false, children }: {
  tracks: Track[]; selected?: string; autoplay?: boolean; children: ReactNode;
}) {
  const [selectedId, setSelectedId] = useState(selected);
  const activeTrack = tracks.find(({ id }) => id === selectedId) ?? tracks[0];
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(.45);
  const [error, setError] = useState('');
  const player = useRef<HTMLAudioElement>(null);
  const frame = useRef(0);
  const playingMedia = useRef(new Set<HTMLMediaElement>());
  const requested = useRef(false);
  const awaitingGesture = useRef(false);
  const initialPlayback = useRef(false);
  const playVersion = useRef(0);
  const source = activeTrack?.src;

  const cancelPlayback = useCallback(() => {
    playVersion.current++;
    cancelAnimationFrame(frame.current);
  }, []);

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
    awaitingGesture.current = false;
    cancelAnimationFrame(frame.current);
    setEnabled(false);
    setError(message);
  }, []);

  const play = useCallback((node: HTMLAudioElement, src: string, target: number, automatic = false) => {
    const version = ++playVersion.current;
    cancelAnimationFrame(frame.current);
    if (node.getAttribute('src') !== src) node.src = src;
    else if (node.error) node.load();
    if (node.paused) node.volume = Math.min(target, .06);

    void Promise.resolve(node.play()).then(() => {
      if (version !== playVersion.current || !requested.current || document.hidden) return;
      awaitingGesture.current = false;
      setEnabled(true);
      fade(node, target * (playingMedia.current.size ? .2 : 1));
    }, (cause: unknown) => {
      if (version !== playVersion.current || !requested.current || document.hidden) return;
      if (automatic && cause instanceof DOMException && cause.name === 'NotAllowedError') {
        awaitingGesture.current = true;
        setEnabled(false);
        return;
      }
      fail('Music could not play. Try again or select another track.');
    });
  }, [fade, fail]);

  function toggle() {
    const node = player.current;
    if (!node || !source) return;
    initialPlayback.current = true;
    awaitingGesture.current = false;
    requested.current = !enabled;
    if (requested.current) {
      setError('');
      play(node, source, volume);
    } else {
      cancelPlayback();
      setEnabled(false);
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
    awaitingGesture.current = false;
    node.pause();
    play(node, chosen.src, volume);
  }

  function duck(element: HTMLMediaElement, playing: boolean) {
    if (playing) playingMedia.current.add(element);
    else playingMedia.current.delete(element);
    if (requested.current && player.current) fade(player.current, volume * (playingMedia.current.size ? .2 : 1));
  }

  useEffect(() => {
    const node = player.current;
    if (!source || !node) return;
    let cancelled = false;
    if (autoplay && !initialPlayback.current) {
      // Run after the mount has settled so React's development cleanup cannot start a second track.
      queueMicrotask(() => {
        if (cancelled || initialPlayback.current) return;
        initialPlayback.current = true;
        requested.current = true;
        awaitingGesture.current = true;
        if (!document.hidden) play(node, source, volume, true);
      });
    }

    function firstInteraction(event: MouseEvent) {
      if (!event.isTrusted || !requested.current || !awaitingGesture.current || document.hidden) return;
      if (event.target instanceof Element && event.target.closest('.music-toggle')) return;
      awaitingGesture.current = false;
      if (node && source) play(node, source, volume);
    }

    function visibilityChanged() {
      if (document.hidden) {
        cancelPlayback();
        node?.pause();
        [...playingMedia.current].forEach((element) => element.pause());
      } else if (node && source && requested.current) {
        play(node, source, volume, autoplay);
      }
    }
    document.addEventListener('click', firstInteraction);
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
      cancelled = true;
      document.removeEventListener('click', firstInteraction);
      document.removeEventListener('visibilitychange', visibilityChanged);
    };
  }, [autoplay, cancelPlayback, play, source, volume]);

  useEffect(() => {
    const node = player.current;
    return () => {
      cancelPlayback();
      if (node?.hasAttribute('src')) {
        node.pause();
        node.removeAttribute('src');
        node.load();
      }
    };
  }, [cancelPlayback]);

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
