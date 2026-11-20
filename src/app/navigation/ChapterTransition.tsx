import { useEffect, useRef } from 'react';
import type { Chapter } from './chapters';
import type { NavigationState } from './reducer';

const cover: Keyframe[] = [
  { opacity: 0, clipPath: 'ellipse(0% 0% at 50% 52%)' },
  { opacity: 0, clipPath: 'ellipse(0% 0% at 50% 52%)', offset: .21 },
  { opacity: 1, clipPath: 'ellipse(80% 100% at 50% 52%)', offset: .94 },
  { opacity: 1, clipPath: 'none' },
];
const reveal: Keyframe[] = [
  { opacity: 1 },
  { opacity: 1, offset: .16 },
  { opacity: 0 },
];

export function ChapterTransition({ phase, motif, duration, ready, onComplete }: {
  phase: Exclude<NavigationState['phase'], 'idle'>;
  motif: Chapter['motif']; duration: number; ready: boolean; onComplete: () => void;
}) {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = layer.current;
    if (!element || (phase === 'entering' && !ready)) return;
    if (!element.animate) { onComplete(); return; }

    let active = true;
    let animation: Animation | undefined;
    const finished = () => { if (active) onComplete(); };
    try {
      animation = element.animate(phase === 'exiting' ? cover : reveal, {
        duration: duration * (phase === 'exiting' ? .53 : .47),
        easing: phase === 'exiting' ? 'cubic-bezier(.44,.04,.28,.98)' : 'ease-in-out',
        fill: 'both',
      });
      if (animation.finished) void animation.finished.then(finished, finished);
      else {
        animation.onfinish = finished;
        animation.oncancel = finished;
      }
    } catch { finished(); }

    return () => { active = false; animation?.cancel(); };
  }, [duration, onComplete, phase, ready]);

  return (
    <div className="transition-layer" data-phase={phase} data-motif={motif} ref={layer} aria-hidden="true">
      <div className="transition-bloom">
        {Array.from({ length: 9 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 40}deg)`, animationDelay: `${i * 32}ms` }} />)}
      </div>
      <div className="transition-symbol"><span /><i /><b /></div>
    </div>
  );
}
