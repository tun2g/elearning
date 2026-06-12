/**
 * Streak logic — a core ecosystem concept shared by web, mobile (and later the bot).
 * Pure functions, no I/O, so every client computes streaks identically.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDay(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS);
}

export interface StreakState {
  current: number;
  longest: number;
  lastActiveDay: number | null; // UTC day index
}

export const initialStreak: StreakState = {
  current: 0,
  longest: 0,
  lastActiveDay: null,
};

/** Apply a practice event on `now`, returning the next streak state. */
export function recordActivity(state: StreakState, now: Date): StreakState {
  const day = toUtcDay(now);
  if (state.lastActiveDay === day) return state; // already counted today

  const isConsecutive = state.lastActiveDay === day - 1;
  const current = isConsecutive ? state.current + 1 : 1;

  return {
    current,
    longest: Math.max(state.longest, current),
    lastActiveDay: day,
  };
}

/** True if the streak is still alive as of `now` (active today or yesterday). */
export function isStreakAlive(state: StreakState, now: Date): boolean {
  if (state.lastActiveDay === null) return false;
  const day = toUtcDay(now);
  return state.lastActiveDay === day || state.lastActiveDay === day - 1;
}
