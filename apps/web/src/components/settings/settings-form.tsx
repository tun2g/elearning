'use client';

import type { UserSettings } from '@elearning/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useUpdateSettings } from '@/hooks/use-settings';
import { queryKeys } from '@/lib/query-keys';

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

const schema = z.object({
  dailyGoalSentences: z.number().int().min(1).max(100),
  reminderHour: z.number().int().min(0).max(23),
  timezone: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export function SettingsForm({ data }: { data: UserSettings }) {
  const queryClient = useQueryClient();
  const { mutate, isPending, isSuccess, isError } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      dailyGoalSentences: data.dailyGoalSentences,
      reminderHour: data.reminderHour,
      timezone: data.timezone,
    },
  });

  const onSubmit = (values: FormData) =>
    mutate(values, { onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings }) });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6"
    >
      <TextField
        label="Daily goal (sentences)"
        type="number"
        min={1}
        max={100}
        {...register('dailyGoalSentences', { valueAsNumber: true })}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Daily reminder time</label>
        <select className={selectClass} {...register('reminderHour', { valueAsNumber: true })}>
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
        <select className={selectClass} {...register('timezone')}>
          {timezones(watch('timezone') || data.timezone).map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!isDirty || isPending}>
          {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Save changes'}
        </Button>
        {isSuccess && !isDirty && (
          <span className="inline-flex items-center gap-1 text-sm text-secondary-600">
            <Check size={15} /> Saved
          </span>
        )}
        {isError && <span className="text-sm text-primary-deep">Couldn’t save. Try again.</span>}
      </div>
    </form>
  );
}
