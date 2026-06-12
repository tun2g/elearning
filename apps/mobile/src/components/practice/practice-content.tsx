import type { LessonDetail, Sentence } from '@elearning/contracts';
import * as Speech from 'expo-speech';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { FocusAwareStatusBar, Text } from '@/components/ui';
import { client } from '@/lib/api/client';
import { getToken } from '@/lib/auth/utils';

import { VoicePracticeList } from './voice-practice';

type Assessment = 'again' | 'hard' | 'easy';

function speak(sentence: Sentence) {
  if (sentence.audioUrl)
    return;
  Speech.stop();
  Speech.speak(sentence.text, { language: 'en-US', rate: 0.85 });
}

async function postAttempt(sentenceId: string, assessment: Assessment) {
  if (!getToken()?.access)
    return; // guest — no persistence
  await client
    .post('/practice/attempt', {
      sentenceId,
      mode: 'listen',
      selfAssessment: assessment,
    })
    .catch(() => undefined);
}

const CHIP_ON: Record<Assessment, string> = {
  again: 'border-primary-500 bg-primary-500',
  hard: 'border-accent-500 bg-accent-500',
  easy: 'border-secondary-500 bg-secondary-500',
};

const CARD_TINT: Record<Assessment, string> = {
  again: 'border-primary-500/40 bg-primary-500/10',
  hard: 'border-accent-500/40 bg-accent-500/10',
  easy: 'border-secondary-500/40 bg-secondary-500/10',
};

function SentenceCard({
  sentence,
  onAssess,
}: {
  sentence: Sentence;
  onAssess: (a: Assessment) => void;
}) {
  const [played, setPlayed] = React.useState(false);
  const [assessed, setAssessed] = React.useState<Assessment | null>(null);

  const onPlay = () => {
    speak(sentence);
    setPlayed(true);
  };

  const handle = (a: Assessment) => {
    setAssessed(a);
    onAssess(a);
    void postAttempt(sentence.id, a);
  };

  return (
    <View
      className={`mx-4 mb-3 rounded-3xl border p-5 ${
        assessed
          ? CARD_TINT[assessed]
          : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
      }`}
    >
      <View className="flex-row items-start gap-4">
        <Pressable
          onPress={onPlay}
          className="size-12 shrink-0 items-center justify-center rounded-full bg-primary-500"
          accessibilityLabel="Play sentence"
        >
          <Text className="text-base font-bold text-white">▶</Text>
        </Pressable>

        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-lg font-semibold">{sentence.text}</Text>
          {sentence.ipa
            ? (
                <Text className="text-sm text-secondary-600">{sentence.ipa}</Text>
              )
            : null}
          {sentence.translation
            ? (
                <Text className="text-sm text-neutral-400">{sentence.translation}</Text>
              )
            : null}

          {played && (
            <View className="mt-3 flex-row gap-2">
              {(['again', 'hard', 'easy'] as Assessment[]).map(a => (
                <Pressable
                  key={a}
                  onPress={() => handle(a)}
                  className={`rounded-full border px-3.5 py-1.5 ${
                    assessed === a
                      ? CHIP_ON[a]
                      : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold capitalize ${assessed === a ? 'text-white' : ''}`}
                  >
                    {a}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export type PracticeContentProps = {
  lesson: LessonDetail;
  mode: 'listen' | 'speak';
  setMode: (m: 'listen' | 'speak') => void;
  done: Record<string, Assessment>;
  onAssess: (sentenceId: string, a: Assessment) => void;
};

export function PracticeContent({ lesson, mode, setMode, done, onAssess }: PracticeContentProps) {
  const total = lesson.sentences.length;
  const count = Object.keys(done).length;
  const pct = total ? Math.round((count / total) * 100) : 0;

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="p-4">
          {lesson.description
            ? (
                <Text className="mb-3 text-sm text-neutral-500">
                  {lesson.description}
                </Text>
              )
            : null}

          <View className="mb-4 flex-row self-start rounded-full border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800">
            {(['listen', 'speak'] as const).map(m => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 ${mode === m ? 'bg-primary-500' : ''}`}
              >
                <Text className={`text-sm font-semibold capitalize ${mode === m ? 'text-white' : 'text-neutral-500'}`}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          {mode === 'listen' && (
            <>
              <View className="mb-1.5 flex-row items-center justify-between">
                <Text className="text-xs font-medium text-neutral-500">Progress</Text>
                <Text className="text-xs font-medium text-neutral-500">
                  {count}
                  {' '}
                  /
                  {total}
                </Text>
              </View>
              <View className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                <View
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${pct}%` }}
                />
              </View>
            </>
          )}
        </View>

        {mode === 'speak'
          ? <VoicePracticeList sentences={lesson.sentences} />
          : lesson.sentences.map(sentence => (
              <SentenceCard
                key={sentence.id}
                sentence={sentence}
                onAssess={a => onAssess(sentence.id, a)}
              />
            ))}

        {mode === 'listen' && pct === 100 && (
          <View className="mx-4 mt-3 rounded-3xl border border-secondary-500/40 bg-secondary-500/10 p-5">
            <Text className="text-center text-lg font-bold text-secondary-300">
              Lesson complete! 🎉
            </Text>
            <Text className="mt-1 text-center text-sm text-neutral-500">
              Nicely done — keep your streak going.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
