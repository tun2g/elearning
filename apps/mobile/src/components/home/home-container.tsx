import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui';
import { useHomeData } from '@/hooks/use-home';

import { HomeContent } from './home-content';

export function HomeContainer() {
  const { data, isPending, isError } = useHomeData();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-900">
        <Text className="text-center text-neutral-500">
          Could not load home data. Are you logged in?
        </Text>
      </View>
    );
  }

  return <HomeContent data={data} />;
}
