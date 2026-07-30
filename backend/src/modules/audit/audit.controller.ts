import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('admin')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /admin/audit-logs
   * Returns audit log entries, optionally filtered by entityType / entityId.
   * Requires procurement.audit.read permission (shared with STORE_MANAGER, SUPER_ADMIN etc.)
   */
  @Get('audit-logs')
  @Permissions('procurement.audit.read')
  async list(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const take = Math.min(200, Math.max(1, Number(limit)));
    const skip = (Math.max(1, Number(page)) - 1) * take;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          actorUserId: true,
          companyId: true,
          requestId: true,
          createdAt: true,
          before: true,
          after: true,
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, meta: { page: Number(page), limit: take, total } };
  }
}
