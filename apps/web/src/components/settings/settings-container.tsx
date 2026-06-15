'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useSettings } from '@/hooks/use-settings';
import { getAccessToken } from '@/lib/auth';

import { SettingsContent } from './settings-content';

export function SettingsContainer() {
  const router = useRouter();
  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken());
  const { data, isLoading, isError } = useSettings({ enabled: hasToken });

  useEffect(() => {
    if (typeof window !== 'undefined' && !getAccessToken()) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <main className="mx-auto max-w-xl px-5 py-8 sm:py-10">
      <SettingsContent data={data} isLoading={isLoading} isError={isError} hasToken={hasToken} />
    </main>
  );
}
