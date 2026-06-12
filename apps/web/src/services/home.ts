import { apiGet } from '@/lib/api';

export interface HomeData {
  streak: { currentStreak: number; longestStreak: number; isAlive: boolean };
  dailyGoal: {
    targetSentences: number;
    completedSentences: number;
    percentage: number;
    completed: boolean;
  };
  recommendedLesson: {
    slug: string;
    title: string;
    level: string;
    completionPct: number;
  } | null;
  recentXp: Array<{ amount: number; sourceType: string; createdAt: string }>;
}

export function getHome(token: string): Promise<HomeData> {
  return apiGet<HomeData>('/home', token);
}
