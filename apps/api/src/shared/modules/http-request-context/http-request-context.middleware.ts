import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { HeaderKey } from 'src/shared/constants/http-request';

import { HttpRequestContextService } from './http-request-context.service';

@Injectable()
export class HttpRequestContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: HttpRequestContextService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    this.contextService.runWithContext(() => {
      const requestId = (req.headers[HeaderKey.X_REQUEST_ID] as string) ?? uuidv4();
      this.contextService.setRequestId(requestId);
      next();
    });
  }
}
