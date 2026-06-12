'use client';

import type { LessonDetail } from '@elearning/contracts';
import { ArrowLeft, Check, Volume2 } from 'lucide-react';
import Link from 'next/link';

import { Reveal } from '@/components/ui/reveal';
import { Waveform } from '@/components/ui/waveform';
import { cn } from '@/lib/utils';
import type { Assessment } from '@/services/types';

import { VoicePracticeList } from './voice-practice';

const CHIPS: { key: Assessment; label: string; on: string; off: string }[] = [
  {
    key: 'again',
    label: 'Again',
    on: 'border-primary bg-primary text-white',
    off: 'border-border bg-card text-primary-deep hover:border-primary',
  },
  {
    key: 'hard',
    label: 'Hard',
    on: 'border-accent-deep bg-accent text-foreground',
    off: 'border-border bg-card text-accent-deep hover:border-accent',
  },
  {
    key: 'easy',
    label: 'Easy',
    on: 'border-secondary bg-secondary text-white',
    off: 'border-border bg-card text-secondary-deep hover:border-secondary',
  },
];

const MODES = [
  { key: 'listen' as const, label: 'Listen' },
  { key: 'speak' as const, label: 'Speak' },
];

export interface PracticeContentProps {
  lesson?: LessonDetail;
  isLoading: boolean;
  isError: boolean;
  mode: 'listen' | 'speak';
  setMode: (m: 'listen' | 'speak') => void;
  assessments: Record<string, Assessment>;
  playedIds: Set<string>;
  playingId: string | null;
  onAssess: (id: string, a: Assessment) => void;
  onPlay: (id: string, text: string, audioUrl: string | null) => void;
}

export function PracticeContent({
  lesson,
  isLoading,
  isError,
  mode,
  setMode,
  assessments,
  playedIds,
  playingId,
  onAssess,
  onPlay,
}: PracticeContentProps) {
  const doneCount = Object.keys(assessments).length;
  const total = lesson?.sentences.length ?? 0;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

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
          <div className="mt-4 h-24 animate-pulse rounded-3xl border border-border bg-card" />
        </div>
      )}

      {isError && (
        <div className="mt-10 rounded-3xl border border-border bg-card p-8 text-center">
          <p className="font-display text-lg font-semibold text-foreground">Lesson not found</p>
          <p className="mt-1 text-sm text-muted-foreground">It may have been moved or removed.</p>
        </div>
      )}

      {lesson && (
        <>
          <Reveal>
            <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground">{lesson.title}</h1>
            {lesson.description && <p className="mt-1.5 text-muted-foreground">{lesson.description}</p>}
          </Reveal>

          <section className="mt-6">
            {/* Mode toggle */}
            <div className="mb-4 inline-flex rounded-full border border-border bg-card p-1">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                    mode === m.key
                      ? 'bg-primary text-white shadow-[var(--shadow-primary)]'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === 'speak' ? (
              <VoicePracticeList sentences={lesson.sentences} />
            ) : (
              <>
                {/* Sticky progress */}
                <div className="sticky top-16 z-10 -mx-1 mb-4 rounded-2xl border border-border bg-card/85 px-4 py-3 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {doneCount} / {total} assessed
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <ol className="flex flex-col gap-3">
                  {lesson.sentences.map((s) => {
                    const assessed = assessments[s.id];
                    const played = playedIds.has(s.id);
                    const isPlaying = playingId === s.id;

                    return (
                      <li
                        key={s.id}
                        className={cn(
                          'rounded-3xl border p-5 shadow-[var(--shadow-soft)] transition-colors',
                          assessed === 'easy'
                            ? 'border-secondary/40 bg-secondary-soft/40'
                            : assessed === 'hard'
                              ? 'border-accent-deep/30 bg-accent-soft/40'
                              : assessed === 'again'
                                ? 'border-primary/40 bg-primary-soft/40'
                                : 'border-border bg-card'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <span className="relative mt-0.5 inline-flex shrink-0">
                            {isPlaying && (
                              <span className="absolute inset-0 rounded-full bg-primary/40 animate-[pulse-ring_1.5s_ease-out_infinite]" />
                            )}
                            <button
                              onClick={() => onPlay(s.id, s.text, s.audioUrl)}
                              aria-label="Play sentence"
                              className="relative grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-[var(--shadow-primary)] transition-transform hover:scale-105 active:scale-95"
                            >
                              <Volume2 size={18} />
                            </button>
                          </span>

                          <div className="min-w-0 flex-1">
                            {isPlaying ? (
                              <Waveform className="h-5 w-28 text-primary" />
                            ) : (
                              <p className="font-display text-lg font-medium leading-snug text-foreground">{s.text}</p>
                            )}
                            {!isPlaying && s.ipa && (
                              <p className="mt-1 font-mono text-sm text-secondary-deep">{s.ipa}</p>
                            )}
                            {!isPlaying && s.translation && (
                              <p className="mt-0.5 text-sm text-subtle">{s.translation}</p>
                            )}

                            {played && (
                              <div className="mt-4 flex gap-2">
                                {CHIPS.map((c) => (
                                  <button
                                    key={c.key}
                                    onClick={() => onAssess(s.id, c.key)}
                                    className={cn(
                                      'inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                                      assessed === c.key ? c.on : c.off
                                    )}
                                  >
                                    {assessed === c.key && <Check size={13} />}
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {progress === 100 && (
                  <div className="mt-6 rounded-3xl border border-secondary/40 bg-secondary-soft/50 p-6 text-center">
                    <p className="font-display text-xl font-semibold text-secondary-deep">Lesson complete! 🎉</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Nicely done. Keep your streak going with another lesson.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}
