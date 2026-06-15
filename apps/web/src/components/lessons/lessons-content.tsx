'use client';

import type { LessonProgress, LessonSummary } from '@elearning/contracts';
import { ArrowUpRight, CheckCircle2, Mic } from 'lucide-react';
import Link from 'next/link';

import { Reveal, RevealGroup, RevealItem } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

export interface LessonsContentProps {
  lessons?: LessonSummary[];
  isLoading: boolean;
  level: string;
  levels: string[];
  filtered: LessonSummary[];
  progressById: Map<string, LessonProgress>;
  onLevelChange: (level: string) => void;
}

type LessonStatus = 'not_started' | 'in_progress' | 'completed';

const STATUS_META: Record<LessonStatus, { label: string; cta: string; chip: string }> = {
  not_started: { label: 'Not started', cta: 'Start lesson', chip: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In progress', cta: 'Continue', chip: 'bg-primary-soft text-primary-deep' },
  completed: { label: 'Completed', cta: 'Review', chip: 'bg-secondary-soft text-secondary-deep' },
};

export function LessonsContent({
  lessons,
  isLoading,
  level,
  levels,
  filtered,
  progressById,
  onLevelChange,
}: LessonsContentProps) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <Reveal>
        <header className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Practice by <span className="text-gradient-warm">sound</span>
          </h1>
          <p className="mt-1.5 text-muted-foreground">Pick a lesson, listen to each line, then say it back.</p>
        </header>
      </Reveal>

      {lessons && lessons.length > 0 && (
        <Reveal delay={0.05}>
          <div className="mb-6 flex flex-wrap gap-2">
            {levels.map((lv) => (
              <button
                key={lv}
                onClick={() => onLevelChange(lv)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                  level === lv
                    ? 'bg-primary text-white shadow-(--shadow-primary)'
                    : 'border border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground'
                )}
              >
                {lv}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {isLoading && (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-32 animate-pulse rounded-3xl border border-border bg-card" />
          ))}
        </ul>
      )}

      <RevealGroup className="flex flex-col gap-3">
        {filtered.map((lesson) => {
          const progress = progressById.get(lesson.id);
          const status: LessonStatus = progress?.status ?? 'not_started';
          const pct = progress?.completionPct ?? 0;
          const meta = STATUS_META[status];
          const done = status === 'completed';

          return (
            <RevealItem key={lesson.id}>
              <Link
                href={`/lessons/${lesson.slug}`}
                className="group block rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-2xl',
                        done ? 'bg-secondary-soft text-secondary-deep' : 'bg-primary-soft text-primary-deep'
                      )}
                    >
                      {done ? <CheckCircle2 size={20} /> : <Mic size={20} />}
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold leading-tight text-foreground">
                        {lesson.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-subtle">
                        {lesson.sentenceCount} sentences
                        {lesson.topic ? ` · ${lesson.topic.title}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold', meta.chip)}>
                    {meta.label}
                  </span>
                </div>

                {status === 'in_progress' && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">{pct}%</span>
                  </div>
                )}

                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-deep">
                  {meta.cta}
                  <ArrowUpRight
                    size={15}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-muted-foreground">
          {lessons && lessons.length === 0 ? (
            <>
              No lessons yet. Run the API seed:{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">pnpm --filter @elearning/api seed</code>
            </>
          ) : (
            'No lessons at this level yet.'
          )}
        </div>
      )}
    </main>
  );
}
