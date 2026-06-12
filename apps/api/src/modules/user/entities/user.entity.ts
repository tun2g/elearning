import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { StorageObjectEntity } from 'src/modules/media/entities/storage-object.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

import { UserSettingsEntity } from './user-settings.entity';

@Entity({ name: 'users' })
export class UserEntity extends AuditableEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 120 })
  displayName!: string;

  /** Denormalized avatar URL (managed object's URL, or an external image URL). */
  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl!: string | null;

  /** Management link to the uploaded avatar (set only for files we host). */
  @ManyToOne(() => StorageObjectEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'avatar_object_id' })
  avatarObject!: StorageObjectEntity | null;

  @Column({ name: 'xp_total', type: 'int', default: 0 })
  xpTotal!: number;

  @Column({ name: 'level_rank', type: 'varchar', length: 40, default: 'Beginner' })
  levelRank!: string;

  @OneToOne(() => UserSettingsEntity, (settings) => settings.user, {
    cascade: true,
    eager: false,
  })
  settings!: UserSettingsEntity;
}
