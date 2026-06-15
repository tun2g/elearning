import type { LeaderboardEntry } from '@elearning/contracts';
import { createQuery } from 'react-query-kit';

import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import { getLeaderboard } from '@/services/leaderboard';

export const useLeaderboard = createQuery<LeaderboardEntry[]>({
  queryKey: queryKeys.leaderboard,
  fetcher: () => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getLeaderboard(token);
  },
});
