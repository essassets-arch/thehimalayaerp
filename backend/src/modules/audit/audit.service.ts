import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface AuditLogOptions {
  actorUserId?: string;
  companyId?: string;
  branchId?: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const REDACTED_FIELDS = [
  'password',
  'accessToken',
  'refreshToken',
  'tokenHash',
  'aadhaar',
  'bankAccount',
  'secret',
];

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  private redactSensitiveData(data: any): any {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    const result = Array.isArray(data) ? [...data] : { ...data };

    for (const key in result) {
      if (
        REDACTED_FIELDS.includes(key) ||
        REDACTED_FIELDS.some((f) => key.toLowerCase().includes(f.toLowerCase()))
      ) {
        result[key] = '[REDACTED]';
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.redactSensitiveData(result[key]);
      }
    }

    return result;
  }

  async log(options: AuditLogOptions) {
    const before = this.redactSensitiveData(options.before);
    const after = this.redactSensitiveData(options.after);

    await this.prisma.auditLog.create({
      data: {
        actorUserId: options.actorUserId,
        companyId: options.companyId,
        branchId: options.branchId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        before,
        after,
        requestId: options.requestId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      },
    });
  }
}
