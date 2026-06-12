import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

export type HomeData = {
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
};

export const useHomeData = createQuery<HomeData, void, AxiosError>({
  queryKey: queryKeys.home,
  fetcher: () => client.get<HomeData>('/home').then(r => r.data),
});
