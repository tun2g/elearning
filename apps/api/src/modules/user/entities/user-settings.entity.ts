import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AuditableEntity } from 'src/shared/entities/auditable.entity';

import { UserEntity } from './user.entity';

@Entity({ name: 'user_settings' })
export class UserSettingsEntity extends AuditableEntity {
  @OneToOne(() => UserEntity, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'daily_goal_sentences', type: 'smallint', default: 10 })
  dailyGoalSentences!: number;

  @Column({ name: 'push_token', type: 'varchar', length: 255, nullable: true })
  pushToken!: string | null;

  @Column({ name: 'notification_enabled', type: 'boolean', default: true })
  notificationEnabled!: boolean;

  /** Local hour (0–23) the daily reminder fires, in the user's timezone. */
  @Column({ name: 'reminder_hour', type: 'smallint', default: 19 })
  reminderHour!: number;

  @Column({ type: 'varchar', length: 60, default: 'Asia/Ho_Chi_Minh' })
  timezone!: string;
}
