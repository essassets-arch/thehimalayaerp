import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ProductionDailyReportService } from './production-daily-report.service';
import {
  CreateDailyReportDto,
  UpdateDailyReportDto,
  QueryDailyReportDto,
} from './dto/production-daily-report.dto';

@Controller('production/daily-reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductionDailyReportController {
  constructor(
    private readonly dailyReportService: ProductionDailyReportService,
  ) {}

  @RequirePermissions('production.floor.read', 'production.plan.read', 'production.qc.read')
  @Get()
  async listReports(@Req() req: any, @Query() query: QueryDailyReportDto) {
    const companyId = req.user?.companyId || 'COMP-000001';
    return this.dailyReportService.listReports(companyId, query);
  }

  @RequirePermissions('production.floor.read', 'production.plan.read')
  @Get('check-duplicate')
  async checkDuplicate(
    @Req() req: any,
    @Query('date') date: string,
    @Query('shift') shift: string,
  ) {
    if (!date) {
      throw new BadRequestException('Date query parameter is required');
    }
    const companyId = req.user?.companyId || 'COMP-000001';
    return this.dailyReportService.checkDuplicate(
      companyId,
      date,
      shift || 'Morning',
    );
  }

  @RequirePermissions('production.floor.read', 'production.plan.read')
  @Get(':id')
  async getReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    return this.dailyReportService.getReport(companyId, id);
  }

  @RequirePermissions('production.floor.create', 'production.plan.create')
  @Post()
  async createReport(@Req() req: any, @Body() dto: CreateDailyReportDto) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.dailyReportService.createReport(companyId, userId, dto);
  }

  @RequirePermissions('production.floor.update', 'production.plan.update')
  @Patch(':id')
  async updateReport(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDailyReportDto,
  ) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.dailyReportService.updateReport(companyId, userId, id, dto);
  }

  @RequirePermissions('production.floor.delete', 'production.plan.delete')
  @Delete(':id')
  async deleteReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.dailyReportService.deleteReport(companyId, userId, id);
  }

  @RequirePermissions('production.floor.create', 'production.plan.create')
  @Post(':id/submit')
  async submitReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.dailyReportService.submitReport(companyId, userId, id);
  }

  @RequirePermissions('production.plan.approve', 'admin.planthead.create')
  @Post(':id/approve')
  async approveReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.dailyReportService.approveReport(companyId, userId, id);
  }

  @RequirePermissions('production.plan.approve', 'admin.planthead.create')
  @Post(':id/reopen')
  async reopenReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.dailyReportService.reopenReport(companyId, userId, id);
  }

  @RequirePermissions('production.plan.approve', 'admin.planthead.create')
  @Post(':id/cancel')
  async cancelReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.dailyReportService.cancelReport(companyId, userId, id);
  }
}
