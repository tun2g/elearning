'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { AuthShell } from '@/components/ui/auth-shell';
import { Button } from '@/components/ui/button';
import { setSession } from '@/lib/auth';

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const p = new URLSearchParams(raw);
    const accessToken = p.get('accessToken');
    const refreshToken = p.get('refreshToken');

    if (accessToken && refreshToken) {
      setSession({ accessToken, refreshToken });
      // Drop the tokens from the URL before navigating away.
      window.history.replaceState(null, '', window.location.pathname);
      router.replace('/home');
    } else {
      setError('Sign-in was cancelled or failed.');
    }
  }, [router]);

  return (
    <AuthShell title="Signing you in" subtitle="One moment." footer={null}>
      {error ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-primary-soft px-3.5 py-2.5 text-sm text-primary-deep">{error}</p>
          <Button size="lg" className="w-full" onClick={() => router.push('/login')}>
            Back to sign in
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Completing Google sign-in…</p>
      )}
    </AuthShell>
  );
}
