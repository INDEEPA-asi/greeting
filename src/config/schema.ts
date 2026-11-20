import { z } from 'zod/mini';
import { isCalendarDate, isTimeZone } from '../lib/dates';

export function isAssetPath(value: string) {
  const local = /^\/(?:[a-z\d_.-]+\/)*[a-z\d_.-]+$/i.test(value) &&
    value.split('/').every((segment) => segment !== '..' && segment !== '.');
  if (local) return true;
  if (!/^https:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

const path = z.string().check(z.refine(isAssetPath, 'Use a root-relative asset path or an explicit HTTPS URL.'));
const color = z.string().check(z.regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color.'));
const text = z.string().check(z.trim(), z.minLength(1));
const name = text.check(z.maxLength(80));
const pixelWidth = z.int().check(z.positive());
const chapterFlags = z.strictObject({
  gate: z.optional(z.boolean()), birthday: z.optional(z.boolean()), memories: z.optional(z.boolean()),
  timeline: z.optional(z.boolean()), letter: z.optional(z.boolean()), gifts: z.optional(z.boolean()),
  wish: z.optional(z.boolean()), finale: z.optional(z.boolean()),
});
const subtitles = z.strictObject({
  birthday: z.optional(text), memories: z.optional(text), timeline: z.optional(text),
  letter: z.optional(text), gifts: z.optional(text), wish: z.optional(text), finale: z.optional(text),
});

export const imageSchema = z.object({
  src: path, alt: text, caption: z.optional(text), date: z.optional(text), note: z.optional(text),
  width: z.optional(pixelWidth),
  variants: z.optional(z.array(z.object({ src: path, width: pixelWidth }))),
});
const giftBase = z.object({ title: text, fallback: text });
const giftSchema = z.discriminatedUnion('type', [
  z.extend(giftBase, { type: z.literal('text'), message: z.optional(text) }),
  z.extend(giftBase, { type: z.literal('photo'), photo: z.optional(imageSchema) }),
  z.extend(giftBase, { type: z.literal('voice'), src: z.optional(path), transcript: z.optional(text) }),
  z.extend(giftBase, { type: z.literal('video'), src: z.optional(path), transcript: z.optional(text), captions: z.optional(path) }),
]).check(z.superRefine((gift, ctx) => {
  if ((gift.type === 'voice' || gift.type === 'video') && gift.src && !gift.transcript) {
    ctx.addIssue({ code: 'custom', path: ['transcript'], message: 'Provide a transcript for this recording.' });
  }
}));

export const birthdaySchema = z.object({
  demo: z._default(z.boolean(), false),
  girlfriendName: name, senderName: name,
  birthdayDate: z.string().check(z.refine(isCalendarDate, 'Enter a valid date in YYYY-MM-DD format.')),
  timezone: z.string().check(z.refine(isTimeZone, 'Use an IANA time zone, such as Asia/Colombo.')),
  theme: z.object({ ivory: color, blush: color, dusty: color, rose: color, gold: color, plum: color, white: color }),
  enabled: chapterFlags, subtitles,
  opening: z.object({ firstLine: text, secondLine: text, message: text }),
  candleMessage: text,
  photos: z.array(imageSchema),
  timeline: z.array(z.object({ date: text, title: text, message: text, photo: z.optional(imageSchema) })),
  letter: z.array(text),
  gifts: z.array(giftSchema).check(z.maxLength(3)),
  lockThirdGift: z.boolean(),
  wishMessage: z.optional(text),
  finale: z.object({ message: text, photo: z.optional(imageSchema) }),
  audio: z.object({
    tracks: z.array(z.object({ id: text, title: text, src: path })).check(z.superRefine((tracks, ctx) => {
      if (new Set(tracks.map((track) => track.id)).size !== tracks.length) {
        ctx.addIssue({ code: 'custom', message: 'Give each track a unique ID.' });
      }
    })),
    selected: z.optional(text),
  }),
}).check(z.superRefine((config, ctx) => {
  if (config.audio.selected && !config.audio.tracks.some((track) => track.id === config.audio.selected)) {
    ctx.addIssue({ code: 'custom', path: ['audio', 'selected'], message: 'Choose the ID of an existing track.' });
  }
}));

export type BirthdayConfig = z.input<typeof birthdaySchema>;
export type ValidatedBirthday = z.output<typeof birthdaySchema>;
export type GardenPhoto = z.output<typeof imageSchema>;
export type Gift = z.output<typeof giftSchema>;
export type Track = ValidatedBirthday['audio']['tracks'][number];
