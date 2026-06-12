import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { SentenceEntity } from 'src/modules/content/entities/sentence.entity';
import { StorageObjectEntity } from 'src/modules/media/entities/storage-object.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

export type SelfAssessment = 'again' | 'hard' | 'easy';
export type PracticeMode = 'listen' | 'shadow' | 'voice';

@Entity({ name: 'attempts' })
@Index(['user', 'srsDueAt'])
export class AttemptEntity extends AuditableEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: UserEntity;

  @ManyToOne(() => SentenceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sentence_id' })
  @Index()
  sentence!: SentenceEntity;

  @Column({ type: 'varchar', length: 20 })
  mode!: PracticeMode;

  @Column({ name: 'self_assessment', type: 'varchar', length: 10 })
  selfAssessment!: SelfAssessment;

  @Column({ name: 'srs_interval', type: 'int', default: 1 })
  srsInterval!: number;

  @Column({ name: 'srs_ease', type: 'float', default: 2.5 })
  srsEase!: number;

  @Column({ name: 'srs_due_at', type: 'date' })
  @Index()
  srsDueAt!: Date;

  /** Denormalized URL of the user's recording (managed object's URL). */
  @Column({ name: 'recording_url', type: 'text', nullable: true })
  recordingUrl!: string | null;

  /** Management link to the stored recording (private; served via presigned URL). */
  @ManyToOne(() => StorageObjectEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recording_object_id' })
  recordingObject!: StorageObjectEntity | null;

  @Column({ name: 'ai_score', type: 'jsonb', nullable: true })
  aiScore!: Record<string, number> | null;

  @Column({ name: 'attempted_at', type: 'timestamptz' })
  attemptedAt!: Date;
}
