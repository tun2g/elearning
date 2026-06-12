import { Global, Module } from '@nestjs/common';

import { HttpRequestContextMiddleware } from './http-request-context.middleware';
import { HttpRequestContextService } from './http-request-context.service';

@Global()
@Module({
  providers: [HttpRequestContextService, HttpRequestContextMiddleware],
  exports: [HttpRequestContextService, HttpRequestContextMiddleware],
})
export class HttpRequestContextModule {}
