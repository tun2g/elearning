'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLesson } from '@/hooks/use-lessons';
import { useLessonState, usePracticeAttempt } from '@/hooks/use-practice';
import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import type { Assessment } from '@/services/types';

import { PracticeContent } from './practice-content';

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

export function PracticeContainer() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lesson, isLoading, isError } = useLesson({ variables: { slug } });

  const [mode, setMode] = useState<'listen' | 'speak'>('listen');
  const [assessments, setAssessments] = useState<Record<string, Assessment>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());

  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken());
  const { data: savedState } = useLessonState({
    variables: { lessonId: lesson?.id ?? '' },
    enabled: hasToken && Boolean(lesson?.id),
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
      if (!getAccessToken()) router.replace('/login');
    },
  });

  const onAssess = (id: string, a: Assessment) => {
    setAssessments((prev) => ({ ...prev, [id]: a }));
    attempt.mutate({ sentenceId: id, assessment: a });
  };

  const onPlay = (id: string, text: string, audioUrl: string | null) => {
    speak(text, audioUrl);
    setPlayedIds((prev) => new Set(prev).add(id));
    setPlayingId(id);
    window.setTimeout(() => setPlayingId((p) => (p === id ? null : p)), 1500);
  };

  return (
    <PracticeContent
      lesson={lesson}
      isLoading={isLoading}
      isError={isError}
      mode={mode}
      setMode={setMode}
      assessments={assessments}
      playedIds={playedIds}
      playingId={playingId}
      onAssess={onAssess}
      onPlay={onPlay}
    />
  );
}
