import { useEffect, useRef, useState } from 'react';
import { MailOpen } from 'lucide-react';
import { Scene, SceneTitle } from '../components/layout/Scene';
import { RoseMark } from '../components/ui/Ornaments';
import type { ValidatedBirthday } from '../config/schema';

export default function LoveLetter({ config, reduced }: { config: ValidatedBirthday; reduced: boolean }) {
  const [state, setState] = useState<'closed' | 'opening' | 'reading'>('closed');
  const paper = useRef<HTMLElement>(null);
  const envelope = useRef<HTMLButtonElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const opened = state !== 'closed';
  const paragraphs = config.letter.length ? config.letter : ['A little love, tucked away for you.'];

  useEffect(() => {
    if (opened) paper.current?.focus({ preventScroll: true });
  }, [opened]);

  function close() {
    setState('closed');
    requestAnimationFrame(() => envelope.current?.focus({ preventScroll: true }));
  }

  function finishReveal() {
    if (document.activeElement === skip.current) paper.current?.focus({ preventScroll: true });
    setState('reading');
  }

  return (
    <Scene className="letter-scene">
      <SceneTitle chapter="Sealed with a Rose" title="A Letter Among the Roses" subtitle={config.subtitles.letter} />
      <div className={`letter-stage ${opened ? 'letter-opened' : ''}`}>
        <div className="envelope" aria-hidden="true">
          <div className="envelope-flap" />
          <div className="envelope-fold" />
          <div className="wax-seal"><RoseMark size={31} /></div>
        </div>
        {opened && (
          <article className={`letter-paper ${state === 'opening' && !reduced ? 'revealing' : ''}`} tabIndex={-1} ref={paper} aria-label="Birthday letter">
            <h2>My dearest {config.girlfriendName},</h2>
            {paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 16)}`} style={{ animationDelay: `${Math.min(index, 7) * 115}ms` }}
                onAnimationEnd={index === paragraphs.length - 1 ? finishReveal : undefined}>{paragraph}</p>
            ))}
            <p className="letter-signature hand">With love,<br />{config.senderName}</p>
          </article>
        )}
      </div>
      <div className="action-row letter-actions">
        {opened ? (
          <>
            {state === 'opening' && !reduced && <button ref={skip} className="text-button" type="button" onClick={finishReveal}>Skip reveal</button>}
            <button className="button ghost" type="button" onClick={close}>Close letter</button>
          </>
        ) : <button ref={envelope} className="button primary" type="button" onClick={() => setState(reduced ? 'reading' : 'opening')}><MailOpen size={17} /> Open My Letter</button>}
      </div>
    </Scene>
  );
}
