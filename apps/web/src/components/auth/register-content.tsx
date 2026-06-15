'use client';

import { MailCheck } from 'lucide-react';
import Link from 'next/link';

import { AuthShell } from '@/components/ui/auth-shell';

import { RegisterForm } from './register-form';

export interface RegisterContentProps {
  serverError: string | null;
  sentTo: string | null;
  onSubmit: (email: string, password: string, displayName: string) => Promise<void>;
}

export function RegisterContent({ serverError, sentTo, onSubmit }: RegisterContentProps) {
  if (sentTo) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="One quick step to go."
        footer={
          <>
            Already verified?{' '}
            <Link href="/login" className="font-semibold text-primary-deep hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-soft text-secondary-deep">
            <MailCheck size={22} />
          </span>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to <span className="font-semibold text-foreground">{sentTo}</span>. Click it to
            activate your account and sign in.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Start speaking"
      subtitle="Your first sentence is three minutes away."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary-deep hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm serverError={serverError} onSubmit={onSubmit} />
    </AuthShell>
  );
}
