'use client';

import { useState } from 'react';

import { register as registerUser } from '@/lib/auth';

import { RegisterContent } from './register-content';

export function RegisterContainer() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onSubmit = async (email: string, password: string, displayName: string) => {
    try {
      setServerError(null);
      await registerUser(email, password, displayName);
      setSentTo(email);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return <RegisterContent serverError={serverError} sentTo={sentTo} onSubmit={onSubmit} />;
}
