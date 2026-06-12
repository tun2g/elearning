import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui';
import { useVocabAttempt, useVocabReview } from '@/hooks/use-vocab';

import { VocabContent } from './vocab-content';

type Assessment = 'again' | 'hard' | 'easy';

export function VocabContainer() {
  const { data: queue, isPending, refetch } = useVocabReview();
  const { mutateAsync: recordAttempt } = useVocabAttempt();
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!queue || queue.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-neutral-50 px-8 dark:bg-neutral-900">
        <Text className="text-4xl">🎉</Text>
        <Text className="text-center text-2xl font-bold">All caught up!</Text>
        <Text className="text-center text-sm text-neutral-500">
          No vocabulary cards due for review right now.
        </Text>
      </View>
    );
  }

  const card = queue[index];

  const assess = async (assessment: Assessment) => {
    await recordAttempt({
      vocabId: card.id,
      correct: assessment === 'easy',
      assessment,
    });
    if (index + 1 >= queue.length) {
      await refetch();
      setIndex(0);
    }
    else {
      setIndex(i => i + 1);
    }
    setFlipped(false);
  };

  return (
    <VocabContent
      queue={queue}
      index={index}
      flipped={flipped}
      onFlip={() => setFlipped(true)}
      onAssess={assess}
    />
  );
}
