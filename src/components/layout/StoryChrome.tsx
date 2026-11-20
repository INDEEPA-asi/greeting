import { ChevronLeft, ChevronRight, Feather } from 'lucide-react';
import type { Chapter } from '../../app/navigation/chapters';
import { RoseMark } from '../ui/Ornaments';
import { MusicControls } from '../ui/MusicControls';

export function StoryHeader({ demo }: { demo: boolean }) {
  return (
    <header className="story-header">
      <div className="wordmark">
        <RoseMark size={32} />
        <div><span>LOVVERSE</span><small>ROSE GARDEN EDITION</small></div>
      </div>
      <div className="header-end">
        {demo && <span className="demo-label">Demo edition</span>}
        <MusicControls />
      </div>
    </header>
  );
}

export function StoryFooter({ chapters, index, busy, motion, onToggleMotion, onSelect, onSkip, allowNext }: {
  chapters: Chapter[]; index: number; busy: boolean;
  motion: { reduced: boolean; system: boolean }; onToggleMotion: () => void;
  onSelect: (chapter: Chapter, immediate?: boolean) => void; onSkip: () => void; allowNext: boolean;
}) {
  const chapter = chapters[index];
  const isGate = chapter.id === 'gate';
  return (
    <footer className="story-footer">
      <button className="motion-control" type="button" aria-pressed={motion.reduced} onClick={onToggleMotion} disabled={motion.system}
        title={motion.system ? 'Enabled by your device' : undefined}>
        <Feather size={15} strokeWidth={1.55} />
        <span>{motion.reduced ? 'Reduced motion on' : 'Reduce motion'}</span>
      </button>
      <nav className="progress" aria-label="Chapter progress">
        <div className="progress-label"><span>{String(index + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</span><span>{chapter.title}</span></div>
        <ol aria-hidden="true">{chapters.map(({ id }, position) => <li key={id} className={position === index ? 'active' : position < index ? 'read' : ''} />)}</ol>
      </nav>
      <nav className="chapter-actions" aria-label="Story navigation">
        {busy ? <button className="text-button" type="button" onClick={onSkip}>Skip transition</button> : isGate ? (
          chapters[1] && <button className="skip-intro" type="button" onClick={() => onSelect(chapters[1], true)}>Skip intro <ChevronRight size={15} /></button>
        ) : (
          <>
            {chapters[index - 1] && <button className="button ghost" type="button" onClick={() => onSelect(chapters[index - 1])}><ChevronLeft size={16} /> Back</button>}
            {chapters[index + 1] && <button className="button primary" type="button" disabled={!allowNext} onClick={() => onSelect(chapters[index + 1])}>Next <ChevronRight size={16} /></button>}
          </>
        )}
      </nav>
    </footer>
  );
}
