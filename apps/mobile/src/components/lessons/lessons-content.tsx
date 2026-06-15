import type { LessonSummary } from '@elearning/contracts';
import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { FocusAwareStatusBar, Text } from '@/components/ui';

function LessonCard({ item }: { item: LessonSummary }) {
  return (
    <Link href={`/lessons/${item.slug}`} asChild>
      <Pressable
        className="mx-4 mb-3 rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800"
        testID={`lesson-card-${item.slug}`}
      >
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1 flex-row items-center gap-3">
            <View className="size-11 items-center justify-center rounded-2xl bg-primary-100">
              <Text className="text-lg">🎤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold">{item.title}</Text>
              <Text className="mt-0.5 text-xs text-neutral-400">
                {item.sentenceCount}
                {' '}
                sentences
                {item.topic ? ` · ${item.topic.title}` : ''}
              </Text>
            </View>
          </View>
          <View className="rounded-full bg-neutral-100 px-2.5 py-0.5 dark:bg-neutral-700">
            <Text className="text-xs text-neutral-500 capitalize">
              {item.level}
            </Text>
          </View>
        </View>

        {item.description
          ? (
              <Text className="mt-3 text-sm text-neutral-500">{item.description}</Text>
            )
          : null}

        <Text className="mt-3 text-sm font-semibold text-primary-600">
          Start lesson →
        </Text>
      </Pressable>
    </Link>
  );
}

export type LessonsContentProps = {
  data?: LessonSummary[];
  isPending: boolean;
  isError: boolean;
};

export function LessonsContent({ data, isPending, isError }: LessonsContentProps) {
  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />

      {isPending && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-neutral-500">
            Could not reach the API. Is @elearning/api running?
          </Text>
        </View>
      )}

      {!isPending && (
        <FlashList
          data={data}
          keyExtractor={item => item.id}
          ListHeaderComponent={(
            <View className="px-4 pt-6 pb-4">
              <Text className="text-3xl font-extrabold">Practice by sound</Text>
              <Text className="mt-1.5 text-sm text-neutral-500">
                Pick a lesson, listen to each line, then say it back.
              </Text>
            </View>
          )}
          renderItem={({ item }) => <LessonCard item={item} />}
          ListEmptyComponent={
            !isError
              ? (
                  <View className="px-4 py-8">
                    <Text className="text-center text-neutral-400">
                      No lessons yet — run the API seed.
                    </Text>
                  </View>
                )
              : null
          }
        />
      )}
    </View>
  );
}
