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
import { DispatchDailyReportService } from './dispatch-daily-report.service';
import {
  CreateDispatchDailyReportDto,
  UpdateDispatchDailyReportDto,
  QueryDispatchDailyReportDto,
} from './dto/dispatch-daily-report.dto';

@Controller('dispatch/daily-reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class Dispatch1DailyReportController {
  constructor(private readonly service: DispatchDailyReportService) {}

  @Get()
  async listReports(@Req() req: any, @Query() query: QueryDispatchDailyReportDto) {
    const companyId = req.user?.companyId || 'COMP-000001';
    return this.service.listReports(companyId, 'DISPATCH_1', query);
  }

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
    return this.service.checkDuplicate(companyId, date, shift || 'Morning', 'DISPATCH_1');
  }

  @Get(':id')
  async getReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    return this.service.getReport(companyId, id, 'DISPATCH_1');
  }

  @Post()
  async createReport(@Req() req: any, @Body() dto: CreateDispatchDailyReportDto) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.createReport(companyId, userId, dto, 'DISPATCH_1');
  }

  @Patch(':id')
  async updateReport(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDispatchDailyReportDto,
  ) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.updateReport(companyId, userId, id, dto, 'DISPATCH_1');
  }

  @Delete(':id')
  async deleteReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.deleteReport(companyId, userId, id, 'DISPATCH_1');
  }

  @Post(':id/submit')
  async submitReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.submitReport(companyId, userId, id, 'DISPATCH_1');
  }

  @Post(':id/cancel')
  async cancelReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.cancelReport(companyId, userId, id, 'DISPATCH_1');
  }
}

@Controller('dispatch-2/daily-reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class Dispatch2DailyReportController {
  constructor(private readonly service: DispatchDailyReportService) {}

  @Get()
  async listReports(@Req() req: any, @Query() query: QueryDispatchDailyReportDto) {
    const companyId = req.user?.companyId || 'COMP-000001';
    return this.service.listReports(companyId, 'DISPATCH_2', query);
  }

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
    return this.service.checkDuplicate(companyId, date, shift || 'Morning', 'DISPATCH_2');
  }

  @Get(':id')
  async getReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    return this.service.getReport(companyId, id, 'DISPATCH_2');
  }

  @Post()
  async createReport(@Req() req: any, @Body() dto: CreateDispatchDailyReportDto) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.createReport(companyId, userId, dto, 'DISPATCH_2');
  }

  @Patch(':id')
  async updateReport(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDispatchDailyReportDto,
  ) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.updateReport(companyId, userId, id, dto, 'DISPATCH_2');
  }

  @Delete(':id')
  async deleteReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.deleteReport(companyId, userId, id, 'DISPATCH_2');
  }

  @Post(':id/submit')
  async submitReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.submitReport(companyId, userId, id, 'DISPATCH_2');
  }

  @Post(':id/cancel')
  async cancelReport(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user?.companyId || 'COMP-000001';
    const userId = req.user?.sub || req.user?.id;
    return this.service.cancelReport(companyId, userId, id, 'DISPATCH_2');
  }
}
