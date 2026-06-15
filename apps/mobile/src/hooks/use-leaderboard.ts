import type { LeaderboardEntry } from '@elearning/contracts';
import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

export type { LeaderboardEntry } from '@elearning/contracts';

export const useLeaderboard = createQuery<LeaderboardEntry[], void, AxiosError>({
  queryKey: queryKeys.leaderboard,
  fetcher: () => client.get<LeaderboardEntry[]>('/leaderboard/weekly').then(r => r.data),
});
