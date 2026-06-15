'use client';

import type { UserSettings } from '@elearning/contracts';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ONBOARDED_KEY } from '@/components/onboarding/onboarding-tour';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

import { SettingsForm } from './settings-form';

export interface SettingsContentProps {
  data?: UserSettings;
  isLoading: boolean;
  isError: boolean;
  hasToken: boolean;
}

export function SettingsContent({ data, isLoading, isError, hasToken }: SettingsContentProps) {
  const router = useRouter();

  const replayTour = () => {
    localStorage.removeItem(ONBOARDED_KEY);
    router.push('/home');
  };

  if (isLoading || !hasToken) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-card" />
        <div className="h-64 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your settings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            <span className="text-gradient-warm">Settings</span>
          </h1>
          <p className="text-sm text-muted-foreground">Tune your daily goal and reminders</p>
        </header>
      </Reveal>

      <Reveal delay={0.05}>
        <SettingsForm data={data} />
      </Reveal>

      <Reveal delay={0.1}>
        <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-6">
          <div>
            <p className="font-medium text-foreground">App tour</p>
            <p className="text-sm text-muted-foreground">Replay the quick walkthrough of the app.</p>
          </div>
          <Button variant="secondary" onClick={replayTour}>
            <Sparkles size={16} />
            Replay
          </Button>
        </div>
      </Reveal>

      <p className={cn('text-center text-xs text-subtle')}>Push notifications are configured in the mobile app.</p>
    </div>
  );
}
