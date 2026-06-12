import type { LoginFormProps } from './components/login-form';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { showMessage } from 'react-native-flash-message';
import { FocusAwareStatusBar } from '@/components/ui';

import { client } from '@/lib/api/client';
import { LoginForm } from './components/login-form';
import { signIn } from './use-auth-store';

export function LoginScreen() {
  const router = useRouter();

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    try {
      const res = await client.post<{ accessToken: string; refreshToken: string }>(
        '/auth/login',
        { email: data.email, password: data.password },
      );
      signIn({ access: res.data.accessToken, refresh: res.data.refreshToken });
      router.replace('/');
    }
    catch {
      showMessage({
        message: 'Invalid email or password',
        type: 'danger',
        duration: 3000,
      });
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} />
    </>
  );
}
