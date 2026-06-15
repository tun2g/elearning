'use client';

import type { LessonDetail, PronunciationAssessment } from '@elearning/contracts';
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Reveal } from '@/components/ui/reveal';
import { Waveform } from '@/components/ui/waveform';
import { cn } from '@/lib/utils';

export interface SentenceResult {
  passed: boolean;
  assessment: PronunciationAssessment;
}

export interface PracticeResultProps {
  lesson: LessonDetail;
  results: Record<string, SentenceResult>;
  seededCount: number;
  onRestart: () => void;
}

export function trickyWords(lesson: LessonDetail, results: Record<string, SentenceResult>): string[] {
  const seen = new Map<string, string>();
  for (const s of lesson.sentences) {
    const assessment = results[s.id]?.assessment;
    if (!assessment) continue;
    for (const w of assessment.words) {
      if (w.status !== 'substituted' && w.status !== 'omitted') continue;
      const key = w.text.toLowerCase().replace(/[^a-z']/g, '');
      if (key) seen.set(key, w.text);
    }
  }
  return Array.from(seen.values()).slice(0, 12);
}

export function PracticeResult({ lesson, results, seededCount, onRestart }: PracticeResultProps) {
  const total = lesson.sentences.length;
  const passed = lesson.sentences.filter((s) => results[s.id]?.passed).length;
  const allPassed = passed === total;
  const tricky = trickyWords(lesson, results);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-(--shadow-lift)">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
          <Waveform
            className="pointer-events-none absolute inset-x-10 bottom-3 h-5 text-primary/15"
            playing={allPassed}
            bars={32}
          />
          <span className="relative text-4xl">{allPassed ? '🎉' : '💪'}</span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
            {allPassed ? 'Lesson complete!' : 'Good progress!'}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            You passed <span className="font-semibold text-foreground">{passed}</span> of {total} sentences.
          </p>

          <div className="mx-auto mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-700"
              style={{ width: `${total ? (passed / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <ul className="mt-5 flex flex-col gap-2">
          {lesson.sentences.map((s) => {
            const r = results[s.id];
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                <span
                  className={cn(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums',
                    r?.passed
                      ? 'bg-secondary-soft text-secondary-deep'
                      : r
                        ? 'bg-primary-soft text-primary-deep'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {r?.passed ? <CheckCircle2 size={15} /> : (r?.assessment.overall ?? '–')}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{s.text}</span>
              </li>
            );
          })}
        </ul>
      </Reveal>

      {tricky.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-5 rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Words to drill</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tricky.map((w) => (
                <span key={w} className="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary-deep">
                  {w}
                </span>
              ))}
            </div>
            {seededCount > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-secondary-deep">
                <CheckCircle2 size={13} /> {seededCount} added to today’s review
              </p>
            )}
          </div>
        </Reveal>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onRestart}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-border-strong"
        >
          <RotateCcw size={16} /> Practice again
        </button>
        {tricky.length > 0 && (
          <Link
            href="/vocab/review"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-secondary-deep transition-colors hover:border-secondary"
          >
            <Sparkles size={16} /> Review words
          </Link>
        )}
        <Link
          href="/lessons"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-(--shadow-primary) transition-transform hover:scale-[1.02] active:scale-95"
        >
          More lessons <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
