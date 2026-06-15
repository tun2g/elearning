'use client';

import { useRouter } from 'next/navigation';

import { login, requestMagicLink } from '@/lib/auth';
import config from '@/lib/config';
import { resendVerificationApi } from '@/services/auth';

import { LoginContent } from './login-content';

export function LoginContainer() {
  const router = useRouter();

  const onPasswordLogin = async (email: string, password: string) => {
    await login(email, password);
    router.push('/home');
  };

  return (
    <LoginContent
      googleUrl={`${config.apiUrl}/auth/google`}
      onPasswordLogin={onPasswordLogin}
      onSendMagicLink={(email) => requestMagicLink(email)}
      onResendVerification={(email) => resendVerificationApi(email)}
    />
  );
}
