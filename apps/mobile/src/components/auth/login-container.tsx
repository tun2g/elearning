import { useRouter } from 'expo-router';
import * as React from 'react';

import { FocusAwareStatusBar } from '@/components/ui';
import { googleSignIn, passwordLogin, requestMagicLink, resendVerification } from '@/lib/auth/auth-actions';

import { LoginForm } from './login-form';

export function LoginContainer() {
  const router = useRouter();

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm
        onPasswordLogin={async (email, password) => {
          await passwordLogin(email, password);
          router.replace('/');
        }}
        onSendMagicLink={email => requestMagicLink(email)}
        onResendVerification={email => resendVerification(email)}
        onGoogle={async () => {
          await googleSignIn();
          router.replace('/');
        }}
      />
    </>
  );
}
