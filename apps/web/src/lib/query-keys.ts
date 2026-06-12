/**
 * Centralized query keys — the single source of truth for every TanStack Query
 * cache key in the web app. Feature `api.ts` hooks reference these so keys never
 * drift between queries, invalidations, and prefetches.
 *
 * react-query-kit appends a hook's `variables` to its base key automatically,
 * so these are base arrays (e.g. `lessonDetail` resolves to ['lessons','detail',{slug}]).
 */
export const queryKeys = {
  home: ['home'],
  lessons: ['lessons'],
  lessonDetail: ['lessons', 'detail'],
  lessonState: ['practice', 'lesson-state'],
  vocabReview: ['vocab', 'review'],
  me: ['auth', 'me'],
} as const;
