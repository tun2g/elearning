import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

import { AppConfig } from 'src/config/configuration';
import { HeaderKey } from 'src/shared/constants/http-request';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers[HeaderKey.X_API_KEY] as string | undefined;
    const internalKey = this.configService.get('internalApiKey', { infer: true });

    if (!apiKey) throw new UnauthorizedException('Missing API key');

    const a = Buffer.from(apiKey);
    const b = Buffer.from(internalKey);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
