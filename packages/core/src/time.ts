/**
 * Time helpers shared across the ecosystem so every client and the server agree
 * on week boundaries (weekly XP, leaderboard). Pure, no I/O.
 */

/** Start of the ISO week — Monday 00:00:00.000 UTC — containing `date`. */
export function isoWeekStart(date: Date): Date {
  const day = date.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() + diff);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}
