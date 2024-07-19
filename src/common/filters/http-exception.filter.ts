import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly prisma: PrismaService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    let message: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      exceptionResponse.message &&
      typeof exceptionResponse.message === 'string'
    ) {
      message = exceptionResponse.message;
    } else if (
      exceptionResponse.message &&
      typeof exceptionResponse.message === 'object'
    ) {
      message = JSON.stringify(exceptionResponse.message);
    } else {
      message = exception.message || 'Unknown error';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'HttpExceptionFilter',
    );

    await this.prisma.log.create({
      data: {
        level: 'EXCEPTION',
        method: request.method,
        url: request.url,
        status,
        message: errorResponse.message,
        timestamp: new Date(),
      },
    });

    response.status(status).json(errorResponse);
  }
}
