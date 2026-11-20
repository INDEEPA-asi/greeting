import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ValidatedBirthday } from '../config/schema';
import { GildedFrame, Ornament } from '../components/ui/Ornaments';

export function EnchantedGate({ config, enter, busy }: { config: ValidatedBirthday; enter?: () => void; busy: boolean }) {
  const [loading, setLoading] = useState(true);
  const ready = () => setLoading(false);
  return (
    <section className={`gate ${busy ? 'gate-opening' : ''}`}>
      <picture className="gate-art" aria-hidden="true">
        <source media="(max-width: 600px)" srcSet="/images/decorations/rosebud-mobile.webp" />
        <img src="/images/decorations/rosebud.webp" srcSet="/images/decorations/rosebud-medium.webp 900w, /images/decorations/rosebud.webp 1536w"
          sizes="100vw" fetchPriority="high" alt="" onLoad={ready} onError={ready} ref={(node) => { if (node?.complete) ready(); }} />
      </picture>
      {busy && <picture className="gate-art gate-open-rose" aria-hidden="true">
        <source media="(max-width: 600px)" srcSet="/images/decorations/rose-garden-mobile.webp" />
        <img src="/images/decorations/rose-garden.webp" srcSet="/images/decorations/rose-garden-medium.webp 900w, /images/decorations/rose-garden.webp 1536w" sizes="100vw" alt="" />
      </picture>}
      <div className="gate-shade" aria-hidden="true" />
      <div className="gate-inset"><GildedFrame /></div>
      <p className="gate-kicker"><span /> A Garden That Blooms for You <span /></p>
      <div className="gate-glow" aria-hidden="true" />
      <div className="gate-dust" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <div className="gate-content">
        <Ornament />
        <h1 tabIndex={-1} data-scene-heading>{config.opening.firstLine}<em>{config.opening.secondLine}</em></h1>
        <p className="gate-subtitle">{config.opening.message}</p>
        {enter && <button className="button primary gate-button" type="button" aria-disabled={busy} onClick={enter}>
          Enter Our Garden <ChevronRight size={17} strokeWidth={1.5} />
        </button>}
        {loading && <span className="gate-loading" role="status">Preparing the garden…</span>}
      </div>
    </section>
  );
}
