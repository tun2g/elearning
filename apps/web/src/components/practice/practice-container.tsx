'use client';

import type { PronunciationAssessment } from '@elearning/contracts';
import { isPassing } from '@elearning/core';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useLesson } from '@/hooks/use-lessons';
import { useSeedReviewWords } from '@/hooks/use-vocab';
import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';

import { PracticeContent } from './practice-content';
import { trickyWords, type SentenceResult } from './practice-result';

export function PracticeContainer() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lesson, isLoading, isError } = useLesson({ variables: { slug } });

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, SentenceResult>>({});
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);
  const [seededCount, setSeededCount] = useState(0);
  const seededRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !getAccessToken()) {
      router.replace('/login');
    }
  }, [router]);

  const seedReview = useSeedReviewWords({
    onSuccess: (res) => {
      setSeededCount(res.seeded);
      if (res.seeded > 0) void queryClient.invalidateQueries({ queryKey: queryKeys.vocabReview });
    },
  });

  // On finishing, push the words the learner mispronounced into vocab review.
  useEffect(() => {
    if (!finished || seededRef.current || !lesson) return;
    seededRef.current = true;
    const words = trickyWords(lesson, results);
    if (words.length > 0) seedReview.mutate({ words });
  }, [finished, lesson, results, seedReview]);

  const total = lesson?.sentences.length ?? 0;
  const current = lesson?.sentences[index];
  const completedCount = Object.values(results).filter((r) => r.passed).length;
  const canAdvance = current ? Boolean(results[current.id]?.passed) || skipped.has(current.id) : false;

  // A scored recording arrived. Store pass/fail and refresh the screens whose
  // numbers it changes (home streak/XP, the lessons-list completion).
  const onResult = (sentenceId: string, assessment: PronunciationAssessment) => {
    setResults((prev) => ({ ...prev, [sentenceId]: { passed: isPassing(assessment.overall), assessment } }));
    void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    void queryClient.invalidateQueries({ queryKey: queryKeys.lessonProgress });
  };

  const advance = () => {
    if (index + 1 >= total) setFinished(true);
    else setIndex((i) => i + 1);
  };

  const onNext = () => {
    if (canAdvance) advance();
  };
  const onSkip = () => {
    if (current) setSkipped((prev) => new Set(prev).add(current.id));
    advance();
  };
  const onPrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };
  const onRestart = () => {
    setResults({});
    setSkipped(new Set());
    setIndex(0);
    setFinished(false);
    setSeededCount(0);
    seededRef.current = false;
  };

  return (
    <PracticeContent
      lesson={lesson}
      isLoading={isLoading}
      isError={isError}
      index={index}
      completedCount={completedCount}
      finished={finished}
      canAdvance={canAdvance}
      results={results}
      seededCount={seededCount}
      onPrev={onPrev}
      onNext={onNext}
      onSkip={onSkip}
      onResult={onResult}
      onRestart={onRestart}
    />
  );
}
