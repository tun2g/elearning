export type SrsAssessment = 'again' | 'hard' | 'easy';

export interface SrsState {
  interval: number; // days until next review
  ease: number; // ease factor (1.3 – 3.0)
}

export const SRS_DEFAULTS: SrsState = { interval: 1, ease: 2.5 };

/**
 * SM-2 variant: compute the next SRS interval and ease given a self-assessment.
 * Returns the next interval in days and the updated ease factor.
 */
export function srsNextInterval(current: SrsState, assessment: SrsAssessment): SrsState {
  switch (assessment) {
    case 'again':
      return { interval: 1, ease: Math.max(1.3, current.ease - 0.2) };
    case 'hard':
      return { interval: Math.max(1, Math.round(current.interval * 1.5)), ease: current.ease };
    case 'easy':
      return {
        interval: Math.max(1, Math.round(current.interval * 2.5)),
        ease: Math.min(3.0, current.ease + 0.1),
      };
  }
}

/** Returns the Date when a card is next due, given today and an interval in days. */
export function srsDueDate(today: Date, intervalDays: number): Date {
  const due = new Date(today);
  due.setUTCDate(due.getUTCDate() + intervalDays);
  due.setUTCHours(0, 0, 0, 0);
  return due;
}
