import { useState } from 'react';
import { Expand } from 'lucide-react';
import { Scene, SceneTitle } from '../components/layout/Scene';
import { GardenImage } from '../components/ui/GardenImage';
import { PhotoViewer } from '../components/ui/PhotoViewer';
import { Reveal } from '../components/effects/Reveal';
import type { ValidatedBirthday } from '../config/schema';

export default function MemoryGarden({ config }: { config: ValidatedBirthday }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <Scene className="memory-scene">
      <SceneTitle chapter="The Scrapbook" title="Our Garden of Memories" subtitle={config.subtitles.memories} />
      {config.photos.length ? (
        <ul className="scrapbook">
          {config.photos.map((photo, index) => (
            <li key={`${photo.src}-${index}`}>
              <Reveal>
                <button type="button" className="polaroid" onClick={() => setSelected(index)}>
                  <span className="sr-only">Open photograph </span>
                  <span className="photo-tape" aria-hidden="true" />
                  <GardenImage as="span" photo={photo} sizes="(min-width: 850px) 32vw, (min-width: 540px) 46vw, 90vw" />
                  <span className="polaroid-caption"><span>{photo.caption ?? photo.alt}</span><Expand size={16} aria-hidden="true" /></span>
                  {photo.date && <span className="polaroid-date">{photo.date}</span>}
                </button>
                {photo.note && <p className="polaroid-note">{photo.note}</p>}
              </Reveal>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-scrapbook">
          <GardenImage fallback="Room for the memories still to come" />
          <p className="hand">A page for a favorite day</p>
          <p className="status">Demo card · Add a photograph and a little note to make this page yours.</p>
        </div>
      )}
      {selected !== null && <PhotoViewer photos={config.photos} index={selected} onChange={setSelected} onClose={() => setSelected(null)} />}
    </Scene>
  );
}
