import { useState } from 'react';
import { Gift as GiftIcon, LockKeyhole } from 'lucide-react';
import { Scene, SceneTitle } from '../components/layout/Scene';
import { Dialog } from '../components/ui/Dialog';
import { GardenImage } from '../components/ui/GardenImage';
import { GiftMedia } from '../components/ui/GiftMedia';
import { giftSlots, isGiftLocked } from '../lib/gifts';
import type { Gift, ValidatedBirthday } from '../config/schema';

function GiftContent({ gift }: { gift: Gift }) {
  if (gift.type === 'photo' && gift.photo) return <><GardenImage photo={gift.photo} eager className="gift-photo" /><p className="gift-message">{gift.photo.note ?? gift.fallback}</p></>;
  if ((gift.type === 'voice' || gift.type === 'video') && gift.src) return <GiftMedia gift={{ ...gift, src: gift.src }} />;
  return <p className="gift-message">{gift.type === 'text' ? gift.message ?? gift.fallback : gift.fallback}</p>;
}

export default function GiftPavilion({ config, opened, onOpen }: { config: ValidatedBirthday; opened: number[]; onOpen: (index: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const gifts = giftSlots(config.gifts);
  return (
    <Scene className="gift-scene">
      <SceneTitle chapter="Wrapped with Love" title="The Secret Gift Pavilion" subtitle={config.subtitles.gifts} />
      <ul className="gift-grid">
        {gifts.map((gift, index) => {
          const locked = isGiftLocked(index, opened, config.lockThirdGift);
          const wasOpened = opened.includes(index);
          return (
            <li key={index}>
              <button type="button" className={`gift-button gift-${index}`} aria-disabled={locked}
                aria-describedby={locked ? 'gift-lock-help' : undefined} onClick={() => {
                  if (locked) return;
                  onOpen(index);
                  setSelected(index);
                }}>
                <span className={`gift-box ${wasOpened ? 'unwrapped' : ''}`} aria-hidden="true">
                  <i className="gift-loop left" /><i className="gift-loop right" /><i className="gift-body" /><i className="gift-lid" />
                  <i className="gift-label">{locked ? <LockKeyhole size={17} /> : <GiftIcon size={19} />}</i>
                </span>
                <span className="gift-title"><span className="sr-only">Open </span>{gift.title}</span>
                <span className="status">{locked ? 'Locked' : wasOpened ? 'Open again' : 'Unwrap gift'}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {isGiftLocked(2, opened, config.lockThirdGift) && <p className="status gift-lock-help" id="gift-lock-help">Open the first two gifts to unlock the last one.</p>}
      {selected !== null && (
        <Dialog title={gifts[selected].title} onClose={() => setSelected(null)}>
          <div className="gift-dialog-content">
            <div className="gift-glints" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <GiftContent gift={gifts[selected]} />
          </div>
        </Dialog>
      )}
    </Scene>
  );
}
