'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useHome } from '@/hooks/use-home';
import { getAccessToken } from '@/lib/auth';

import { HomeContent } from './home-content';

export function HomeContainer() {
  const router = useRouter();
  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken());
  const { data, isLoading, isError } = useHome({ enabled: hasToken });

  useEffect(() => {
    if (typeof window !== 'undefined' && !getAccessToken()) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <HomeContent data={data} isLoading={isLoading} isError={isError} hasToken={hasToken} />
    </main>
  );
}
