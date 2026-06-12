import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = isHttp ? exception.getResponse() : null;

    // Only surface developer-controlled messages (HttpExceptions). For any
    // unexpected/internal error, return a generic message — never leak raw
    // error details (provider names, stack traces, DB errors) to the client.
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? (payload as { message: unknown }).message
        : isHttp
          ? exception.message
          : 'Internal server error';

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    response.status(status).json({
      requestId: request.headers['x-request-id'] ?? undefined,
      statusCode: status,
      message,
    });
  }
}
