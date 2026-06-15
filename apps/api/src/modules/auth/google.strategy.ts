import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, type VerifyCallback } from 'passport-google-oauth20';

import { AppConfig } from 'src/config/configuration';

/** Normalized Google identity attached to the request after the OAuth callback. */
export interface GoogleProfile {
  googleId: string;
  email: string;
  /** Google's assertion that it verified ownership of `email`. */
  emailVerified: boolean;
  displayName: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService<AppConfig, true>) {
    const google = config.get('google', { infer: true });
    super({
      // Fallbacks keep the app bootable when Google isn't configured in dev;
      // the OAuth call only succeeds with real credentials.
      clientID: google.clientId || 'unconfigured',
      clientSecret: google.clientSecret || 'unconfigured',
      callbackURL: google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): void {
    const json = profile._json as { email_verified?: boolean } | undefined;
    const user: GoogleProfile = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      emailVerified: json?.email_verified === true || profile.emails?.[0]?.verified === true,
      displayName: profile.displayName || null,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
    done(null, user);
  }
}
