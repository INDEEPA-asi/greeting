export const chapters = [
  { id: 'gate', title: 'The Enchanted Gate', tone: 'dark', motif: 'petals', duration: 1800 },
  { id: 'birthday', title: 'The Birthday Bloom', tone: 'light', motif: 'sparks', duration: 1600 },
  { id: 'memories', title: 'Our Garden of Memories', tone: 'light', motif: 'frame', duration: 1500 },
  { id: 'timeline', title: 'The Path We Walked', tone: 'light', motif: 'thread', duration: 1700 },
  { id: 'letter', title: 'A Letter Among the Roses', tone: 'light', motif: 'seal', duration: 1500 },
  { id: 'gifts', title: 'The Secret Gift Pavilion', tone: 'light', motif: 'ribbon', duration: 1900 },
  { id: 'wish', title: 'The Wishing Fountain', tone: 'dark', motif: 'lantern', duration: 2200 },
  { id: 'finale', title: 'The Forever Garden', tone: 'dark', motif: 'petals', duration: 1600 },
] as const;

export type Chapter = (typeof chapters)[number];
export type ChapterId = Chapter['id'];

export function enabledChapters(flags: Partial<Record<ChapterId, boolean>>) {
  const enabled = chapters.filter(({ id }) => flags[id] !== false);
  return enabled.length ? enabled : [chapters[0]];
}
