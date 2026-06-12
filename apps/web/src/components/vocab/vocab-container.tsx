'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useVocabAttempt, useVocabReview } from '@/hooks/use-vocab';
import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import type { Assessment } from '@/services/types';

import { VocabContent } from './vocab-content';

export function VocabContainer() {
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

  const onAssess = (assessment: Assessment) => {
    if (card) attempt.mutate({ vocabId: card.id, assessment });
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  return (
    <VocabContent
      cards={cards}
      index={index}
      flipped={flipped}
      isLoading={isLoading}
      hasToken={hasToken}
      done={done}
      onFlip={() => setFlipped(true)}
      onAssess={onAssess}
    />
  );
}
