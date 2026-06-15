'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { AuthShell } from '@/components/ui/auth-shell';
import { Button } from '@/components/ui/button';
import { verifyEmail, verifyMagicLink } from '@/lib/auth';

type State = 'verifying' | 'success' | 'error';

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>('verifying');
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // tokens are single-use — guard StrictMode double-invoke
    ran.current = true;

    const token = params.get('token');
    const purpose = params.get('purpose');
    if (!token) {
      setState('error');
      setMessage('This link is missing its token.');
      return;
    }

    const action = purpose === 'login' ? verifyMagicLink : verifyEmail;
    action(token)
      .then(() => {
        setState('success');
        router.replace('/home');
      })
      .catch((e: unknown) => {
        setState('error');
        setMessage(e instanceof Error ? e.message : 'This link is invalid or has expired.');
      });
  }, [params, router]);

  return (
    <AuthShell
      title={state === 'error' ? 'Link problem' : 'Verifying your link'}
      subtitle={state === 'error' ? 'We couldn’t complete that.' : 'Hang tight — signing you in.'}
      footer={null}
    >
      {state === 'verifying' && <p className="text-sm text-muted-foreground">Verifying…</p>}
      {state === 'success' && <p className="text-sm text-muted-foreground">You’re in! Redirecting…</p>}
      {state === 'error' && (
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-primary-soft px-3.5 py-2.5 text-sm text-primary-deep">{message}</p>
          <Button size="lg" className="w-full" onClick={() => router.push('/login')}>
            Back to sign in
          </Button>
        </div>
      )}
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
