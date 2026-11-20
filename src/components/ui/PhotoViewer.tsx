import { useRef, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { GardenPhoto } from '../../config/schema';
import { Dialog } from './Dialog';
import { GardenImage } from './GardenImage';

export function PhotoViewer({ photos, index, onChange, onClose }: { photos: GardenPhoto[]; index: number; onChange: (index: number) => void; onClose: () => void }) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const photo = photos[index];
  if (!photo) return null;
  const move = (direction: number) => onChange((index + direction + photos.length) % photos.length);
  const keys = (event: KeyboardEvent) => {
    if (photos.length < 2 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  };

  return (
    <Dialog title="Memory viewer" onClose={onClose} onKeyDown={keys}>
      <div className="photo-viewer">
        <div onTouchStart={(event) => { start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
          onTouchEnd={(event) => {
            const origin = start.current;
            start.current = null;
            if (!origin || photos.length < 2) return;
            const x = event.changedTouches[0].clientX - origin.x;
            const y = event.changedTouches[0].clientY - origin.y;
            if (Math.abs(x) > 42 && Math.abs(x) > Math.abs(y)) move(x < 0 ? 1 : -1);
          }}>
          <GardenImage photo={photo} eager sizes="(min-width: 750px) 600px, 90vw" className="viewer-photo" />
        </div>
        <div className="viewer-controls">
          {photos.length > 1 && <button type="button" className="icon-button" aria-label="Previous photograph" onClick={() => move(-1)}><ChevronLeft size={21} /></button>}
          <div className="viewer-caption" aria-live="polite">
            <span className="status">{index + 1} / {photos.length}{photo.date ? ` · ${photo.date}` : ''}</span>
            <p>{photo.caption ?? photo.alt}</p>
          </div>
          {photos.length > 1 && <button type="button" className="icon-button" aria-label="Next photograph" onClick={() => move(1)}><ChevronRight size={21} /></button>}
        </div>
        {photo.note && <p className="quiet viewer-note">{photo.note}</p>}
      </div>
    </Dialog>
  );
}
