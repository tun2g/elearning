import type { Topic } from '@elearning/contracts';

import { apiGet } from '@/lib/api';

export interface TopicQuery {
  category?: string;
  level?: string;
  hasVocab?: boolean;
}

export function getTopics(query: TopicQuery = {}): Promise<Topic[]> {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.level) params.set('level', query.level);
  if (query.hasVocab) params.set('hasVocab', 'true');
  const qs = params.toString();
  return apiGet<Topic[]>(`/topics${qs ? `?${qs}` : ''}`);
}
