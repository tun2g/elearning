import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

export type XpSourceType = 'sentence_attempt' | 'lesson_complete' | 'streak_day' | 'vocab_review' | 'daily_challenge';

@Entity({ name: 'xp_events' })
@Index(['user', 'createdAt'])
export class XpEventEntity extends AuditableEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: UserEntity;

  @Column({ type: 'smallint' })
  amount!: number;

  @Column({ name: 'source_type', type: 'varchar', length: 40 })
  sourceType!: XpSourceType;

  @Column({ name: 'source_id', type: 'uuid', nullable: true })
  sourceId!: string | null;
}
