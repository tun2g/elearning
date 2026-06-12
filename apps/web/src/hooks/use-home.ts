import { createQuery } from 'react-query-kit';

import { getHome, type HomeData } from '@/services/home';
import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';

export const useHome = createQuery<HomeData>({
  queryKey: queryKeys.home,
  fetcher: () => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getHome(token);
  },
});
