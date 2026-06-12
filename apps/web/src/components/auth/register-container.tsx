'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { register as registerUser } from '@/lib/auth';

import { RegisterContent } from './register-content';

export function RegisterContainer() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (email: string, password: string, displayName: string) => {
    try {
      setServerError(null);
      await registerUser(email, password, displayName);
      router.push('/home');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return <RegisterContent serverError={serverError} onSubmit={onSubmit} />;
}
