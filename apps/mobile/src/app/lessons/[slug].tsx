import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { PracticeScreen } from '@/features/lessons/practice-screen';

const DASH_REGEX = /-/g;

export default function LessonDetailPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return (
    <>
      <Stack.Screen options={{ title: slug?.replace(DASH_REGEX, ' ') ?? 'Lesson' }} />
      <PracticeScreen slug={slug} />
    </>
  );
}
