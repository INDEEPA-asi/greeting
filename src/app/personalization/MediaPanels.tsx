import { Plus, Trash2 } from 'lucide-react';
import { birthdayExample } from '../../config/birthday.example';
import type { Gift, Track } from '../../config/schema';
import { assetName, photoFromFile } from './assets';
import { Field, FilePicker, ListActions, MediaInput, PhotoEditor, TextField, optional, swapItems, type EditorMedia } from './EditorFields';
import type { EditorPanelProps } from './StoryPanels';

type MediaPanelProps = EditorPanelProps & { media: EditorMedia };

export function PhotosPanel({ draft, update, media }: MediaPanelProps) {
  const demoSources: string[] = birthdayExample.photos.map(({ src }) => src);
  const hasSamples = draft.photos.some(({ src }) => demoSources.includes(src));
  return <>
    <div className="editor-file-row">
      <FilePicker label="Add scrapbook photos" kind="image" multiple onPick={(files) => {
        const added = media.attach(files, 'image').map(({ file, path }) => photoFromFile(path, file));
        update({ photos: [...draft.photos, ...added] });
      }} />
      {hasSamples && <button type="button" className="editor-button subtle" onClick={() => update({ photos: draft.photos.filter(({ src }) => !demoSources.includes(src)) })}>Remove sample photos</button>}
    </div>
    {draft.photos.length ? draft.photos.map((photo, index) => <article className="editor-card" key={`${photo.src}-${index}`}>
      <div className="editor-card-heading">
        <h3>{photo.caption || assetName(photo.src, media.assets)}</h3>
        <ListActions label={`photo ${index + 1}`} index={index} count={draft.photos.length}
          move={(direction) => update({ photos: swapItems(draft.photos, index, direction) })}
          remove={() => update({ photos: draft.photos.filter((_item, position) => position !== index) })} />
      </div>
      <PhotoEditor title="photo" photo={photo} media={media} canRemove={false}
        onChange={(replacement) => { if (replacement) update({ photos: draft.photos.map((item, position) => position === index ? replacement : item) }); }} />
    </article>) : <p className="editor-empty">Add a few favorite photos to start the scrapbook.</p>}
    <fieldset className="editor-fieldset">
      <legend>Finale and birthday card</legend>
      <PhotoEditor title="finale photo" photo={draft.finale.photo} media={media}
        onChange={(photo) => update({ finale: { ...draft.finale, photo } })} />
    </fieldset>
  </>;
}

export function TimelinePanel({ draft, update, media }: MediaPanelProps) {
  return <>
    {draft.timeline.map((milestone, index) => {
      const change = (fields: Partial<typeof milestone>) => update({
        timeline: draft.timeline.map((item, position) => position === index ? { ...item, ...fields } : item),
      });
      return <article className="editor-card" key={index}>
        <div className="editor-card-heading">
          <h3>Moment {index + 1}</h3>
          <ListActions label={`moment ${index + 1}`} index={index} count={draft.timeline.length}
            move={(direction) => update({ timeline: swapItems(draft.timeline, index, direction) })}
            remove={() => update({ timeline: draft.timeline.filter((_item, position) => position !== index) })} />
        </div>
        <div className="editor-columns">
          <TextField label="Title" value={milestone.title} onChange={(title) => change({ title })} />
          <TextField label="Date or date label" value={milestone.date} onChange={(date) => change({ date })} />
        </div>
        <TextField label="Memory" value={milestone.message} multiline onChange={(message) => change({ message })} />
        <details className="editor-details" open={milestone.photo ? true : undefined}>
          <summary>Optional photo</summary>
          <PhotoEditor title="moment photo" photo={milestone.photo} media={media} onChange={(photo) => change({ photo })} />
        </details>
      </article>;
    })}
    <button type="button" className="editor-button secondary" onClick={() => update({ timeline: [...draft.timeline, { date: '', title: '', message: '' }] })}><Plus size={17} /> Add moment</button>
  </>;
}

const giftTypes = { text: 'Written message', photo: 'Photo', voice: 'Voice note', video: 'Video' };

function GiftFields({ gift, media, change }: { gift: Gift; media: EditorMedia; change: (gift: Gift) => void }) {
  return <>
    <div className="editor-columns">
      <TextField label="Gift title" value={gift.title} onChange={(title) => change({ ...gift, title })} />
      <Field label="Gift type">{(id) => (
        <select id={id} value={gift.type} onChange={(event) => change({ type: event.target.value as Gift['type'], title: gift.title, fallback: gift.fallback })}>
          {Object.entries(giftTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      )}</Field>
    </div>
    {gift.type === 'text' && <TextField label="Gift message" value={gift.message} multiline onChange={(value) => change({ ...gift, message: optional(value) })} />}
    {gift.type === 'photo' && <PhotoEditor title="gift photo" photo={gift.photo} media={media} onChange={(photo) => change({ ...gift, photo })} />}
    {(gift.type === 'voice' || gift.type === 'video') && <>
      <MediaInput label={gift.type === 'voice' ? 'voice note' : 'video'} kind={gift.type === 'voice' ? 'audio' : 'video'}
        src={gift.src} media={media} onChange={(src) => change({ ...gift, src })} />
      {gift.type === 'video' && <MediaInput label="captions (.vtt)" kind="captions" src={gift.captions} media={media} onChange={(captions) => change({ ...gift, captions })} />}
      <TextField label="Transcript" value={gift.transcript} multiline hint="Required when you attach a recording." onChange={(value) => change({ ...gift, transcript: optional(value) })} />
    </>}
    <TextField label={gift.type === 'text' ? 'Fallback message' : 'Message shown if the file is unavailable'} value={gift.fallback} multiline
      onChange={(fallback) => change({ ...gift, fallback })} />
  </>;
}

export function GiftsPanel({ draft, update, media }: MediaPanelProps) {
  return <>
    <label className="editor-check"><input type="checkbox" checked={draft.lockThirdGift} onChange={(event) => update({ lockThirdGift: event.target.checked })} /> Unlock the third gift after the first two are opened</label>
    {draft.gifts.map((gift, index) => <article className="editor-card" key={index}>
      <div className="editor-card-heading">
        <h3>Gift {index + 1}</h3>
        <ListActions label={`gift ${index + 1}`} index={index} count={draft.gifts.length}
          move={(direction) => update({ gifts: swapItems(draft.gifts, index, direction) })}
          remove={() => update({ gifts: draft.gifts.filter((_item, position) => position !== index) })} />
      </div>
      <GiftFields gift={gift} media={media} change={(replacement) => update({
        gifts: draft.gifts.map((item, position) => position === index ? replacement : item),
      })} />
    </article>)}
    {draft.gifts.length < 3 && <button type="button" className="editor-button secondary" onClick={() => update({
      gifts: [...draft.gifts, { title: '', type: 'text', fallback: 'A little something, just for you.' }],
    })}><Plus size={17} /> Add gift</button>}
  </>;
}

export function MusicPanel({ draft, update, media }: MediaPanelProps) {
  function setTracks(tracks: Track[]) {
    const selected = tracks.some(({ id }) => id === draft.audio.selected) ? draft.audio.selected : tracks[0]?.id;
    update({ audio: { tracks, selected } });
  }

  return <>
    <FilePicker label="Add music tracks" kind="audio" multiple onPick={(files) => {
      const tracks = media.attach(files, 'audio').map(({ file, path }) => ({ id: path, title: file.name.replace(/\.[^.]+$/, ''), src: path }));
      setTracks([...draft.audio.tracks, ...tracks]);
    }} />
    {draft.audio.tracks.map((track, index) => <article className="editor-card" key={track.id}>
      <div className="editor-card-heading">
        <h3>Track {index + 1}</h3>
        <button type="button" className="editor-icon" aria-label={`Remove track ${index + 1}`} onClick={() => setTracks(draft.audio.tracks.filter(({ id }) => id !== track.id))}><Trash2 size={16} /></button>
      </div>
      <TextField label="Track name" value={track.title} onChange={(title) => setTracks(draft.audio.tracks.map((item) => item.id === track.id ? { ...track, title } : item))} />
      <p className="editor-filename">{assetName(track.src, media.assets)}</p>
    </article>)}
    {!!draft.audio.tracks.length && <Field label="Starting track">{(id) => (
      <select id={id} value={draft.audio.selected ?? draft.audio.tracks[0]?.id} onChange={(event) => update({ audio: { ...draft.audio, selected: event.target.value } })}>
        {draft.audio.tracks.map((track) => <option key={track.id} value={track.id}>{track.title || 'Untitled track'}</option>)}
      </select>
    )}</Field>}
    {!draft.audio.tracks.length && <p className="editor-empty">Music is optional. The garden works beautifully without a track.</p>}
  </>;
}
