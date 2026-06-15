import type { User } from '@elearning/contracts';
import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

export const useMe = createQuery<User, void, AxiosError>({
  queryKey: queryKeys.me,
  fetcher: () => client.get<User>('/auth/me').then(r => r.data),
});
