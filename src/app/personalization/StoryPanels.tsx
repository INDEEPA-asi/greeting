import { Plus } from 'lucide-react';
import type { BirthdayConfig } from '../../config/schema';
import { chapters } from '../navigation/chapters';
import { Field, ListActions, TextField, optional, swapItems } from './EditorFields';

export type EditorPanelProps = { draft: BirthdayConfig; update: (patch: Partial<BirthdayConfig>) => void };

export function BasicsPanel({ draft, update }: EditorPanelProps) {
  return <>
    <div className="editor-columns">
      <TextField label="Her name" value={draft.girlfriendName} maxLength={80} onChange={(girlfriendName) => update({ girlfriendName })} />
      <TextField label="Your name" value={draft.senderName} maxLength={80} onChange={(senderName) => update({ senderName })} />
      <TextField label="Birthday" value={draft.birthdayDate} type="date" onChange={(birthdayDate) => update({ birthdayDate })} />
      <div>
        <TextField label="Time zone" value={draft.timezone} onChange={(timezone) => update({ timezone })} hint="For example, Asia/Colombo or Europe/London." />
        <button className="editor-button subtle" type="button" onClick={() => update({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })}>Use my device’s time zone</button>
      </div>
    </div>
    <label className="editor-check"><input type="checkbox" checked={draft.demo ?? false} onChange={(event) => update({ demo: event.target.checked })} /> Show the demo label</label>
    <fieldset className="editor-fieldset">
      <legend>Chapters to include</legend>
      <div className="editor-chapter-list">
        {chapters.map(({ id, title }) => (
          <label className="editor-check" key={id}><input type="checkbox" checked={draft.enabled[id] !== false}
            onChange={(event) => update({ enabled: { ...draft.enabled, [id]: event.target.checked } })} /> {title}</label>
        ))}
      </div>
    </fieldset>
  </>;
}

export function MessagesPanel({ draft, update }: EditorPanelProps) {
  return <>
    <fieldset className="editor-fieldset">
      <legend>Opening and birthday</legend>
      <TextField label="Opening headline, first line" value={draft.opening.firstLine} onChange={(firstLine) => update({ opening: { ...draft.opening, firstLine } })} />
      <TextField label="Opening headline, second line" value={draft.opening.secondLine} onChange={(secondLine) => update({ opening: { ...draft.opening, secondLine } })} />
      <TextField label="Opening message" value={draft.opening.message} onChange={(message) => update({ opening: { ...draft.opening, message } })} />
      <TextField label="Message after blowing out the candles" value={draft.candleMessage} multiline onChange={(candleMessage) => update({ candleMessage })} />
    </fieldset>
    <fieldset className="editor-fieldset">
      <legend>Love letter</legend>
      {draft.letter.map((paragraph, index) => <div className="editor-paragraph" key={index}>
        <TextField label={`Paragraph ${index + 1}`} value={paragraph} multiline
          onChange={(value) => update({ letter: draft.letter.map((item, position) => position === index ? value : item) })} />
        <ListActions label={`paragraph ${index + 1}`} index={index} count={draft.letter.length}
          move={(direction) => update({ letter: swapItems(draft.letter, index, direction) })}
          remove={() => update({ letter: draft.letter.filter((_item, position) => position !== index) })} />
      </div>)}
      <button type="button" className="editor-button secondary" onClick={() => update({ letter: [...draft.letter, ''] })}><Plus size={17} /> Add paragraph</button>
    </fieldset>
    <fieldset className="editor-fieldset">
      <legend>Wish and finale</legend>
      <TextField label="Message after releasing the lantern" value={draft.wishMessage} multiline onChange={(value) => update({ wishMessage: optional(value) })} />
      <TextField label="Final message" value={draft.finale.message} multiline onChange={(message) => update({ finale: { ...draft.finale, message } })} />
    </fieldset>
    <details className="editor-details">
      <summary>Edit chapter subtitles</summary>
      <div className="editor-columns">
        {chapters.map(({ id, title }) => id === 'gate' ? null : <TextField key={id} label={title} value={draft.subtitles[id]}
          onChange={(value) => update({ subtitles: { ...draft.subtitles, [id]: optional(value) } })} />)}
      </div>
    </details>
  </>;
}

const colors = { ivory: 'Ivory', blush: 'Blush', dusty: 'Dusty rose', rose: 'Deep rose', gold: 'Rose gold', plum: 'Plum', white: 'Soft white' };

export function ColorsPanel({ draft, update }: EditorPanelProps) {
  const colorKeys = Object.keys(colors) as (keyof typeof colors)[];
  return <div className="editor-palette">
    {colorKeys.map((color) => (
      <Field key={color} label={colors[color]}>{(id) => (
        <div className="editor-swatch">
          <input id={id} type="color" value={draft.theme[color]} onChange={(event) => update({ theme: { ...draft.theme, [color]: event.target.value } })} />
          <span>{draft.theme[color].toUpperCase()}</span>
        </div>
      )}</Field>
    ))}
  </div>;
}
