'use client';

import type { LessonDetail } from '@elearning/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Waveform } from '@/components/waveform';
import { useLessonState, usePracticeAttempt } from '@/features/practice/api';
import type { Assessment } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import { cn } from '@/lib/utils';

function speak(text: string, audioUrl: string | null) {
  if (audioUrl) {
    new Audio(audioUrl).play().catch(() => undefined);
    return;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}

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

export function PracticeClient({ lesson }: { lesson: LessonDetail }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [assessments, setAssessments] = useState<Record<string, Assessment>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());

  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken());
  const { data: savedState } = useLessonState({
    variables: { lessonId: lesson.id },
    enabled: hasToken,
  });

  // Restore saved progress on load (server is the baseline; local edits win).
  useEffect(() => {
    if (!savedState?.attempts.length) return;
    const restored: Record<string, Assessment> = {};
    const played = new Set<string>();
    for (const a of savedState.attempts) {
      restored[a.sentenceId] = a.selfAssessment;
      played.add(a.sentenceId);
    }
    setAssessments((prev) => ({ ...restored, ...prev }));
    setPlayedIds((prev) => new Set([...played, ...prev]));
  }, [savedState]);

  const attempt = usePracticeAttempt({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    },
    onError: () => {
      // a cleared token means the silent-refresh failed → session is gone
      if (!getAccessToken()) router.replace('/login');
    },
  });

  const assess = (id: string, a: Assessment) => {
    setAssessments((prev) => ({ ...prev, [id]: a }));
    attempt.mutate({ sentenceId: id, assessment: a });
  };

  const onPlay = (id: string, text: string, audioUrl: string | null) => {
    speak(text, audioUrl);
    setPlayedIds((prev) => new Set(prev).add(id));
    setPlayingId(id);
    window.setTimeout(() => setPlayingId((p) => (p === id ? null : p)), 1500);
  };

  const doneCount = Object.keys(assessments).length;
  const total = lesson.sentences.length;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <section className="mt-6">
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
                  {!isPlaying && s.ipa && <p className="mt-1 font-mono text-sm text-secondary-deep">{s.ipa}</p>}
                  {!isPlaying && s.translation && <p className="mt-0.5 text-sm text-subtle">{s.translation}</p>}

                  {played && (
                    <div className="mt-4 flex gap-2">
                      {CHIPS.map((c) => (
                        <button
                          key={c.key}
                          onClick={() => assess(s.id, c.key)}
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
          <p className="mt-1 text-sm text-muted-foreground">Nicely done. Keep your streak going with another lesson.</p>
        </div>
      )}
    </section>
  );
}
