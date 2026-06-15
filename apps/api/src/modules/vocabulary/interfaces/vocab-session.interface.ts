import { VocabularyEntity } from '../entities/vocabulary.entity';

export type VocabCardStatus = 'new' | 'review';

/** A vocabulary word served in a study session, tagged as new or due-for-review. */
export interface VocabSessionCard extends VocabularyEntity {
  status: VocabCardStatus;
}
