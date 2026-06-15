import type { UpdateSettings, UserSettings } from '@elearning/contracts';
import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import { client } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

export type { UpdateSettings, UserSettings } from '@elearning/contracts';

export const useSettings = createQuery<UserSettings, void, AxiosError>({
  queryKey: queryKeys.settings,
  fetcher: () => client.get<UserSettings>('/me/settings').then(r => r.data),
});

export const useUpdateSettings = createMutation<UserSettings, UpdateSettings, AxiosError>({
  mutationFn: vars => client.patch<UserSettings>('/me/settings', vars).then(r => r.data),
});
