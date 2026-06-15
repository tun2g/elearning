import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { IsNull, Repository } from 'typeorm';

import { RESEND_THROTTLE_MS } from './constants/auth.constants';
import { EmailAuthPurpose, EmailAuthTokenEntity } from './entities/email-auth-token.entity';

@Injectable()
export class EmailAuthTokenService {
  constructor(
    @InjectRepository(EmailAuthTokenEntity)
    private readonly tokenRepo: Repository<EmailAuthTokenEntity>
  ) {}

  /**
   * Issues a single-use token for `email`+`purpose` and returns the RAW token
   * (only its hash is stored). Returns null when throttled — a still-valid token
   * was issued moments ago, so the prior emailed link should be reused.
   */
  async issue(input: {
    email: string;
    purpose: EmailAuthPurpose;
    ttlMs: number;
    userId?: string | null;
  }): Promise<string | null> {
    const email = input.email.toLowerCase();

    const recent = await this.tokenRepo.findOne({
      where: { email, purpose: input.purpose, usedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    if (recent && recent.isValid() && recent.createdAt.getTime() > Date.now() - RESEND_THROTTLE_MS) {
      return null;
    }

    // Invalidate any other outstanding tokens for this email+purpose.
    await this.tokenRepo.update({ email, purpose: input.purpose, usedAt: IsNull() }, { usedAt: new Date() });

    const rawToken = randomBytes(32).toString('base64url');
    const entity = this.tokenRepo.create({
      purpose: input.purpose,
      email,
      userId: input.userId ?? null,
      tokenHash: this.hash(rawToken),
      expiresAt: new Date(Date.now() + input.ttlMs),
      usedAt: null,
    });
    await this.tokenRepo.save(entity);
    return rawToken;
  }

  /**
   * Atomically claims + consumes a token. The conditional UPDATE guarantees only
   * one concurrent caller can mark a single-use token as used (no replay race).
   * Throws if missing, wrong purpose, expired, or already used.
   */
  async consume(rawToken: string, purpose: EmailAuthPurpose): Promise<EmailAuthTokenEntity> {
    const tokenHash = this.hash(rawToken);
    const result = await this.tokenRepo
      .createQueryBuilder()
      .update(EmailAuthTokenEntity)
      .set({ usedAt: () => 'now()' })
      .where('token_hash = :tokenHash', { tokenHash })
      .andWhere('purpose = :purpose', { purpose })
      .andWhere('used_at IS NULL')
      .andWhere('expires_at > now()')
      .execute();

    if (!result.affected) {
      throw new UnauthorizedException('This link is invalid or has expired.');
    }

    const token = await this.tokenRepo.findOne({ where: { tokenHash, purpose } });
    if (!token) throw new UnauthorizedException('This link is invalid or has expired.');
    return token;
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
