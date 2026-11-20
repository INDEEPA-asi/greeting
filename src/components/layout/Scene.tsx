import type { ReactNode } from 'react';
import { Ornament } from '../ui/Ornaments';

export function SceneTitle({ chapter, title, subtitle }: { chapter: string; title: string; subtitle?: string }) {
  return (
    <div className="scene-title">
      <p className="eyebrow">{chapter}</p>
      <Ornament />
      <h1 tabIndex={-1} data-scene-heading>{title}</h1>
      {subtitle && <p className="scene-subtitle">{subtitle}</p>}
    </div>
  );
}

export function Scene({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`scene ${className}`}>{children}</section>;
}
