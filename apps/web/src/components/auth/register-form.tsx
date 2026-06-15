'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export interface RegisterFormProps {
  serverError: string | null;
  onSubmit: (email: string, password: string, displayName: string) => Promise<void>;
}

export function RegisterForm({ serverError, onSubmit }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data.email, data.password, data.displayName))}
      className="flex flex-col gap-4"
    >
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
  );
}
