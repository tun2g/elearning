'use client';

import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Waveform } from '@/components/waveform';
import { useVocabAttempt, useVocabReview } from '@/features/vocab/api';
import type { Assessment } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import { cn } from '@/lib/utils';

function speak(word: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
}

const CHIPS: { key: Assessment; label: string; cls: string }[] = [
  { key: 'again', label: 'Again', cls: 'bg-primary-soft text-primary-deep hover:bg-primary hover:text-white' },
  { key: 'hard', label: 'Hard', cls: 'bg-accent-soft text-accent-deep hover:bg-accent hover:text-foreground' },
  { key: 'easy', label: 'Easy', cls: 'bg-secondary-soft text-secondary-deep hover:bg-secondary hover:text-white' },
];

export default function VocabPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken());
  const { data: queue, isLoading } = useVocabReview({ enabled: hasToken });
  const attempt = useVocabAttempt({
    onSuccess: () => {
      // refresh the dashboard (XP/streak); don't touch the review queue mid-session
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    },
    onError: () => {
      if (!getAccessToken()) router.replace('/login');
    },
  });

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !getAccessToken()) {
      router.replace('/login');
    }
  }, [router]);

  const cards = queue ?? [];
  const card = cards[index];

  const assess = (assessment: Assessment) => {
    if (card) attempt.mutate({ vocabId: card.id, assessment });
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  if (isLoading || !hasToken) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5">
        <Waveform className="h-8 w-32 text-primary/50" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your cards…</p>
      </main>
    );
  }

  if (done || cards.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-3 px-5 text-center">
        <span className="text-4xl">🎉</span>
        <p className="font-display text-2xl font-semibold text-foreground">All caught up!</p>
        <p className="text-sm text-muted-foreground">No vocabulary cards due for review right now.</p>
        <a href="/lessons" className="mt-2 text-sm font-semibold text-primary-deep hover:underline">
          Go practice a lesson →
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col px-5 py-8 sm:py-10">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Vocabulary review</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
          {index + 1} / {cards.length}
        </span>
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      {/* Flip card */}
      <div className="[perspective:1600px]">
        <motion.div
          onClick={() => !flipped && setFlipped(true)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-h-72 w-full cursor-pointer [transform-style:preserve-3d]"
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-lift)] [backface-visibility:hidden]">
            <p className="font-display text-4xl font-semibold text-foreground">{card?.word}</p>
            {card?.ipa && <p className="mt-2 font-mono text-base text-secondary-deep">{card.ipa}</p>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(card?.word ?? '');
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition-transform hover:scale-105 active:scale-95"
            >
              <Volume2 size={16} /> Listen
            </button>
            <p className="mt-6 text-xs text-subtle">Tap card to reveal meaning</p>
          </div>

          {/* Back */}
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-lift)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="font-display text-2xl font-semibold text-foreground">{card?.word}</p>
            {card?.ipa && <p className="mt-1 font-mono text-sm text-secondary-deep">{card.ipa}</p>}
            <p className="mt-3 text-xl font-medium text-primary-deep">{card?.meaningVn}</p>
            {card?.synonyms && card.synonyms.length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">Synonyms: {card.synonyms.join(', ')}</p>
            )}
            {card?.exampleSentences?.[0] && (
              <p className="mt-3 text-sm italic text-subtle">“{card.exampleSentences[0]}”</p>
            )}
          </div>
        </motion.div>
      </div>

      {flipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex gap-3"
        >
          {CHIPS.map((c) => (
            <button
              key={c.key}
              onClick={() => assess(c.key)}
              className={cn('flex-1 rounded-2xl py-3.5 text-sm font-semibold transition-colors', c.cls)}
            >
              {c.label}
            </button>
          ))}
        </motion.div>
      )}
    </main>
  );
}
