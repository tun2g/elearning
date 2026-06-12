'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthShell } from '@/components/ui/auth-shell';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export interface LoginContentProps {
  serverError: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginContent({ serverError, onSubmit }: LoginContentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Pick up your streak where you left off."
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-semibold text-primary-deep hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((data) => onSubmit(data.email, data.password))} className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && (
          <p className="rounded-xl bg-primary-soft px-3.5 py-2.5 text-sm text-primary-deep">{serverError}</p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
          {!isSubmitting && <ArrowRight size={17} />}
        </Button>
      </form>
    </AuthShell>
  );
}
