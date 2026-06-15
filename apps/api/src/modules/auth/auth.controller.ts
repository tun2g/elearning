import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

/** Tight limits for credential + email-sending endpoints (per IP / minute). */
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };
const EMAIL_SEND_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

import { AppConfig } from 'src/config/configuration';
import { toUserResponse } from 'src/modules/user/dtos/user.mapper';
import { UserService } from 'src/modules/user/user.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/interfaces/request-user.interface';

import { AuthService } from './auth.service';
import {
  AuthTokensResponseDto,
  LoginDto,
  MagicLinkRequestDto,
  MagicLinkVerifyDto,
  MessageResultDto,
  RefreshDto,
  RegisterDto,
  RegisterResultDto,
  ResendVerificationDto,
  VerifyEmailDto,
} from './dtos/auth.dto';
import { GoogleAuthGuard } from './google-auth.guard';
import type { GoogleProfile } from './google.strategy';
import type { SessionContext } from './interfaces/session-context.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService<AppConfig, true>
  ) {}

  @Post('register')
  @Public()
  @Throttle(EMAIL_SEND_THROTTLE)
  @ApiOperation({ summary: 'Register with password — sends a verification email' })
  register(@Body() dto: RegisterDto): Promise<RegisterResultDto> {
    return this.authService.register(dto.email, dto.password, dto.displayName);
  }

  @Post('verify-email')
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify an email via magic-link token (auto-logs in)' })
  verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string
  ): Promise<AuthTokensResponseDto> {
    return this.authService.verifyEmail(dto.token, ctx(ip, userAgent));
  }

  @Post('resend-verification')
  @Public()
  @Throttle(EMAIL_SEND_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend the verification email' })
  async resendVerification(@Body() dto: ResendVerificationDto): Promise<MessageResultDto> {
    await this.authService.resendVerification(dto.email);
    return { status: 'sent' };
  }

  @Post('magic-link')
  @Public()
  @Throttle(EMAIL_SEND_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a passwordless sign-in link' })
  async magicLink(@Body() dto: MagicLinkRequestDto): Promise<MessageResultDto> {
    await this.authService.requestMagicLink(dto.email);
    return { status: 'sent' };
  }

  @Post('magic-link/verify')
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consume a passwordless link and start a session' })
  verifyMagicLink(
    @Body() dto: MagicLinkVerifyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string
  ): Promise<AuthTokensResponseDto> {
    return this.authService.verifyMagicLink(dto.token, ctx(ip, userAgent));
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Start Google OAuth (redirects to Google). ?platform=web|mobile' })
  googleAuth(): void {
    // GoogleAuthGuard issues the redirect to Google's consent screen.
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback — issues a session, redirects to the app' })
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string
  ): Promise<void> {
    const profile = req.user as GoogleProfile;
    const tokens = await this.authService.loginWithGoogleProfile(profile, ctx(ip, userAgent));

    const { webUrl, deepLinkScheme } = this.configService.get('app', { infer: true });
    // `state` is attacker-controllable — only ever switch between two fixed,
    // first-party bases; never interpolate it into a URL.
    const isMobile = req.query.state === 'mobile';
    const base = isMobile ? `${deepLinkScheme}://auth/callback` : `${webUrl}/auth/callback`;
    const fragment = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: String(tokens.expiresIn),
    }).toString();
    // Tokens go in the URL fragment (not sent to servers / access logs).
    res.redirect(`${base}#${fragment}`);
  }

  @Post('login')
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and start a session' })
  login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string
  ): Promise<AuthTokensResponseDto> {
    return this.authService.login(dto.email, dto.password, ctx(ip, userAgent));
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token within the session' })
  refresh(
    @Body() dto: RefreshDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string
  ): Promise<AuthTokensResponseDto> {
    return this.authService.refresh(dto.refreshToken, ctx(ip, userAgent));
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current session' })
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke every session for the current user' })
  async logoutAll(@CurrentUser() user: RequestUser): Promise<void> {
    await this.authService.logoutAll(user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user' })
  async me(@CurrentUser() currentUser: RequestUser) {
    return toUserResponse(await this.userService.findByIdOrThrow(currentUser.id));
  }
}

function ctx(ip: string, userAgent?: string): SessionContext {
  return { ipAddress: ip ?? null, userAgent: userAgent ?? null };
}
