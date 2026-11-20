import type { Gift } from '../config/schema';

const emptyGift: Gift = { type: 'text', title: 'A Rose for You', fallback: 'A little room for something lovely.' };

export function giftSlots(gifts: Gift[]) {
  return Array.from({ length: 3 }, (_, index) => gifts[index] ?? emptyGift);
}

export function isGiftLocked(index: number, opened: readonly number[], lockThird: boolean) {
  return index === 2 && lockThird && !(opened.includes(0) && opened.includes(1));
}
