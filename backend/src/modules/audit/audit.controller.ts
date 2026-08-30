import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller(['admin', 'audit', 'super-admin'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /admin/audit-logs
   * Returns audit log entries, optionally filtered by entityType / entityId.
   */
  @Get('audit-logs')
  @Roles(
    'SUPER_ADMIN',
    'SUPERADMIN',
    'ADMIN',
    'FINANCE',
    'FINANCE_MANAGER',
    'FINANCE_EXECUTIVE',
    'STORE_MANAGER',
    'STORE_EXECUTIVE',
    'PLANT_HEAD',
  )
  @RequirePermissions('procurement.audit.read')
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
