import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private recursivelyLogException(
    exception: HttpException,
    isInternalServerError: boolean,
  ): void {
    const { cause } = exception;

    if (isInternalServerError) this.logger.error(exception.stack);

    if (cause instanceof HttpException) {
      this.recursivelyLogException(cause, isInternalServerError);
    } else if (cause instanceof Error) {
      if (isInternalServerError) this.logger.error(cause.stack);
      else this.logger.warn(cause.stack);
    }
  }

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response | undefined>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const responseBody = exception.getResponse();
    const isInternalServerError = status >= 500;
    const { method, originalUrl } = request;
    const requestDetailsMessage = `${method} ${originalUrl} - ${status} status`;

    if (isInternalServerError) {
      this.logger.error(requestDetailsMessage);
    } else {
      this.logger.warn(requestDetailsMessage);
    }

    this.recursivelyLogException(exception, isInternalServerError);

    if (typeof responseBody === 'string')
      response?.status(status).send(responseBody);
    else
      response?.status(status).json({ ...responseBody, error: exception.name });
  }
}
