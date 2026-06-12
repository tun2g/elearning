import type { LessonDetail, LessonSummary } from '@elearning/contracts';

import { apiGet } from '@/lib/api';

export function getLessons(): Promise<LessonSummary[]> {
  return apiGet<LessonSummary[]>('/lessons');
}

export function getLesson(slug: string): Promise<LessonDetail> {
  return apiGet<LessonDetail>(`/lessons/${slug}`);
}
