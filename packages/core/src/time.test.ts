import { describe, expect, it } from 'vitest';

import { isoWeekStart } from './time';

describe('isoWeekStart', () => {
  const iso = (d: Date) => d.toISOString();

  it('returns Monday 00:00 UTC for a midweek date', () => {
    // Wed 2026-06-10T14:30Z -> Mon 2026-06-08T00:00Z
    expect(iso(isoWeekStart(new Date('2026-06-10T14:30:00.000Z')))).toBe('2026-06-08T00:00:00.000Z');
  });

  it('treats Sunday as the last day of the week, not the first', () => {
    // Sun 2026-06-14 -> Mon 2026-06-08
    expect(iso(isoWeekStart(new Date('2026-06-14T23:59:59.000Z')))).toBe('2026-06-08T00:00:00.000Z');
  });

  it('returns the same Monday at the start of the day for Monday itself', () => {
    expect(iso(isoWeekStart(new Date('2026-06-08T09:00:00.000Z')))).toBe('2026-06-08T00:00:00.000Z');
  });

  it('does not mutate its argument', () => {
    const input = new Date('2026-06-10T14:30:00.000Z');
    isoWeekStart(input);
    expect(iso(input)).toBe('2026-06-10T14:30:00.000Z');
  });
});
