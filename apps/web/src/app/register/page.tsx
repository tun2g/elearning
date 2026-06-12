'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { register as registerUser } from '@/lib/auth';

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      setServerError(null);
      await registerUser(data.email, data.password, data.displayName);
      router.push('/home');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    }
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          label="Your name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          error={errors.displayName?.message}
          {...register('displayName')}
        />
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
          autoComplete="new-password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && (
          <p className="rounded-xl bg-primary-soft px-3.5 py-2.5 text-sm text-primary-deep">{serverError}</p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
          {isSubmitting ? 'Creating account…' : 'Create account'}
          {!isSubmitting && <ArrowRight size={17} />}
        </Button>
      </form>
    </AuthShell>
  );
}
