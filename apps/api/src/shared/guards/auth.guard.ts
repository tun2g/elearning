import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';
import { HttpRequestContextService } from 'src/shared/modules/http-request-context/http-request-context.service';

/**
 * Authorizes requests based on the user that AuthMiddleware resolved into the
 * request context (the session). `@Public()` routes bypass the check.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly httpContext: HttpRequestContextService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (!this.httpContext.getUser()) {
      throw new UnauthorizedException('Missing or invalid access token');
    }
    return true;
  }
}
