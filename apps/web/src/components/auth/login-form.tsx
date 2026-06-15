'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Mail, MailCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, buttonClass } from '@/components/ui/button';
import { GoogleIcon } from '@/components/ui/google-icon';
import { TextField } from '@/components/ui/text-field';
import { AuthError } from '@/services/auth';

import type { LoginStep } from './login-content';

const RESEND_COOLDOWN_S = 30;

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});
type FormData = z.infer<typeof schema>;

export interface LoginFormProps {
  step: LoginStep;
  setStep: (step: LoginStep) => void;
  googleUrl: string;
  onPasswordLogin: (email: string, password: string) => Promise<void>;
  onSendMagicLink: (email: string) => Promise<void>;
  onResendVerification: (email: string) => Promise<void>;
}

export function LoginForm({
  step,
  setStep,
  googleUrl,
  onPasswordLogin,
  onSendMagicLink,
  onResendVerification,
}: LoginFormProps) {
  const {
    register,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onSubmit' });

  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const email = () => getValues('email').trim();

  const goIdentifier = () => {
    setServerError(null);
    setInfo(null);
    setUnverified(false);
    setStep('identifier');
  };

  const continueWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (await trigger('email')) setStep('method');
  };

  const sendLink = async () => {
    setBusy(true);
    setServerError(null);
    try {
      await onSendMagicLink(email());
      setCooldown(RESEND_COOLDOWN_S);
      setStep('sent');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not send link');
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setUnverified(false);
    if (!(await trigger('password'))) return;
    setBusy(true);
    try {
      await onPasswordLogin(email(), getValues('password'));
    } catch (err) {
      if (err instanceof AuthError && err.code === 'EMAIL_NOT_VERIFIED') {
        setUnverified(true);
        setServerError('Please verify your email before signing in.');
      } else {
        setServerError(err instanceof Error ? err.message : 'Invalid email or password');
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setInfo(null);
    await onSendMagicLink(email()).catch(() => undefined);
    setCooldown(RESEND_COOLDOWN_S);
    setInfo('Sent again — check your inbox.');
  };

  const errorBox = serverError && (
    <p className="rounded-xl bg-primary-soft px-3.5 py-2.5 text-sm text-primary-deep">{serverError}</p>
  );

  if (step === 'sent') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-soft text-secondary-deep">
          <MailCheck size={22} />
        </span>
        <p className="text-sm text-muted-foreground">
          We sent a login link to <span className="font-semibold text-foreground">{email()}</span>. Click it to sign in
          — it expires in 15 minutes.
        </p>
        {info && <p className="text-sm text-secondary-deep">{info}</p>}
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="text-sm font-semibold text-primary-deep hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
        </button>
        <button type="button" onClick={goIdentifier} className="text-sm text-muted-foreground hover:text-foreground">
          Use a different email
        </button>
      </div>
    );
  }

  if (step === 'method') {
    return (
      <>
        <button
          type="button"
          onClick={goIdentifier}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} />
          {email()}
        </button>

        <form onSubmit={submitPassword} className="flex flex-col gap-4">
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            error={errors.password?.message}
            autoFocus
            labelRight={
              <button
                type="button"
                onClick={sendLink}
                className="text-sm font-medium text-primary-deep hover:underline"
              >
                Forgot password?
              </button>
            }
            {...register('password')}
          />
          {errorBox}
          {unverified && (
            <button
              type="button"
              onClick={() => onResendVerification(email())}
              className="self-start text-sm font-semibold text-primary-deep hover:underline"
            >
              Resend verification email
            </button>
          )}
          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {busy ? 'Signing in…' : 'Sign in'}
            {!busy && <ArrowRight size={17} />}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="secondary" size="lg" className="w-full" onClick={sendLink} disabled={busy}>
          <Mail size={17} />
          Email me a login link
        </Button>
      </>
    );
  }

  // identifier
  return (
    <>
      <a href={googleUrl} className={buttonClass('secondary', 'lg', 'w-full')}>
        <GoogleIcon className="h-4.5 w-4.5" />
        Continue with Google
      </a>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={continueWithEmail} className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" size="lg" className="w-full">
          Continue
          <ArrowRight size={17} />
        </Button>
      </form>
    </>
  );
}
