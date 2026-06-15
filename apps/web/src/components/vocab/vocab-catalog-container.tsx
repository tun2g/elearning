'use client';

import { useMemo } from 'react';

import { useTopics } from '@/hooks/use-taxonomy';

import { VocabCatalogContent, type CategoryGroup } from './vocab-catalog-content';

export function VocabCatalogContainer() {
  const { data: topics, isLoading } = useTopics({ variables: { hasVocab: true } });

  // Topics arrive ordered by category then topic, so first-seen order is the display order.
  const groups = useMemo<CategoryGroup[]>(() => {
    const byCategory = new Map<string, CategoryGroup>();
    for (const topic of topics ?? []) {
      const { slug, title } = topic.category;
      let group = byCategory.get(slug);
      if (!group) {
        group = { slug, title, topics: [] };
        byCategory.set(slug, group);
      }
      group.topics.push(topic);
    }
    return Array.from(byCategory.values());
  }, [topics]);

  return <VocabCatalogContent groups={groups} isLoading={isLoading} />;
}
