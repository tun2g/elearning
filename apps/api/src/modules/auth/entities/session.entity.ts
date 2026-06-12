import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuditableEntity } from 'src/shared/entities/auditable.entity';

/**
 * A login session. The access JWT carries this session's id and is validated
 * against this row on every request — so deactivating the session (logout)
 * revokes the access token immediately, not just at expiry.
 */
@Entity({ name: 'sessions' })
@Index(['user'])
export class SessionEntity extends AuditableEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  /** sha256 of the current refresh token (rotated on every refresh). */
  @Index({ unique: true })
  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'last_used_at', type: 'timestamptz' })
  lastUsedAt!: Date;

  isValid(): boolean {
    return this.isActive && this.expiresAt.getTime() > Date.now();
  }
}
