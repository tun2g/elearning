import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useLesson } from '@/hooks/use-lessons';

import { PracticeContent } from './practice-content';

type Assessment = 'again' | 'hard' | 'easy';

export function PracticeContainer({ slug }: { slug: string }) {
  const { data: lesson, isPending } = useLesson({ variables: { slug } });
  const [done, setDone] = React.useState<Record<string, Assessment>>({});
  const [mode, setMode] = React.useState<'listen' | 'speak'>('listen');

  if (isPending || !lesson) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <PracticeContent
      lesson={lesson}
      mode={mode}
      setMode={setMode}
      done={done}
      onAssess={(sentenceId, a) => setDone(d => ({ ...d, [sentenceId]: a }))}
    />
  );
}
