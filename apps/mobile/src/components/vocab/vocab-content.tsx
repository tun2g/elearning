import type { VocabCard } from '@/hooks/use-vocab';
import * as Speech from 'expo-speech';
import { MotiView } from 'moti';
import * as React from 'react';

import { Pressable, View } from 'react-native';

import { FocusAwareStatusBar, Text } from '@/components/ui';

type Assessment = 'again' | 'hard' | 'easy';

const ASSESSMENT_BG: Record<Assessment, string> = {
  again: 'bg-primary-500/15 border border-primary-500/30',
  hard: 'bg-accent-500/15 border border-accent-500/30',
  easy: 'bg-secondary-500/15 border border-secondary-500/30',
};

const ASSESSMENT_TEXT: Record<Assessment, string> = {
  again: 'text-primary-300',
  hard: 'text-accent-300',
  easy: 'text-secondary-300',
};

function CardFront({ card }: { card: VocabCard }) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="items-center gap-2"
    >
      <Text className="text-4xl font-extrabold">{card.word}</Text>
      {card.ipa
        ? <Text className="text-base text-secondary-600">{card.ipa}</Text>
        : null}
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          Speech.stop();
          Speech.speak(card.word, { language: 'en-US' });
        }}
        className="mt-3 flex-row items-center rounded-full bg-primary-500 px-4 py-2"
      >
        <Text className="text-sm font-semibold text-white">▶ Listen</Text>
      </Pressable>
      <Text className="mt-5 text-xs text-neutral-400">
        Tap card to reveal meaning
      </Text>
    </MotiView>
  );
}

function CardBack({ card }: { card: VocabCard }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="items-center gap-2"
    >
      <Text className="text-2xl font-bold">{card.word}</Text>
      <Text className="text-xl font-medium text-primary-600">
        {card.meaningVn}
      </Text>
      {card.synonyms?.length > 0 && (
        <Text className="text-xs text-neutral-500">
          {`Synonyms: ${card.synonyms.join(', ')}`}
        </Text>
      )}
      {card.exampleSentences?.[0] && (
        <Text className="mt-2 text-sm text-neutral-400 italic">
          {`“${card.exampleSentences[0]}”`}
        </Text>
      )}
    </MotiView>
  );
}

function AssessmentBar({ onAssess }: { onAssess: (a: Assessment) => void }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="mx-4 mt-6 flex-row gap-3"
    >
      {(['again', 'hard', 'easy'] as Assessment[]).map(a => (
        <Pressable
          key={a}
          onPress={() => onAssess(a)}
          className={`flex-1 items-center rounded-2xl py-4 ${ASSESSMENT_BG[a]}`}
        >
          <Text className={`font-bold capitalize ${ASSESSMENT_TEXT[a]}`}>
            {a}
          </Text>
        </Pressable>
      ))}
    </MotiView>
  );
}

export type VocabContentProps = {
  queue: VocabCard[];
  index: number;
  flipped: boolean;
  onFlip: () => void;
  onAssess: (a: Assessment) => void;
};

export function VocabContent({ queue, index, flipped, onFlip, onAssess }: VocabContentProps) {
  const card = queue[index];

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <View className="px-4 pt-6 pb-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-extrabold">Vocabulary review</Text>
          <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
            <Text className="text-xs font-medium text-neutral-500">
              {`${index + 1} / ${queue.length}`}
            </Text>
          </View>
        </View>
        <View className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
          <View
            className="h-full rounded-full bg-primary-500"
            style={{ width: `${(index / queue.length) * 100}%` }}
          />
        </View>
      </View>

      <Pressable
        onPress={onFlip}
        className="mx-4 mt-4 min-h-64 items-center justify-center rounded-3xl border border-neutral-200 bg-white p-7 dark:border-neutral-700 dark:bg-neutral-800"
      >
        {flipped ? <CardBack card={card} /> : <CardFront card={card} />}
      </Pressable>

      {flipped && <AssessmentBar onAssess={onAssess} />}
    </View>
  );
}
