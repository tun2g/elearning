'use client';

import { useMemo, useState } from 'react';

import { useLessons } from '@/hooks/use-lessons';

import { LessonsContent } from './lessons-content';

export function LessonsContainer() {
  const { data: lessons, isLoading } = useLessons();
  const [level, setLevel] = useState<string>('all');

  const levels = useMemo(() => {
    const set = new Set((lessons ?? []).map((l) => l.level));
    return ['all', ...Array.from(set)];
  }, [lessons]);

  const filtered = (lessons ?? []).filter((l) => level === 'all' || l.level === level);

  return (
    <LessonsContent
      lessons={lessons}
      isLoading={isLoading}
      level={level}
      levels={levels}
      filtered={filtered}
      onLevelChange={setLevel}
    />
  );
}
