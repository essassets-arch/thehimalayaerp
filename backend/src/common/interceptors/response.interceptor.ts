import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  isCustomerBlindRole,
  redactCustomerIdentity,
} from '../security/customer-privacy.util';

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  meta: {
    requestId: string;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const requestId = request?.['requestId'] || 'unknown';
    const shouldMaskCustomer = isCustomerBlindRole(request?.user?.role);
    const routePath = request?.originalUrl || request?.url || '';

    return next.handle().pipe(
      map((data) => {
        const safePayload =
          shouldMaskCustomer && data !== undefined && data !== null
            ? redactCustomerIdentity(data, { routePath })
            : data;
        return {
          success: true,
          data: safePayload || ({} as T),
          meta: {
            requestId,
          },
        };
      }),
    );
  }
}
