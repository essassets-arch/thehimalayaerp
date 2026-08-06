import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    sub?: string;
  };
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override async shouldSkip(context: any): Promise<boolean> {
    return true;
  }

  protected override getTracker(req: any): Promise<string> {
    if (req.user?.sub) {
      return Promise.resolve(req.user.sub);
    }
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
      const ip = Array.isArray(forwarded)
        ? forwarded[0].trim()
        : String(forwarded).split(',')[0].trim();
      return Promise.resolve(ip);
    }
    return Promise.resolve(req.ip || req.socket?.remoteAddress || 'unknown');
  }
}
