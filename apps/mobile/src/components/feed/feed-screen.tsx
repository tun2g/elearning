import type { Post } from '@/hooks/use-feed';
import { FlashList } from '@shopify/flash-list';

import * as React from 'react';
import { EmptyList, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { usePosts } from '@/hooks/use-feed';
import { PostCard } from './post-card';

export function FeedScreen() {
  const { data, isPending, isError } = usePosts();
  const renderItem = React.useCallback(
    ({ item }: { item: Post }) => <PostCard {...item} />,
    [],
  );

  if (isError) {
    return (
      <View>
        <Text> Error Loading data </Text>
      </View>
    );
  }
  return (
    <View className="flex-1">
      <FocusAwareStatusBar />
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => `item-${index}`}
        ListEmptyComponent={<EmptyList isLoading={isPending} />}
      />
    </View>
  );
}
