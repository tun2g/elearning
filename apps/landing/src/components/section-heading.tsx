import type { ReactNode } from 'react';

import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/cn';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col gap-4', align === 'center' ? 'items-center text-center' : 'items-start', className)}
    >
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-deep">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="text-balance max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.12}>
          <p className={cn('text-balance max-w-2xl text-lg text-muted-foreground', align === 'center' && 'mx-auto')}>
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
