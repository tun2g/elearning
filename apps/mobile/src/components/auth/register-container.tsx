import type { RegisterFormProps } from './register-form';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';

import { FocusAwareStatusBar } from '@/components/ui';
import { registerWithPassword } from '@/lib/auth/auth-actions';

import { RegisterForm } from './register-form';

export function RegisterContainer() {
  const router = useRouter();

  const onSubmit: RegisterFormProps['onSubmit'] = async (data) => {
    try {
      await registerWithPassword(data.email, data.password, data.name ?? '');
      showMessage({
        message: 'Check your inbox to verify your email',
        type: 'success',
        duration: 4000,
      });
      router.replace('/login');
    }
    catch {
      showMessage({ message: 'Registration failed', type: 'danger', duration: 3000 });
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <RegisterForm onSubmit={onSubmit} />
    </>
  );
}
