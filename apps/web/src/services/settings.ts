import type { UpdateSettings, UserSettings } from '@elearning/contracts';

import { apiGet, apiPatch } from '@/lib/api';

export type { UpdateSettings, UserSettings } from '@elearning/contracts';

export function getSettings(token: string): Promise<UserSettings> {
  return apiGet<UserSettings>('/me/settings', token);
}

export function updateSettings(token: string, input: UpdateSettings): Promise<UserSettings> {
  return apiPatch<UserSettings>('/me/settings', input, token);
}
