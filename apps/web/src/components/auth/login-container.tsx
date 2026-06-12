'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { login } from '@/lib/auth';

import { LoginContent } from './login-content';

export function LoginContainer() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (email: string, password: string) => {
    try {
      setServerError(null);
      await login(email, password);
      router.push('/home');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return <LoginContent serverError={serverError} onSubmit={onSubmit} />;
}
