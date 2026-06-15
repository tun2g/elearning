import type { User } from '@elearning/contracts';
import { createQuery } from 'react-query-kit';

import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import { getMeApi } from '@/services/auth';

export const useMe = createQuery<User>({
  queryKey: queryKeys.me,
  fetcher: () => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getMeApi(token);
  },
});
