import { z } from 'zod';

export const StreakSchema = z.object({
  currentStreak: z.number().int(),
  longestStreak: z.number().int(),
  lastActiveDay: z.number().int().nullable(),
  isAlive: z.boolean(),
});
export type Streak = z.infer<typeof StreakSchema>;

export const XpSummarySchema = z.object({
  total: z.number().int(),
  today: z.number().int(),
  thisWeek: z.number().int(),
  rank: z.string(),
  currentThreshold: z.number().int(),
  nextThreshold: z.number().int().nullable(),
  progress: z.number(),
});
export type XpSummary = z.infer<typeof XpSummarySchema>;

export const DailyGoalSchema = z.object({
  targetSentences: z.number().int(),
  completedSentences: z.number().int(),
  completed: z.boolean(),
  percentage: z.number(),
});
export type DailyGoal = z.infer<typeof DailyGoalSchema>;

export const HomeResponseSchema = z.object({
  streak: StreakSchema,
  dailyGoal: DailyGoalSchema,
  recommendedLesson: z
    .object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      level: z.string(),
      completionPct: z.number().int(),
    })
    .nullable(),
  recentXp: z.array(
    z.object({
      amount: z.number().int(),
      sourceType: z.string(),
      createdAt: z.string().datetime(),
    })
  ),
});
export type HomeResponse = z.infer<typeof HomeResponseSchema>;

export const LeaderboardEntrySchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  xpThisWeek: z.number().int(),
  rank: z.number().int(),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
