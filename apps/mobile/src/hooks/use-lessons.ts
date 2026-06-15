import type { LessonDetail, LessonSummary, VoiceAttemptResult, VoiceTranscriptionResult } from '@elearning/contracts';
import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import { client } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { getToken } from '@/lib/auth/utils';

export const useLessons = createQuery<LessonSummary[], void, AxiosError>({
  queryKey: queryKeys.lessons,
  fetcher: () => client.get<LessonSummary[]>('/lessons').then(r => r.data),
});

export const useLesson = createQuery<LessonDetail, { slug: string }, AxiosError>({
  queryKey: queryKeys.lessonDetail,
  fetcher: ({ slug }) =>
    client.get<LessonDetail>(`/lessons/${slug}`).then(r => r.data),
});

export const useVoiceTranscribe = createMutation<
  VoiceTranscriptionResult,
  { sentenceId: string; audioBase64: string; mimeType: string },
  AxiosError
>({
  mutationFn: (input) => {
    // Voice practice is gated to authenticated users (it costs an API call).
    if (!getToken()?.access)
      return Promise.reject(new Error('Sign in to use speaking practice'));
    return client
      .post<VoiceTranscriptionResult>('/practice/voice-attempt', input)
      .then(r => r.data);
  },
});

export const useVoiceEvaluate = createMutation<
  VoiceAttemptResult,
  { attemptId: string; sentenceId: string; audioBase64: string; mimeType: string },
  AxiosError
>({
  mutationFn: (input) => {
    if (!getToken()?.access)
      return Promise.reject(new Error('Sign in to use speaking practice'));
    return client
      .post<VoiceAttemptResult>('/practice/voice-attempt/evaluate', input)
      .then(r => r.data);
  },
});
