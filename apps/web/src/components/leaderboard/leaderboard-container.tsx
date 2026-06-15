'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useLeaderboard } from '@/hooks/use-leaderboard';
import { useMe } from '@/hooks/use-me';
import { getAccessToken } from '@/lib/auth';

import { LeaderboardContent } from './leaderboard-content';

export function LeaderboardContainer() {
  const router = useRouter();
  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken());
  const { data, isLoading, isError } = useLeaderboard({ enabled: hasToken });
  const { data: me } = useMe({ enabled: hasToken });

  useEffect(() => {
    if (typeof window !== 'undefined' && !getAccessToken()) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <LeaderboardContent
        entries={data}
        isLoading={isLoading}
        isError={isError}
        hasToken={hasToken}
        currentUserId={me?.id}
      />
    </main>
  );
}
