import { describe, expect, it } from 'vitest';
import { birthdayExample } from '../config/birthday.example';
import { birthdaySchema, isAssetPath } from '../config/schema';
import { birthdayLabel, isCalendarDate, isTimeZone } from '../lib/dates';

describe('personalization', () => {
  it('validates the demo and allows entirely optional content to be omitted', () => {
    expect(birthdaySchema.safeParse(birthdayExample).success).toBe(true);
    expect(birthdaySchema.safeParse({
      ...birthdayExample, photos: [], letter: [], timeline: [], gifts: [], audio: { tracks: [] },
    }).success).toBe(true);
  });

  it('requires accessible images and transcripts for configured recordings', () => {
    const invalid = birthdaySchema.safeParse({
      ...birthdayExample,
      photos: [{ src: '/images/sample.webp', alt: '' }],
      gifts: [{ type: 'video', title: 'Gift', src: '/videos/message.mp4', fallback: 'Love' }],
    });
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(invalid.error.issues.map(({ path }) => path.join('.'))).toEqual(
      expect.arrayContaining(['photos.0.alt', 'gifts.0.transcript']),
    );
  });

  it('rejects invalid colors, tracks, date, and time zone', () => {
    expect(birthdaySchema.safeParse({
      ...birthdayExample, birthdayDate: '2025-02-29', timezone: 'Nowhere/Imaginary',
      theme: { ...birthdayExample.theme, plum: 'url(example)' }, audio: { tracks: [], selected: 'unknown' },
    }).success).toBe(false);
  });

  it.each([
    ['/images/memories/rose.webp', true], ['https://example.com/rose.webp', true], ['/../secret.txt', false],
    ['//host/image.png', false], ['javascript:alert(1)', false], ['/images/%2e%2e/private', false],
    ['https://name:secret@example.com/rose.webp', false], ['blob:example', false],
  ])('accepts or rejects %s', (path, valid) => expect(isAssetPath(path)).toBe(valid));
});

describe('birthday dates', () => {
  it('recognizes true calendar dates and time zones', () => {
    expect(isCalendarDate('2000-02-29')).toBe(true);
    expect(isCalendarDate('1900-02-29')).toBe(false);
    expect(isCalendarDate('2026-04-31')).toBe(false);
    expect(isTimeZone('Asia/Colombo')).toBe(true);
    expect(birthdayLabel('2026-02-30', 'UTC')).toBeNull();
  });

  it('compares calendar days in the configured time zone', () => {
    const instant = new Date('2026-11-20T20:00:00Z');
    expect(birthdayLabel('2000-11-21', 'Asia/Colombo', instant)).toBe('Birthday today · November 21');
    expect(birthdayLabel('2000-11-21', 'America/Los_Angeles', instant)).toBe('November 21');
  });
});
