import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { PrismaService } from '../../database/prisma.service';

@Controller('workflow')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly prisma: PrismaService,
  ) {}

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
