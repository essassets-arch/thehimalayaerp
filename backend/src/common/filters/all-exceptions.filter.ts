import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      code =
        res.code ||
        (status === 401
          ? 'UNAUTHORIZED'
          : status === 403
            ? 'FORBIDDEN'
            : status === 409
              ? 'CONFLICT'
              : 'BAD_REQUEST');
      message = res.message || exception.message;

      if (Array.isArray(res.message)) {
        message = 'Validation failed';
        details = res.message;
      }
    } else if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception
    ) {
      // Handle Prisma errors or other specific exceptions
      const prismaError = exception as any;
      if (prismaError.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        message = 'A record with this value already exists.';
      } else if (prismaError.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'RECORD_NOT_FOUND';
        message = 'The requested record was not found.';
      }
    }

    const requestId = request['requestId'] || 'unknown';

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        requestId,
      },
    });
  }
}
