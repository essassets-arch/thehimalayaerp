import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    sub?: string;
  };
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const url = req?.url || '';

    // Skip health checks and metric scrapes
    if (url.includes('/health') || url.includes('/metrics')) {
      return true;
    }

    return false;
  }

  protected override getTracker(req: any): Promise<string> {
    if (req.user?.sub) {
      return Promise.resolve(`user_${req.user.sub}`);
    }
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
      const ip = Array.isArray(forwarded)
        ? forwarded[0].trim()
        : String(forwarded).split(',')[0].trim();
      return Promise.resolve(`ip_${ip}`);
    }
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return Promise.resolve(`ip_${ip}`);
  }
}
