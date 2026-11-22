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
    // Prefer Nginx-enforced X-Real-IP (cannot be spoofed from public clients) over client-supplied X-Forwarded-For
    const realIp = req.headers?.['x-real-ip'];
    if (realIp) {
      const cleanRealIp = (Array.isArray(realIp) ? realIp[0] : String(realIp))
        .trim()
        .replace(/^::ffff:/i, '');
      if (cleanRealIp) {
        return Promise.resolve(`ip_${cleanRealIp}`);
      }
    }
    const ip = String(req.ip || req.socket?.remoteAddress || 'unknown')
      .trim()
      .replace(/^::ffff:/i, '');
    return Promise.resolve(`ip_${ip}`);
  }
}
