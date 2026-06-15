import type { Vocabulary } from '@elearning/contracts';

import { toTopicRef } from 'src/modules/content/dtos/topic.mapper';

import { VocabularyEntity } from '../entities/vocabulary.entity';

/** Maps a vocabulary entity to its contract shape. Requires `topic.category` loaded. */
export function toVocabulary(entity: VocabularyEntity): Vocabulary {
  return {
    id: entity.id,
    word: entity.word,
    meaningVn: entity.meaningVn,
    meaningEn: entity.meaningEn,
    ipa: entity.ipa,
    synonyms: entity.synonyms,
    exampleSentences: entity.exampleSentences,
    topic: toTopicRef(entity.topic),
    level: entity.level,
    audioUrl: entity.audioUrl,
  };
}
