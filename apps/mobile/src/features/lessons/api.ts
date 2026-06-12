import type { LessonDetail, LessonSummary } from '@elearning/contracts';
import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

export const useLessons = createQuery<LessonSummary[], void, AxiosError>({
  queryKey: queryKeys.lessons,
  fetcher: () => client.get<LessonSummary[]>('/lessons').then(r => r.data),
});

export const useLesson = createQuery<LessonDetail, { slug: string }, AxiosError>({
  queryKey: queryKeys.lessonDetail,
  fetcher: ({ slug }) =>
    client.get<LessonDetail>(`/lessons/${slug}`).then(r => r.data),
});
