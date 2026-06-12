import { Ear, Mic, Repeat2 } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Logo, LogoMark } from '@/components/logo';
import { Waveform } from '@/components/waveform';

const STEPS = [
  { icon: Ear, label: 'Listen' },
  { icon: Mic, label: 'Shadow' },
  { icon: Repeat2, label: 'Speak' },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left — brand / content (dark, cohesive with the form side) */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-background p-12 text-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

        <Link href="/" aria-label="Soundwell home" className="relative inline-flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">Soundwell</span>
        </Link>

        <div className="relative">
          <Waveform className="h-10 w-44 text-primary" bars={22} />
          <h2 className="text-balance mt-6 max-w-md font-display text-4xl font-semibold leading-[1.1]">
            Speak English with <span className="text-gradient-warm">confidence.</span>
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
            Listen to native lines, shadow them out loud, and keep your streak alive — a few focused minutes a day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {STEPS.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-foreground"
              >
                <s.icon size={16} className="text-primary" />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {['#3b82f6', '#4fa3f7', '#22d3ee', '#1d2b43'].map((c) => (
              <span key={c} className="h-8 w-8 rounded-full border-2 border-background" style={{ background: c }} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Loved by 12,000+ daily learners</p>
        </div>
      </aside>

      {/* Right — form (lighter surface so it stands apart from the brand panel) */}
      <section className="bg-sunrise flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:bg-card">
        <div className="w-full max-w-sm">
          <Link href="/" aria-label="Soundwell home" className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </Link>

          <div className="mb-7">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
        </div>
      </section>
    </main>
  );
}
