import { useId, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Paperclip, Trash2 } from 'lucide-react';
import type { GardenPhoto } from '../../config/schema';
import { GardenImage } from '../../components/ui/GardenImage';
import { assetName, mediaFormats, photoFromFile, type AssetLibrary, type MediaKind } from './assets';

export type EditorMedia = {
  assets: AssetLibrary;
  attach: (files: File[], kind: MediaKind) => { file: File; path: string }[];
};

export const optional = (value: string) => value.trim() ? value : undefined;

type FieldProps = { label: string; hint?: string; children: (id: string, hintId?: string) => ReactNode };

export function Field({ label, hint, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return <div className="editor-field">
    <label htmlFor={id}>{label}</label>
    {children(id, hintId)}
    {hint && <small id={hintId}>{hint}</small>}
  </div>;
}

export function TextField({ label, value, onChange, hint, type = 'text', multiline, maxLength }: {
  label: string; value?: string; onChange: (value: string) => void; hint?: string;
  type?: 'date' | 'text'; multiline?: boolean; maxLength?: number;
}) {
  return <Field label={label} hint={hint}>{(id, hintId) => multiline
    ? <textarea id={id} aria-describedby={hintId} value={value ?? ''} onChange={(event) => onChange(event.target.value)} rows={4} />
    : <input id={id} aria-describedby={hintId} type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} maxLength={maxLength} />
  }</Field>;
}

export function FilePicker({ label, kind, multiple, onPick }: { label: string; kind: MediaKind; multiple?: boolean; onPick: (files: File[]) => void }) {
  const id = useId();
  const Icon = kind === 'image' ? ImagePlus : Paperclip;
  return <div className="editor-file">
    <input id={id} className="sr-only" type="file" accept={mediaFormats[kind]} multiple={multiple} onChange={(event) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';
      if (files.length) onPick(files);
    }} />
    <label htmlFor={id} className="editor-button secondary"><Icon size={17} aria-hidden="true" />{label}</label>
  </div>;
}

export function PhotoEditor({ title, photo, onChange, media, canRemove = true }: {
  title: string; photo?: GardenPhoto; onChange: (photo?: GardenPhoto) => void; media: EditorMedia; canRemove?: boolean;
}) {
  const preview = photo && { ...photo, src: media.assets.get(photo.src)?.url ?? photo.src, variants: undefined };
  return <div className="editor-photo">
    <GardenImage photo={preview} decorative fallback="Choose a photo" />
    <div className="editor-photo-fields">
      <div className="editor-file-row">
        <FilePicker label={photo ? `Replace ${title}` : `Choose ${title}`} kind="image" onPick={(files) => {
          const item = media.attach(files, 'image')[0];
          if (item) onChange(photoFromFile(item.path, item.file, photo));
        }} />
        {photo && canRemove && <button className="editor-button subtle" type="button" onClick={() => onChange(undefined)}>Remove {title}</button>}
      </div>
      {photo && <>
        <p className="editor-filename">{assetName(photo.src, media.assets)}</p>
        <TextField label="Alt text" value={photo.alt} onChange={(alt) => onChange({ ...photo, alt })} hint="Briefly describe what’s in the photo." />
        <TextField label="Caption" value={photo.caption} onChange={(caption) => onChange({ ...photo, caption: optional(caption) })} />
        <TextField label="Date or date label" value={photo.date} onChange={(date) => onChange({ ...photo, date: optional(date) })} />
        <TextField label="Short note" value={photo.note} onChange={(note) => onChange({ ...photo, note: optional(note) })} multiline />
      </>}
    </div>
  </div>;
}

export function MediaInput({ label, kind, src, onChange, media }: {
  label: string; kind: Exclude<MediaKind, 'image'>; src?: string;
  onChange: (src?: string) => void; media: EditorMedia;
}) {
  return <div className="editor-media">
    <div className="editor-file-row">
      <FilePicker label={src ? `Replace ${label}` : `Choose ${label}`} kind={kind} onPick={(files) => {
        const item = media.attach(files, kind)[0];
        if (item) onChange(item.path);
      }} />
      {src && <button className="editor-button subtle" type="button" onClick={() => onChange(undefined)}>Remove {label}</button>}
    </div>
    {src && <p className="editor-filename">{assetName(src, media.assets)}</p>}
  </div>;
}

export function ListActions({ label, index, count, move, remove }: {
  label: string; index: number; count: number; move: (direction: number) => void; remove: () => void;
}) {
  return <div className="editor-list-actions">
    <button className="editor-icon" type="button" disabled={!index} aria-label={`Move ${label} up`} onClick={() => move(-1)}><ArrowUp size={16} /></button>
    <button className="editor-icon" type="button" disabled={index === count - 1} aria-label={`Move ${label} down`} onClick={() => move(1)}><ArrowDown size={16} /></button>
    <button className="editor-icon" type="button" aria-label={`Remove ${label}`} onClick={remove}><Trash2 size={16} /></button>
  </div>;
}

export function swapItems<T>(items: T[], index: number, direction: number) {
  const moved = [...items];
  const target = index + direction;
  [moved[index], moved[target]] = [moved[target], moved[index]];
  return moved;
}
