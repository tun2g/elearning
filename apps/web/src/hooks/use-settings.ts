import type { UpdateSettings, UserSettings } from '@elearning/contracts';
import { createMutation, createQuery } from 'react-query-kit';

import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import { getSettings, updateSettings } from '@/services/settings';

export const useSettings = createQuery<UserSettings>({
  queryKey: queryKeys.settings,
  fetcher: () => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getSettings(token);
  },
});

export const useUpdateSettings = createMutation({
  mutationFn: (input: UpdateSettings) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return updateSettings(token, input);
  },
});
