'use client';

import type { LessonSummary } from '@elearning/contracts';
import { ArrowUpRight, Mic } from 'lucide-react';
import Link from 'next/link';

import { Reveal, RevealGroup, RevealItem } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

export interface LessonsContentProps {
  lessons?: LessonSummary[];
  isLoading: boolean;
  level: string;
  levels: string[];
  filtered: LessonSummary[];
  onLevelChange: (level: string) => void;
}

export function LessonsContent({ lessons, isLoading, level, levels, filtered, onLevelChange }: LessonsContentProps) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <Reveal>
        <header className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Practice by sound</h1>
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
            <li key={i} className="h-28 animate-pulse rounded-3xl border border-border bg-card" />
          ))}
        </ul>
      )}

      <RevealGroup className="flex flex-col gap-3">
        {filtered.map((lesson) => (
          <RevealItem key={lesson.id}>
            <Link
              href={`/lessons/${lesson.slug}`}
              className="group block rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-deep">
                    <Mic size={20} />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold leading-tight text-foreground">{lesson.title}</h2>
                    <p className="mt-0.5 text-xs text-subtle">
                      {lesson.sentenceCount} sentences
                      {lesson.topic ? ` · ${lesson.topic}` : ''}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {lesson.level}
                </span>
              </div>
              {lesson.description && <p className="mt-3 text-sm text-muted-foreground">{lesson.description}</p>}
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-deep">
                Start lesson
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </RevealItem>
        ))}
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
