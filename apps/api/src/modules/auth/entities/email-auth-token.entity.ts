import { Column, Entity, Index } from 'typeorm';

import { AuditableEntity } from 'src/shared/entities/auditable.entity';

export type EmailAuthPurpose = 'verify_email' | 'login';

/**
 * Single-use, hashed token backing email verification and passwordless login.
 * Only the SHA-256 hash of the token is stored; the raw token lives only in the
 * emailed link. Consumed by setting `usedAt`.
 */
@Entity({ name: 'email_auth_tokens' })
export class EmailAuthTokenEntity extends AuditableEntity {
  @Column({ name: 'purpose', type: 'varchar', length: 20 })
  purpose!: EmailAuthPurpose;

  @Index({ unique: true })
  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash!: string;

  /** Lowercased email the token was issued for. */
  @Index()
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  /** The user the token targets, when known at issue time (null for new-email login). */
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Index()
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null;

  isValid(): boolean {
    return this.usedAt === null && this.expiresAt.getTime() > Date.now();
  }
}
