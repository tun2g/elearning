'use client';

import { TourProvider as ReactourProvider, type StepType } from '@reactour/tour';
import type { ReactNode } from 'react';

function Step({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-display text-base font-semibold text-foreground">{title}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

const steps: StepType[] = [
  {
    selector: '[data-tour="practice"]',
    content: (
      <Step
        title="Practice by sound 🎧"
        body="Start here. Listen to a native line, shadow it out loud, then speak it back — your daily loop to fluency."
      />
    ),
  },
  {
    selector: '[data-tour="settings"]',
    content: (
      <Step title="Make it yours ⚙️" body="Set your daily goal, reminder time, and timezone anytime in Settings." />
    ),
  },
];

export function TourProvider({ children }: { children: ReactNode }) {
  return (
    <ReactourProvider
      steps={steps}
      padding={{ mask: 6, popover: [20, 20] }}
      onClickMask={({ setIsOpen }) => setIsOpen(false)}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: 'var(--color-card)',
          color: 'var(--color-foreground)',
          borderRadius: 16,
          padding: 20,
          maxWidth: 320,
          boxShadow: '0 16px 48px -16px rgba(0,0,0,0.4)',
        }),
        maskArea: (base) => ({ ...base, rx: 16 }),
        badge: (base) => ({ ...base, backgroundColor: 'var(--color-primary)' }),
        dot: (base, state) => ({
          ...base,
          backgroundColor: state?.current ? 'var(--color-primary)' : 'transparent',
          // Use the `border` shorthand (not borderColor) — reactour's default dot
          // already sets `border`, and mixing shorthand + longhand warns in React.
          border: '1px solid var(--color-primary)',
        }),
        close: (base) => ({ ...base, color: 'var(--color-muted-foreground)', top: 12, right: 12 }),
      }}
    >
      {children}
    </ReactourProvider>
  );
}
