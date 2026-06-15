import { useEffect } from 'react';

import { useAuthStore } from '@/lib/auth/use-auth-store';
import { registerForPushNotifications } from '@/lib/notifications';

/** Registers this device's push token once the user is signed in. */
export function useRegisterPush() {
  const status = useAuthStore.use.status();

  useEffect(() => {
    if (status === 'signIn') {
      registerForPushNotifications().catch(() => {
        // best-effort: a missing token shouldn't block the app
      });
    }
  }, [status]);
}
