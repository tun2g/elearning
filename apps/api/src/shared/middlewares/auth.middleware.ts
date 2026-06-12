import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { AuthService } from 'src/modules/auth/auth.service';
import { HttpRequestContextService } from 'src/shared/modules/http-request-context/http-request-context.service';

/**
 * Resolves the authenticated user from the Bearer access token and stores it in
 * the request context — the per-request session. Verifies the JWT AND confirms
 * the backing session row is still active (so logout revokes access instantly).
 * Authentication only — it never rejects; the guard authorizes.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly httpContext: HttpRequestContextService
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const token = this.extractBearerToken(req);
    if (token) {
      const user = await this.authService.authenticateAccessToken(token);
      if (user) this.httpContext.setUser(user);
    }
    next();
  }

  private extractBearerToken(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
