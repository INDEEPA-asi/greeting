import { useEffect, useRef, useState } from 'react';
import { Camera, Download, RotateCcw } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { GardenImage } from '../components/ui/GardenImage';
import { GildedFrame, Ornament } from '../components/ui/Ornaments';
import { MusicToggle } from '../components/ui/MusicControls';
import type { ValidatedBirthday } from '../config/schema';
import { birthdayCard } from '../lib/card';

const lights = [[9, 24], [18, 51], [34, 18], [42, 7], [57, 29], [69, 19], [78, 47], [86, 15], [92, 42], [63, 58], [29, 53]];

export default function ForeverGarden({ config, reduced, replay, memories }: {
  config: ValidatedBirthday; reduced: boolean; replay?: () => void; memories?: () => void;
}) {
  const [download, setDownload] = useState<'ready' | 'working' | 'done' | 'failed'>('ready');
  const alive = useRef(false);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  async function exportCard() {
    if (download === 'working') return;
    setDownload('working');
    try {
      const blob = await birthdayCard(config);
      if (!alive.current) return;
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl.current;
      anchor.download = 'lovverse-birthday-card.png';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setDownload('done');
    } catch {
      if (alive.current) setDownload('failed');
    }
  }

  return (
    <section className="finale">
      <LazyMotion features={domAnimation}>
        <m.div className="finale-art" aria-hidden="true" initial={reduced ? false : { scale: 1.5, opacity: .65 }}
          animate={{ scale: 1, opacity: 1 }} transition={{ duration: reduced ? 0 : 2.6, ease: [0.2, .65, .25, 1] }} />
      </LazyMotion>
      <div className="finale-lightfield" aria-hidden="true">{lights.map(([left, top], index) => <i key={left} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * .14}s` }} />)}</div>
      <div className="finale-roses" aria-hidden="true"><span /><span /></div>
      <div className="finale-inset"><GildedFrame /></div>
      <div className="finale-layout">
        <div className="finale-copy">
          <p className="eyebrow">The Forever Garden</p>
          <Ornament />
          <h1 data-scene-heading tabIndex={-1}>In every lifetime,<em>I’d still choose you.</em></h1>
          <p className="scene-subtitle">{config.finale.message}</p>
          <p className="finale-signature hand">{config.subtitles.finale}<br />{config.senderName}</p>
        </div>
        <figure className="finale-frame">
          <GardenImage photo={config.finale.photo ?? (config.demo ? { src: '/images/decorations/bouquet.webp', alt: 'A demo bouquet of pink roses on lace' } : undefined)}
            fallback="A place for the two of you" sizes="(min-width: 850px) 360px, 75vw" />
          <figcaption className="hand">{config.finale.photo?.caption ?? (config.demo ? 'A frame for your favorite photograph' : 'Always, you')}</figcaption>
        </figure>
      </div>
      <div className="action-row finale-actions">
        <button type="button" className="button primary" aria-disabled={download === 'working'} onClick={() => { void exportCard(); }}><Download size={17} /> Download Birthday Card</button>
        {memories && <button type="button" className="button ghost" onClick={memories}><Camera size={17} /> View Memories</button>}
        {replay && <button type="button" className="button ghost" onClick={replay}><RotateCcw size={17} /> Replay Story</button>}
        <MusicToggle />
      </div>
      <p className="status download-status" aria-live="polite">
        {download === 'working' && 'Creating your birthday card…'}
        {download === 'done' && 'Your birthday card is ready.'}
        {download === 'failed' && 'The card could not be created in this browser.'}
      </p>
    </section>
  );
}
