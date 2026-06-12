import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

@Entity({ name: 'user_streaks' })
export class UserStreakEntity extends AuditableEntity {
  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'current_streak', type: 'int', default: 0 })
  currentStreak!: number;

  @Column({ name: 'longest_streak', type: 'int', default: 0 })
  longestStreak!: number;

  /** UTC day index: Math.floor(Date.now() / 86400000) */
  @Column({ name: 'last_active_day', type: 'int', nullable: true })
  lastActiveDay!: number | null;

  @Column({ name: 'grace_used_today', type: 'boolean', default: false })
  graceUsedToday!: boolean;
}
