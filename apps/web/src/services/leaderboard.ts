import type { LeaderboardEntry } from '@elearning/contracts';

import { apiGet } from '@/lib/api';

export type { LeaderboardEntry } from '@elearning/contracts';

export function getLeaderboard(token: string): Promise<LeaderboardEntry[]> {
  return apiGet<LeaderboardEntry[]>('/leaderboard/weekly', token);
}
