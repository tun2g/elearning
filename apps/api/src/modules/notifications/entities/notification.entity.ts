import type { NotificationType } from '@elearning/contracts';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

@Entity({ name: 'notifications' })
@Index(['user', 'createdAt'])
export class NotificationEntity extends AuditableEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: UserEntity;

  @Column({ type: 'varchar', length: 40 })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'jsonb', nullable: true })
  data!: Record<string, unknown> | null;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt!: Date | null;
}
