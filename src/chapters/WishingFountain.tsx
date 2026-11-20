import { useEffect, useRef, useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { Scene, SceneTitle } from '../components/layout/Scene';
import { Dialog } from '../components/ui/Dialog';
import { GildedFrame } from '../components/ui/Ornaments';
import type { ValidatedBirthday } from '../config/schema';

export default function WishingFountain({ config, reduced, hidden, released, onRelease }: {
  config: ValidatedBirthday; reduced: boolean; hidden: boolean; released: boolean; onRelease: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [wish, setWish] = useState('');
  const [flying, setFlying] = useState(false);
  const focusResult = useRef(false);
  const result = useRef<HTMLParagraphElement>(null);
  const skipFlight = useRef<HTMLButtonElement>(null);
  const inFlight = flying && !hidden && !reduced;
  const showMessage = released && !inFlight;

  useEffect(() => {
    if (hidden || reduced) setFlying(false);
    if (!focusResult.current) return;
    if (inFlight) skipFlight.current?.focus({ preventScroll: true });
    if (showMessage) {
      result.current?.focus({ preventScroll: true });
      focusResult.current = false;
    }
  }, [hidden, inFlight, reduced, showMessage]);
  return (
    <Scene className="wish-scene">
      <SceneTitle chapter="The Wishing Fountain" title="Tonight, the garden has one wish left to keep." subtitle={config.subtitles.wish} />
      <div className="fountain-art">
        <img src="/images/decorations/fountain.webp" srcSet="/images/decorations/fountain-small.webp 384w, /images/decorations/fountain.webp 768w"
          sizes="(min-width: 800px) 768px, 94vw" alt="A stone fountain lit by golden lanterns among night-blooming roses" decoding="async" />
        <GildedFrame />
        {!released && <button type="button" className="floating-lantern" aria-label="Make a wish with the lantern" onClick={() => setOpen(true)}><Flame size={23} /></button>}
        {inFlight && <span className="floating-lantern flying" aria-hidden="true" onAnimationEnd={() => setFlying(false)}><Flame size={23} /></span>}
      </div>
      <div className="wish-actions">
        {!released && <button type="button" className="button primary" onClick={() => setOpen(true)}><Sparkles size={17} /> Make a Wish</button>}
        {inFlight && <button type="button" ref={skipFlight} className="text-button" onClick={() => setFlying(false)}>Skip lantern flight</button>}
        <div aria-live="polite">
          {showMessage && <p className="wish-message" ref={result} tabIndex={-1}>{config.wishMessage ?? 'May this year bring you something lovely to wish for again.'}</p>}
        </div>
      </div>
      {open && (
        <Dialog title="A wish for the year ahead" onClose={() => setOpen(false)}>
          <form className="wish-form" onSubmit={(event) => {
            event.preventDefault();
            focusResult.current = true;
            setOpen(false);
            setFlying(!reduced && !hidden);
            onRelease();
          }}>
            <label htmlFor="birthday-wish">Your wish <span>(optional)</span></label>
            <textarea id="birthday-wish" value={wish} onChange={(event) => setWish(event.target.value)} maxLength={500} rows={4} />
            <p className="status">Your words stay in this open page and are cleared when you leave it.</p>
            <button type="submit" className="button primary"><Flame size={17} /> Release the Lantern</button>
          </form>
        </Dialog>
      )}
    </Scene>
  );
}
