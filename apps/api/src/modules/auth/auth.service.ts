import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { AppConfig } from 'src/config/configuration';
import { UserService } from 'src/modules/user/user.service';

import { AuthTokensResponseDto } from './dtos/auth.dto';
import { SessionEntity } from './entities/session.entity';
import type { AccessClaims, SessionContext } from './interfaces/session-context.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>
  ) {}

  async register(
    email: string,
    password: string,
    displayName: string,
    ctx: SessionContext = {}
  ): Promise<AuthTokensResponseDto> {
    const existing = await this.userService.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(password);
    const user = await this.userService.create({
      email,
      passwordHash,
      displayName,
    });
    return this.createSession(user.id, user.email, ctx);
  }

  async login(email: string, password: string, ctx: SessionContext = {}): Promise<AuthTokensResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.createSession(user.id, user.email, ctx);
  }

  /** Rotates the refresh token within the same session. */
  async refresh(rawRefreshToken: string, ctx: SessionContext = {}): Promise<AuthTokensResponseDto> {
    const claims = this.verifyToken(rawRefreshToken);
    if (!claims || claims.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionRepo.findOne({
      where: { tokenHash: this.hashToken(rawRefreshToken) },
      relations: { user: true },
    });
    if (!session || !session.isValid()) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    const tokens = this.signTokens(session.user.id, session.user.email, session.id);

    session.tokenHash = this.hashToken(tokens.refreshToken);
    session.lastUsedAt = new Date();
    session.expiresAt = this.refreshExpiry();
    if (ctx.ipAddress !== undefined) session.ipAddress = ctx.ipAddress;
    if (ctx.userAgent !== undefined) session.userAgent = ctx.userAgent;
    await this.sessionRepo.save(session);

    return { ...tokens, expiresIn: this.accessTtlSeconds() };
  }

  /**
   * Resolves the user from an access token for AuthMiddleware: verifies the JWT,
   * requires an `access` token, and confirms the session is still active. Returns
   * null (→ unauthenticated) on any failure, so a revoked session is rejected.
   */
  async authenticateAccessToken(token: string): Promise<{ id: string; email: string; sessionId: string } | null> {
    const claims = this.verifyToken(token);
    if (!claims || claims.type !== 'access') return null;

    const session = await this.validateSession(claims.sessionId);
    if (!session) return null;

    return { id: claims.sub, email: claims.email, sessionId: claims.sessionId };
  }

  /** Read-only session check used on every request. */
  async validateSession(sessionId: string): Promise<SessionEntity | null> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    return session && session.isValid() ? session : null;
  }

  /** Revoke one session (logout). */
  async logout(rawRefreshToken: string): Promise<void> {
    await this.sessionRepo.update({ tokenHash: this.hashToken(rawRefreshToken) }, { isActive: false });
  }

  /** Revoke every session for a user (logout everywhere). */
  async logoutAll(userId: string): Promise<void> {
    await this.sessionRepo.update({ user: { id: userId }, isActive: true }, { isActive: false });
  }

  // --- internals ---

  private async createSession(userId: string, email: string, ctx: SessionContext): Promise<AuthTokensResponseDto> {
    const sessionId = randomUUID();
    const tokens = this.signTokens(userId, email, sessionId);

    const session = this.sessionRepo.create({
      id: sessionId,
      user: { id: userId },
      tokenHash: this.hashToken(tokens.refreshToken),
      isActive: true,
      expiresAt: this.refreshExpiry(),
      lastUsedAt: new Date(),
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    await this.sessionRepo.save(session);

    return { ...tokens, expiresIn: this.accessTtlSeconds() };
  }

  private signTokens(userId: string, email: string, sessionId: string): { accessToken: string; refreshToken: string } {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    const accessToken = this.jwtService.sign(
      { sub: userId, email, sessionId, type: 'access' },
      { expiresIn: jwtConfig.expiresIn as JwtSignOptions['expiresIn'] }
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, email, sessionId, type: 'refresh' },
      { expiresIn: jwtConfig.refreshExpiresIn as JwtSignOptions['expiresIn'] }
    );
    return { accessToken, refreshToken };
  }

  private verifyToken(token: string): AccessClaims | null {
    try {
      return this.jwtService.verify<AccessClaims>(token);
    } catch {
      return null;
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private refreshExpiry(): Date {
    const { refreshExpiresIn } = this.configService.get('jwt', { infer: true });
    return new Date(Date.now() + this.parseDurationMs(refreshExpiresIn));
  }

  private accessTtlSeconds(): number {
    const { expiresIn } = this.configService.get('jwt', { infer: true });
    return this.parseDurationMs(expiresIn) / 1000;
  }

  private parseDurationMs(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return value * (multipliers[unit] ?? 60_000);
  }
}
