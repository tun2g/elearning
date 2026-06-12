import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { PracticeContainer } from '@/components/practice/practice-container';

const DASH_REGEX = /-/g;

export default function LessonDetailPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return (
    <>
      <Stack.Screen options={{ title: slug?.replace(DASH_REGEX, ' ') ?? 'Lesson' }} />
      <PracticeContainer slug={slug} />
    </>
  );
}
