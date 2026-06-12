import * as React from 'react';

import { useLessons } from '@/hooks/use-lessons';

import { LessonsContent } from './lessons-content';

export function LessonsContainer() {
  const { data, isPending, isError } = useLessons();

  return <LessonsContent data={data} isPending={isPending} isError={isError} />;
}
