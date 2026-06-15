import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

/** Triggers the Google OAuth redirect and carries the caller platform via `state`. */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): Record<string, unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const platform = typeof req.query.platform === 'string' ? req.query.platform : 'web';
    return { state: platform, prompt: 'select_account', session: false };
  }
}
