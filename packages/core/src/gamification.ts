export type XpAction = 'sentence_attempt' | 'lesson_complete' | 'streak_day' | 'vocab_review' | 'daily_challenge';

const XP_TABLE: Record<XpAction, number> = {
  sentence_attempt: 2,
  lesson_complete: 5,
  streak_day: 10,
  vocab_review: 3,
  daily_challenge: 20,
};

export function xpForAction(action: XpAction): number {
  return XP_TABLE[action];
}

export interface LevelInfo {
  rank: string;
  currentThreshold: number;
  nextThreshold: number | null;
  progress: number; // 0–1 toward next level
}

const LEVELS: Array<{ rank: string; threshold: number }> = [
  { rank: 'Beginner', threshold: 0 },
  { rank: 'Explorer', threshold: 500 },
  { rank: 'Speaker', threshold: 1500 },
  { rank: 'Conversational', threshold: 4000 },
  { rank: 'Fluent', threshold: 9000 },
  { rank: 'Master', threshold: 20000 },
];

export function levelFromXp(xpTotal: number): LevelInfo {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xpTotal >= level.threshold) current = level;
    else break;
  }

  const currentIdx = LEVELS.indexOf(current);
  const next = LEVELS[currentIdx + 1] ?? null;

  const progress = next ? (xpTotal - current.threshold) / (next.threshold - current.threshold) : 1;

  return {
    rank: current.rank,
    currentThreshold: current.threshold,
    nextThreshold: next?.threshold ?? null,
    progress: Math.min(1, Math.max(0, progress)),
  };
}
