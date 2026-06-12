import { useRouter } from 'expo-router';
import * as React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';

import { Cover } from './components/cover';

export function OnboardingScreen() {
  const [, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();

  return (
    <View className="flex h-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <View className="w-full flex-1">
        <Cover />
      </View>
      <View className="justify-end px-6">
        <Text className="my-3 text-center text-5xl font-extrabold">
          Speak with confidence
        </Text>
        <Text className="mb-2 text-center text-base text-neutral-500">
          Listen, shadow, and speak your way to fluency.
        </Text>

        <Text className="my-1 pt-4 text-left text-base">
          🔊 Practice by sound — shadow native speakers
        </Text>
        <Text className="my-1 text-left text-base">
          🗣️ Speak out loud from the very first minute
        </Text>
        <Text className="my-1 text-left text-base">
          📈 Track your streak and daily progress
        </Text>
        <Text className="my-1 text-left text-base">
          🏆 Spaced-repetition review that sticks
        </Text>
      </View>
      <SafeAreaView className="mt-6 w-full px-6">
        <Button
          label="Get started"
          onPress={() => {
            setIsFirstTime(false);
            router.replace('/login');
          }}
          className="h-12 rounded-full bg-primary-500"
          textClassName="text-white"
        />
      </SafeAreaView>
    </View>
  );
}
