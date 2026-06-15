import { createMutation, createQuery } from 'react-query-kit';

import { getAccessToken } from '@/lib/auth';
import {
  getLessonProgress,
  getLessonState,
  postVoiceEvaluate,
  postVoiceTranscribe,
  type LessonProgress,
  type LessonState,
  type VoiceAttemptResult,
  type VoiceTranscriptionResult,
} from '@/services/practice';
import { queryKeys } from '@/lib/query-keys';

export const useLessonProgress = createQuery<LessonProgress[]>({
  queryKey: queryKeys.lessonProgress,
  fetcher: () => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getLessonProgress(token);
  },
});

export const useVoiceTranscribe = createMutation<
  VoiceTranscriptionResult,
  { sentenceId: string; audioBase64: string; mimeType: string }
>({
  mutationFn: (input) => {
    const token = getAccessToken();
    // Voice practice is gated to authenticated users (it costs an API call).
    if (!token) return Promise.reject(new Error('Sign in to use speaking practice'));
    return postVoiceTranscribe(token, input);
  },
});

export const useVoiceEvaluate = createMutation<
  VoiceAttemptResult,
  { attemptId: string; sentenceId: string; audioBase64: string; mimeType: string }
>({
  mutationFn: (input) => {
    const token = getAccessToken();
    if (!token) return Promise.reject(new Error('Sign in to use speaking practice'));
    return postVoiceEvaluate(token, input);
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
