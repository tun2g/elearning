'use client';

import Link from 'next/link';
import { useState } from 'react';

import { AuthShell } from '@/components/ui/auth-shell';

import { LoginForm } from './login-form';

export type LoginStep = 'identifier' | 'method' | 'sent';

export interface LoginContentProps {
  googleUrl: string;
  onPasswordLogin: (email: string, password: string) => Promise<void>;
  onSendMagicLink: (email: string) => Promise<void>;
  onResendVerification: (email: string) => Promise<void>;
}

const CHROME: Record<LoginStep, { title: string; subtitle: string }> = {
  identifier: { title: 'Log in or sign up', subtitle: 'Pick up your streak where you left off.' },
  method: { title: 'Welcome back', subtitle: 'How would you like to sign in?' },
  sent: { title: 'Check your email', subtitle: 'Your sign-in link is on the way.' },
};

export function LoginContent(props: LoginContentProps) {
  const [step, setStep] = useState<LoginStep>('identifier');
  const chrome = CHROME[step];

  return (
    <AuthShell
      title={chrome.title}
      subtitle={chrome.subtitle}
      footer={
        step === 'identifier' ? (
          <>
            Prefer a password?{' '}
            <Link href="/register" className="font-semibold text-primary-deep hover:underline">
              Create an account
            </Link>
          </>
        ) : null
      }
    >
      <LoginForm step={step} setStep={setStep} {...props} />
    </AuthShell>
  );
}
