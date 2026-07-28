import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ConflictException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Only apply to POST/PUT/PATCH/DELETE
    if (request.method === 'GET') {
      return next.handle();
    }

    const idempotencyKey = request.headers['idempotency-key'];
    if (!idempotencyKey) {
      return next.handle();
    }

    const userId = request.user?.sub;
    if (!userId) {
      return next.handle();
    }

    const requestHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(request.body || {}))
      .digest('hex');

    const existingRecord = await this.prisma.idempotencyRecord.findUnique({
      where: {
        userId_key: {
          userId,
          key: idempotencyKey,
        },
      },
    });

    if (existingRecord) {
      if (existingRecord.requestHash !== requestHash) {
        throw new ConflictException(
          'Idempotency key used with different request body',
        );
      }

      response.status(existingRecord.responseStatus);
      return of(existingRecord.responseBody);
    }

    return next.handle().pipe(
      tap(async (data) => {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Keep for 24h

        try {
          await this.prisma.idempotencyRecord.create({
            data: {
              userId,
              route: request.url,
              key: idempotencyKey,
              requestHash,
              responseStatus: response.statusCode,
              responseBody: data || {},
              expiresAt,
            },
          });
        } catch (err) {
          // Ignore if it was inserted concurrently
        }
      }),
    );
  }
}
