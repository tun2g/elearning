import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { AppConfig } from 'src/config/configuration';
import { UserService } from 'src/modules/user/user.service';
import { MailService } from 'src/shared/modules/mail/mail.service';
import { buildMagicLinkEmail, buildVerifyEmail } from 'src/shared/modules/mail/mail.templates';

import { LOGIN_TTL_MINUTES, LOGIN_TTL_MS, VERIFY_TTL_HOURS, VERIFY_TTL_MS } from './constants/auth.constants';
import { AuthTokensResponseDto, RegisterResultDto } from './dtos/auth.dto';
import { EmailAuthTokenService } from './email-auth-token.service';
import { SessionEntity } from './entities/session.entity';
import type { GoogleProfile } from './google.strategy';
import { deriveName, parseDurationMs } from './auth.util';
import type { AccessClaims, SessionContext } from './interfaces/session-context.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly mailService: MailService,
    private readonly emailTokenService: EmailAuthTokenService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>
  ) {}

  /** Creates an unverified account and emails a verification link. No session yet. */
  async register(email: string, password: string, displayName: string): Promise<RegisterResultDto> {
    const existing = await this.userService.findByEmail(email);
    if (existing?.emailVerifiedAt) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(password);
    let user = existing;
    if (user) {
      // Re-registering an unverified account: refresh credentials, resend link.
      user.passwordHash = passwordHash;
      user.displayName = displayName;
      await this.userService.update(user);
    } else {
      user = await this.userService.create({ email, passwordHash, displayName, emailVerifiedAt: null });
    }

    await this.sendVerificationEmail(user.email, user.displayName, user.id);
    return { status: 'verification_sent' };
  }

  /** Marks the email verified and auto-logs the user in. */
  async verifyEmail(rawToken: string, ctx: SessionContext = {}): Promise<AuthTokensResponseDto> {
    const token = await this.emailTokenService.consume(rawToken, 'verify_email');
    const user = token.userId
      ? await this.userService.findById(token.userId)
      : await this.userService.findByEmail(token.email);
    if (!user) throw new UnauthorizedException('Account not found');

    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = new Date();
      await this.userService.update(user);
    }
    return this.createSession(user.id, user.email, ctx);
  }

  /** Re-sends a verification link. Always succeeds outwardly (no enumeration). */
  async resendVerification(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (user && !user.emailVerifiedAt) {
      await this.sendVerificationEmail(user.email, user.displayName, user.id);
    }
  }

  async login(email: string, password: string, ctx: SessionContext = {}): Promise<AuthTokensResponseDto> {
    const user = await this.userService.findByEmail(email);
    // No password set → account is Google/passwordless-only; never log in by password.
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // Check verification only AFTER proving credentials (avoids leaking account state).
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException({ code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email first.' });
    }

    return this.createSession(user.id, user.email, ctx);
  }

  /** Sends a passwordless sign-in link. Always succeeds outwardly (no enumeration). */
  async requestMagicLink(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    const raw = await this.emailTokenService.issue({
      email,
      purpose: 'login',
      ttlMs: LOGIN_TTL_MS,
      userId: user?.id ?? null,
    });
    if (!raw) return; // throttled — prior link still valid
    const url = this.magicLinkUrl(raw, 'login');
    await this.mailService.send(
      buildMagicLinkEmail({ to: email, displayName: user?.displayName, url, expiresMinutes: LOGIN_TTL_MINUTES })
    );
  }

  /** Consumes a passwordless link → session. Auto-creates a verified account if new. */
  async verifyMagicLink(rawToken: string, ctx: SessionContext = {}): Promise<AuthTokensResponseDto> {
    const token = await this.emailTokenService.consume(rawToken, 'login');
    let user = token.userId
      ? await this.userService.findById(token.userId)
      : await this.userService.findByEmail(token.email);

    if (!user) {
      user = await this.userService.create({
        email: token.email,
        passwordHash: null,
        displayName: deriveName(token.email),
        emailVerifiedAt: new Date(),
      });
    } else if (!user.emailVerifiedAt) {
      // Clicking an emailed link proves ownership → verify.
      user.emailVerifiedAt = new Date();
      await this.userService.update(user);
    }
    return this.createSession(user.id, user.email, ctx);
  }

  /** Upserts/links the user from a verified Google profile and starts a session. */
  async loginWithGoogleProfile(profile: GoogleProfile, ctx: SessionContext = {}): Promise<AuthTokensResponseDto> {
    const email = profile.email?.toLowerCase();
    if (!email) throw new UnauthorizedException('Google account has no email');
    // Only trust the email (for linking/auto-verify) if Google says it verified it.
    if (!profile.emailVerified) throw new UnauthorizedException('Your Google email is not verified');

    let user = await this.userService.findByGoogleId(profile.googleId);
    if (!user) {
      user = await this.userService.findByEmail(email);
      if (user) {
        user.googleId = profile.googleId;
        if (!user.emailVerifiedAt) user.emailVerifiedAt = new Date();
        if (!user.avatarUrl && profile.avatarUrl) user.avatarUrl = profile.avatarUrl;
        await this.userService.update(user);
      } else {
        user = await this.userService.create({
          email,
          passwordHash: null,
          displayName: profile.displayName ?? deriveName(email),
          emailVerifiedAt: new Date(),
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl,
        });
      }
    }
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

  private async sendVerificationEmail(email: string, displayName: string | null, userId: string): Promise<void> {
    const raw = await this.emailTokenService.issue({
      email,
      purpose: 'verify_email',
      ttlMs: VERIFY_TTL_MS,
      userId,
    });
    if (!raw) return; // throttled — prior link still valid
    const url = this.magicLinkUrl(raw, 'verify_email');
    await this.mailService.send(buildVerifyEmail({ to: email, displayName, url, expiresHours: VERIFY_TTL_HOURS }));
  }

  /** Builds the frontend verify URL the email links to (frontend → POST verify). */
  private magicLinkUrl(rawToken: string, purpose: 'verify_email' | 'login'): string {
    const { webUrl } = this.configService.get('app', { infer: true });
    const params = new URLSearchParams({ token: rawToken, purpose });
    return `${webUrl}/auth/verify?${params.toString()}`;
  }

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
    return new Date(Date.now() + parseDurationMs(refreshExpiresIn));
  }

  private accessTtlSeconds(): number {
    const { expiresIn } = this.configService.get('jwt', { infer: true });
    return parseDurationMs(expiresIn) / 1000;
  }
}
