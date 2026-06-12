import type { LessonDetail, LessonSummary } from '@elearning/contracts';
import { createQuery } from 'react-query-kit';

import { getLesson, getLessons } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

export const useLessons = createQuery<LessonSummary[]>({
  queryKey: queryKeys.lessons,
  fetcher: () => getLessons(),
});

export const useLesson = createQuery<LessonDetail, { slug: string }>({
  queryKey: queryKeys.lessonDetail,
  fetcher: ({ slug }) => getLesson(slug),
});
