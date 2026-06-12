import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { LessonEntity } from 'src/modules/content/entities/lesson.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

@Entity({ name: 'user_lesson_progress' })
@Index(['user', 'lesson'], { unique: true })
export class UserLessonProgressEntity extends AuditableEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: UserEntity;

  @ManyToOne(() => LessonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: LessonEntity;

  @Column({ type: 'varchar', length: 20, default: 'in_progress' })
  status!: LessonStatus;

  @Column({ name: 'completion_pct', type: 'smallint', default: 0 })
  completionPct!: number;

  @Column({ name: 'last_practiced_at', type: 'timestamptz', nullable: true })
  lastPracticedAt!: Date | null;

  @Column({ name: 'xp_earned', type: 'int', default: 0 })
  xpEarned!: number;
}
