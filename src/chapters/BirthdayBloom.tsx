import { Sparkles } from 'lucide-react';
import { Scene, SceneTitle } from '../components/layout/Scene';
import type { ValidatedBirthday } from '../config/schema';
import { birthdayLabel } from '../lib/dates';

const candles = [
  [33.5, 23], [41.95, 26.4], [50.6, 18.3], [61.35, 26.1], [68, 23],
];

export default function BirthdayBloom({ config, blown, onBlow }: { config: ValidatedBirthday; blown: boolean; onBlow: () => void }) {
  const date = birthdayLabel(config.birthdayDate, config.timezone);
  return (
    <Scene className="birthday-scene">
      <div className="birthday-copy">
        <SceneTitle chapter="The Birthday Bloom" title={`Happy Birthday, ${config.girlfriendName}`} subtitle={config.subtitles.birthday} />
        {date && <p className="birthday-date"><time dateTime={config.birthdayDate}>{date}</time>{config.demo ? ' · Demo date' : ''}</p>}
        <div className="cake-actions">
          <button className="button primary" type="button" aria-disabled={blown} onClick={() => { if (!blown) onBlow(); }}>
            <Sparkles size={17} /> {blown ? 'Candles blown out' : 'Blow Out the Candles'}
          </button>
          <div className="candle-message" aria-live="polite">{blown && <p>{config.candleMessage}</p>}</div>
        </div>
      </div>
      <figure className="cake-frame">
        <div className={`cake-photo ${blown ? 'candles-out' : ''}`}>
          <img src="/images/decorations/cake.webp" srcSet="/images/decorations/cake-small.webp 384w, /images/decorations/cake.webp 768w" sizes="(min-width: 840px) 48vw, 92vw" decoding="async" alt="Ivory birthday cake with pink roses and five candles" />
          {candles.map(([left, top], index) => <span className="flame" key={left} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -0.14}s` }} aria-hidden="true" />)}
          {blown && <div className="cake-sparks" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ left: `${32 + i * 4}%`, animationDelay: `${i * .045}s` }} />)}</div>}
        </div>
        <figcaption className="hand">{blown ? 'A wish for the year ahead' : 'Make a little birthday magic'}</figcaption>
      </figure>
    </Scene>
  );
}
