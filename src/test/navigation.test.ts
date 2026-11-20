import { describe, expect, it } from 'vitest';
import { enabledChapters } from '../app/navigation/chapters';
import { initialNavigation, navigationReducer } from '../app/navigation/reducer';
import { giftSlots, isGiftLocked } from '../lib/gifts';

describe('story progression', () => {
  it('only commits the destination after coverage and ignores competing requests', () => {
    const first = navigationReducer(initialNavigation('gate'), { type: 'navigate', to: 'birthday' });
    expect(first).toMatchObject({ phase: 'exiting', current: 'gate', target: 'birthday' });
    expect(navigationReducer(first, { type: 'navigate', to: 'memories' })).toBe(first);
    expect(navigationReducer(first, { type: 'covered', revision: 0 })).toBe(first);
    const covered = navigationReducer(first, { type: 'covered', revision: first.revision });
    expect(covered).toMatchObject({ phase: 'entering', current: 'birthday' });
    expect(navigationReducer(covered, { type: 'revealed', revision: first.revision })).toMatchObject({ phase: 'idle', target: null });
  });

  it('skips pending work and invalidates its completion event', () => {
    const first = navigationReducer(initialNavigation('gate'), { type: 'navigate', to: 'birthday' });
    const skipped = navigationReducer(first, { type: 'skip' });
    expect(skipped).toMatchObject({ current: 'birthday', phase: 'idle' });
    expect(navigationReducer(skipped, { type: 'revealed', revision: 1 })).toBe(skipped);
    expect(navigationReducer(skipped, { type: 'navigate', to: 'gate', immediate: true })).toMatchObject({ current: 'gate', phase: 'idle' });
  });

  it('honors chapter choices and keeps the gate available for a completely empty story', () => {
    expect(enabledChapters({ gate: false, birthday: false })[0].id).toBe('memories');
    expect(enabledChapters({ gate: false, birthday: false, memories: false, timeline: false, letter: false, gifts: false, wish: false, finale: false }).map(({ id }) => id)).toEqual(['gate']);
  });
});

describe('gift slots', () => {
  it('unlocks the third gift after the other two or when the mechanic is disabled', () => {
    expect(isGiftLocked(0, [], true)).toBe(false);
    expect(isGiftLocked(2, [0, 0], true)).toBe(true);
    expect(isGiftLocked(2, [1, 0], true)).toBe(false);
    expect(isGiftLocked(2, [], false)).toBe(false);
  });

  it('fills empty gift content with readable local placeholders', () => {
    expect(giftSlots([])).toHaveLength(3);
    expect(giftSlots([]).every(({ type, fallback }) => type === 'text' && fallback.length > 0)).toBe(true);
  });
});
