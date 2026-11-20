import { Flower2 } from 'lucide-react';

export function RoseMark({ size = 27 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 36c4-8 3-13 2-17m0 11c-4 0-8-2-10-6 6-1 8 2 10 6Zm1-3c2-4 6-6 10-6-1 4-5 6-10 6Z" />
        <path d="M20 21C13 20 9 15 9 9c4 0 6 1 7 3-1-4 2-7 4-8 4 1 7 4 7 7 1-2 3-2 5-2 0 6-4 11-12 12Z" />
        <path d="M16 12c2 1 4 2 5 5 1-3 3-4 6-6m-8 3c1-1 2-2 4-2" />
      </g>
    </svg>
  );
}

export function Ornament() {
  return <div className="ornament" aria-hidden="true"><span /><Flower2 size={14} strokeWidth={1.3} /><span /></div>;
}

export function GildedFrame() {
  return (
    <div className="gilded-frame" aria-hidden="true">
      {['tl', 'tr', 'bl', 'br'].map((corner) => (
        <svg key={corner} className={`corner ${corner}`} viewBox="0 0 64 64" fill="none">
          <path d="M1 63V1h62M7 49V7h42M7 26c0-12 7-19 19-19M1 20c7-1 15-7 19-19M7 17c9 2 10-4 10-10" />
          <path d="m13 13 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" />
        </svg>
      ))}
    </div>
  );
}
