import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

import { VocabularyEntity } from './vocabulary.entity';

@Entity({ name: 'user_vocab_progress' })
@Index(['user', 'vocab'], { unique: true })
export class UserVocabProgressEntity extends AuditableEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: UserEntity;

  @ManyToOne(() => VocabularyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocab_id' })
  vocab!: VocabularyEntity;

  @Column({ name: 'srs_interval', type: 'int', default: 1 })
  srsInterval!: number;

  @Column({ name: 'srs_ease', type: 'float', default: 2.5 })
  srsEase!: number;

  @Column({ name: 'srs_due_at', type: 'date' })
  @Index()
  srsDueAt!: Date;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews!: number;

  @Column({ name: 'correct_reviews', type: 'int', default: 0 })
  correctReviews!: number;
}
