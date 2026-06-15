'use client';

import type { LessonProgress } from '@elearning/contracts';
import { useMemo, useState } from 'react';

import { useLessons } from '@/hooks/use-lessons';
import { useLessonProgress } from '@/hooks/use-practice';
import { getAccessToken } from '@/lib/auth';

import { LessonsContent } from './lessons-content';

export function LessonsContainer() {
  const { data: lessons, isLoading } = useLessons();
  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken());
  const { data: progress } = useLessonProgress({ enabled: hasToken });
  const [level, setLevel] = useState<string>('all');

  const levels = useMemo(() => {
    const set = new Set((lessons ?? []).map((l) => l.level));
    return ['all', ...Array.from(set)];
  }, [lessons]);

  const progressById = useMemo(() => {
    const map = new Map<string, LessonProgress>();
    for (const p of progress ?? []) map.set(p.lessonId, p);
    return map;
  }, [progress]);

  const filtered = (lessons ?? []).filter((l) => level === 'all' || l.level === level);

  return (
    <LessonsContent
      lessons={lessons}
      isLoading={isLoading}
      level={level}
      levels={levels}
      filtered={filtered}
      progressById={progressById}
      onLevelChange={setLevel}
    />
  );
}
