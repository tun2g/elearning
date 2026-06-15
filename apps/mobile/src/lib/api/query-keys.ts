/**
 * Centralized query keys — single source of truth for every React Query cache key.
 * Feature `api.ts` hooks reference these so keys never drift between queries,
 * invalidations, and prefetches. react-query-kit appends a hook's `variables` to
 * its base key automatically (e.g. `lessonDetail` → ['lessons','detail',{slug}]).
 */
export const queryKeys = {
  home: ['home'],
  lessons: ['lessons'],
  lessonDetail: ['lessons', 'detail'],
  vocabReview: ['vocab', 'review'],
  posts: ['posts'],
  leaderboard: ['leaderboard'],
  me: ['auth', 'me'],
  settings: ['settings'],
  notifications: ['notifications'],
} as const;
