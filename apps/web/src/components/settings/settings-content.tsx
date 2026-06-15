'use client';

import type { UserSettings } from '@elearning/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ONBOARDED_KEY } from '@/components/onboarding/onboarding-tour';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { TextField } from '@/components/ui/text-field';
import { useUpdateSettings } from '@/hooks/use-settings';
import { queryKeys } from '@/lib/query-keys';
import { cn } from '@/lib/utils';

export interface SettingsContentProps {
  data?: UserSettings;
  isLoading: boolean;
  isError: boolean;
  hasToken: boolean;
}

const FALLBACK_TIMEZONES = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
];

function timezones(current: string): string[] {
  const supported =
    typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : FALLBACK_TIMEZONES;
  return supported.includes(current) ? supported : [current, ...supported];
}

const selectClass =
  'w-full rounded-xl border border-border-strong bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25';

export function SettingsContent({ data, isLoading, isError, hasToken }: SettingsContentProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate, isPending, isSuccess, isError: isSaveError } = useUpdateSettings();

  const replayTour = () => {
    localStorage.removeItem(ONBOARDED_KEY);
    router.push('/home');
  };

  const [dailyGoal, setDailyGoal] = useState(10);
  const [reminderHour, setReminderHour] = useState(19);
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');

  useEffect(() => {
    if (data) {
      setDailyGoal(data.dailyGoalSentences);
      setReminderHour(data.reminderHour);
      setTimezone(data.timezone);
    }
  }, [data]);

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

  const dirty =
    dailyGoal !== data.dailyGoalSentences || reminderHour !== data.reminderHour || timezone !== data.timezone;

  const onSave = () => {
    mutate(
      { dailyGoalSentences: dailyGoal, reminderHour, timezone },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings }) }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Tune your daily goal and reminders</p>
        </header>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6">
          <TextField
            label="Daily goal (sentences)"
            type="number"
            min={1}
            max={100}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Daily reminder time</label>
            <select
              className={selectClass}
              value={reminderHour}
              onChange={(e) => setReminderHour(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {`${String(h).padStart(2, '0')}:00`}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              We’ll nudge you at this time if you haven’t hit your goal.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Timezone</label>
            <select className={selectClass} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {timezones(timezone).map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onSave} disabled={!dirty || isPending}>
              {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Save changes'}
            </Button>
            {isSuccess && !dirty && (
              <span className="inline-flex items-center gap-1 text-sm text-secondary-600">
                <Check size={15} /> Saved
              </span>
            )}
            {isSaveError && <span className="text-sm text-primary-deep">Couldn’t save. Try again.</span>}
          </div>
        </div>
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
