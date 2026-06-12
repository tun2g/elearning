import { createMutation, createQuery } from 'react-query-kit';

import { getAccessToken } from '@/lib/auth';
import {
  getLessonState,
  postPracticeAttempt,
  postVoiceAttempt,
  type LessonState,
  type VoiceAttemptResult,
} from '@/services/practice';
import type { Assessment } from '@/services/types';
import { queryKeys } from '@/lib/query-keys';

export const usePracticeAttempt = createMutation({
  mutationFn: (input: { sentenceId: string; assessment: Assessment }) => {
    const token = getAccessToken();
    if (!token) return Promise.resolve(undefined); // guest — no persistence
    return postPracticeAttempt(token, input);
  },
});

export const useVoiceAttempt = createMutation<
  VoiceAttemptResult,
  { sentenceId: string; audioBase64: string; mimeType: string }
>({
  mutationFn: (input) => {
    const token = getAccessToken();
    // Voice evaluation is gated to authenticated users (it costs an API call).
    if (!token) return Promise.reject(new Error('Sign in to use speaking practice'));
    return postVoiceAttempt(token, input);
  },
});

export const useLessonState = createQuery<LessonState, { lessonId: string }>({
  queryKey: queryKeys.lessonState,
  fetcher: ({ lessonId }) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getLessonState(token, lessonId);
  },
});
