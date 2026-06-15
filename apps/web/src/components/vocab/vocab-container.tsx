'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useVocabAttempt, useVocabReview, useVocabTopicSession } from '@/hooks/use-vocab';
import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import type { Assessment } from '@/services/types';

import { VocabContent } from './vocab-content';

export function VocabContainer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { slug: topicSlug } = useParams<{ slug?: string }>();
  const isTopic = Boolean(topicSlug);
  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken());

  const review = useVocabReview({ enabled: hasToken && !isTopic });
  const topic = useVocabTopicSession({ variables: { slug: topicSlug ?? '' }, enabled: hasToken && isTopic });
  const queue = isTopic ? topic.data : review.data;
  const isLoading = isTopic ? topic.isLoading : review.isLoading;
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

  const mode = isTopic ? 'browse' : 'review';
  const cards = queue ?? [];
  const card = cards[index];
  const heading = isTopic ? (cards[0]?.topic?.title ?? 'Topic study') : 'Vocabulary review';

  // Review (SRS): grade each card, then advance; the last grade ends the session.
  const onAssess = (assessment: Assessment) => {
    if (card) attempt.mutate({ vocabId: card.id, assessment });
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  // Browse (topic): plain navigation through the deck, no grading.
  const onPrev = () => {
    if (index === 0) return;
    setIndex((i) => i - 1);
    setFlipped(false);
  };
  const onNext = () => {
    if (index + 1 >= cards.length) {
      router.push('/vocab');
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  return (
    <VocabContent
      mode={mode}
      cards={cards}
      index={index}
      flipped={flipped}
      isLoading={isLoading}
      hasToken={hasToken}
      done={done}
      heading={heading}
      onFlip={() => setFlipped(true)}
      onAssess={onAssess}
      onPrev={onPrev}
      onNext={onNext}
    />
  );
}
