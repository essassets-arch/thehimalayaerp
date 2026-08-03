import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaErrorResponse } from '../types/security.types';

interface HttpExceptionResponseBody {
  code?: string;
  message?: string | string[];
  field?: string;
  [key: string]: unknown;
}

interface RequestWithMeta extends Request {
  requestId?: string;
  body: {
    expectedVersion?: number;
    [key: string]: unknown;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    console.error(
      'Unhandled exception caught by AllExceptionsFilter:',
      exception,
    );
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithMeta>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: unknown[] = [];
    let field: string | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const body = res as HttpExceptionResponseBody;
        const s = status;
        code =
          body.code ||
          (s === 401
            ? 'UNAUTHORIZED'
            : s === 403
              ? 'FORBIDDEN'
              : s === 409
                ? 'CONFLICT'
                : 'BAD_REQUEST');

        field = body.field;

        if (Array.isArray(body.message)) {
          message = 'Validation failed';
          details = body.message;
        } else if (typeof body.message === 'string') {
          message = body.message;
        } else {
          message = exception.message;
        }
      } else if (typeof res === 'string') {
        message = res;
      }
    } else if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception
    ) {
      const prismaError = exception as PrismaErrorResponse;
      if (prismaError.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        message = 'A record with this value already exists.';
      } else if (prismaError.code === 'P2025') {
        if (request.body && typeof request.body.expectedVersion === 'number') {
          status = HttpStatus.CONFLICT;
          code = 'CONCURRENCY_ERROR';
          message =
            'The record has been modified by another user. Please refresh and try again.';
        } else {
          status = HttpStatus.NOT_FOUND;
          code = 'RECORD_NOT_FOUND';
          message = 'The requested record was not found.';
        }
      } else if (prismaError.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        code = 'FOREIGN_KEY_CONSTRAINT_VIOLATION';
        message = `Invalid reference: ${prismaError.meta?.field_name || 'a related record was not found'}.`;
      } else if (prismaError.code === 'P2023' || prismaError.code === 'P2006') {
        status = HttpStatus.BAD_REQUEST;
        code = 'INVALID_FIELD_VALUE';
        message = prismaError.message || 'Invalid field value provided.';
      } else {
        message = (exception as any).message || 'Database error occurred.';
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'Internal server error';
    }

    const requestId = request.requestId || 'unknown';

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
        field,
      },
      meta: {
        requestId,
      },
    });
  }
}
