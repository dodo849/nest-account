import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      reason: this.#extractErrorReason(exception),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  #extractErrorReason(exception: unknown): string | null {
    if (!(exception instanceof HttpException)) {
      return null;
    }

    const response = exception.getResponse();

    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const message = (response as { message: string[] }).message;
      return Array.isArray(message) ? message.join(', ') : null;
    }

    return typeof response === 'string' ? response : exception.message;
  }
}
