'use client';

import type { LessonDetail, PronunciationAssessment } from '@elearning/contracts';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';

import { Reveal } from '@/components/ui/reveal';

import { PracticeResult, type SentenceResult } from './practice-result';
import { PracticeSentenceCard } from './practice-sentence-card';

export interface PracticeContentProps {
  lesson?: LessonDetail;
  isLoading: boolean;
  isError: boolean;
  index: number;
  completedCount: number;
  finished: boolean;
  canAdvance: boolean;
  results: Record<string, SentenceResult>;
  seededCount: number;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onResult: (sentenceId: string, assessment: PronunciationAssessment) => void;
  onRestart: () => void;
}

export function PracticeContent({
  lesson,
  isLoading,
  isError,
  index,
  completedCount,
  finished,
  canAdvance,
  results,
  seededCount,
  onPrev,
  onNext,
  onSkip,
  onResult,
  onRestart,
}: PracticeContentProps) {
  const total = lesson?.sentences.length ?? 0;
  const sentence = lesson?.sentences[index];
  const isLast = index + 1 >= total;
  const progress = total ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;

  if (lesson && finished) {
    return <PracticeResult lesson={lesson} results={results} seededCount={seededCount} onRestart={onRestart} />;
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <Link
        href="/lessons"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} /> All lessons
      </Link>

      {isLoading && (
        <div className="mt-6 flex flex-col gap-3">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
          <div className="mt-4 h-64 animate-pulse rounded-3xl border border-border bg-card" />
        </div>
      )}

      {isError && (
        <div className="mt-10 rounded-3xl border border-border bg-card p-8 text-center">
          <p className="font-display text-lg font-semibold text-foreground">Lesson not found</p>
          <p className="mt-1 text-sm text-muted-foreground">It may have been moved or removed.</p>
        </div>
      )}

      {lesson && sentence && (
        <>
          <Reveal>
            <div className="mt-5 mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {lesson.title}
                </h1>
                {lesson.description && <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>}
              </div>
              <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                {index + 1} / {total}
              </span>
            </div>
          </Reveal>

          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-500 ease-out-soft"
              style={{ width: `${progress}%` }}
            />
          </div>

          <PracticeSentenceCard key={sentence.id} sentence={sentence} onResult={onResult} />

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onPrev}
              disabled={index === 0}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={onNext}
              disabled={!canAdvance}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-(--shadow-primary) transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {!canAdvance && <Lock size={14} />}
              {isLast ? 'Finish' : 'Next'} <ChevronRight size={16} />
            </button>
          </div>

          {!canAdvance && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Speak the sentence and pass to continue, or{' '}
              <button onClick={onSkip} className="font-semibold text-primary-deep hover:underline">
                skip for now
              </button>
            </p>
          )}
        </>
      )}
    </main>
  );
}
