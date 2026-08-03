import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { PrismaService } from '../../database/prisma.service';

@Controller('workflow')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly prisma: PrismaService,
  ) {}

  @RequirePermissions('admin.workflow.read')
  @Get('history/:entityType/:entityId')
  async getHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const history = await this.prisma.workflowHistory.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return history;
  }
}
