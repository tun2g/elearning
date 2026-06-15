import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { StorageObjectEntity } from 'src/modules/media/entities/storage-object.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

import { UserSettingsEntity } from './user-settings.entity';

@Entity({ name: 'users' })
export class UserEntity extends AuditableEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  /** Argon2 hash. Null for accounts created via Google or passwordless magic-link. */
  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash!: string | null;

  /** When the email was confirmed. Null until verified — gates password login. */
  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt!: Date | null;

  /** Google account subject (`sub`) when linked via Google Sign-In. */
  @Index({ unique: true, where: '"google_id" IS NOT NULL' })
  @Column({ name: 'google_id', type: 'varchar', length: 255, nullable: true })
  googleId!: string | null;

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
