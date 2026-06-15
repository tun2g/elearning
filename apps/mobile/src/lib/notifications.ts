import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { client } from '@/lib/api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests permission, resolves the Expo push token, and registers it with the
 * API. Safe to call repeatedly. No-ops on simulators or when permission is
 * denied so the rest of the app keeps working.
 */
export async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice)
    return;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted')
    return;

  const projectId
    = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId)
    return;

  const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  await client.patch('/me/settings', { pushToken });
}
