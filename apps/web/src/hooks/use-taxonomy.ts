import type { Topic } from '@elearning/contracts';
import { createQuery } from 'react-query-kit';

import { getTopics, type TopicQuery } from '@/services/taxonomy';
import { queryKeys } from '@/lib/query-keys';

export const useTopics = createQuery<Topic[], TopicQuery>({
  queryKey: queryKeys.topics,
  fetcher: (variables) => getTopics(variables),
});
