import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BackOfficeService } from './back-office.service';
import {
  CreateBackOfficeReportDto,
  UpdateBackOfficeReportDto,
  AcknowledgeBackOfficeReportDto,
  QueryBackOfficeReportDto,
} from './dto/back-office-report.dto';

@Controller([
  'back-office',
  'backend/back-office',
  'super-admin/backoffice-reports',
  'backend/super-admin/backoffice-reports',
])
@UseGuards(JwtAuthGuard, RolesGuard)
export class BackOfficeController {
  constructor(private readonly backOfficeService: BackOfficeService) {}

  /**
   * BACK OFFICE USER ENDPOINTS
   */

  @Post('daily-reports')
  @Roles(
    'Back Office',
    'BACK_OFFICE',
    'Super Admin',
    'Admin',
    'SUPER_ADMIN',
    'ADMIN',
  )
  async createReport(@Req() req: any, @Body() dto: CreateBackOfficeReportDto) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.backOfficeService.createReport(companyId, userId, dto);
  }

  @Get('daily-reports/my')
  @Roles(
    'Back Office',
    'BACK_OFFICE',
    'Super Admin',
    'Admin',
    'SUPER_ADMIN',
    'ADMIN',
  )
  async getMyReports(
    @Req() req: any,
    @Query() query: QueryBackOfficeReportDto,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.backOfficeService.getMyReports(companyId, userId, query);
  }

  @Get('daily-reports/:id')
  async getReportById(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const role =
      req.user?.role?.name || req.user?.role?.code || req.user?.role || '';
    const isAdmin = ['Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN'].includes(
      role,
    );
    return this.backOfficeService.getReportById(companyId, id, userId, isAdmin);
  }

  @Put('daily-reports/:id')
  @Roles(
    'Back Office',
    'BACK_OFFICE',
    'Super Admin',
    'Admin',
    'SUPER_ADMIN',
    'ADMIN',
  )
  async updateReport(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBackOfficeReportDto,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.backOfficeService.updateReport(companyId, userId, id, dto);
  }

  @Delete('daily-reports/:id')
  @Roles(
    'Back Office',
    'BACK_OFFICE',
    'Super Admin',
    'Admin',
    'SUPER_ADMIN',
    'ADMIN',
  )
  async deleteReport(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id;
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.backOfficeService.deleteReport(companyId, userId, id);
  }

  /**
   * SUPER ADMIN & ADMIN ENDPOINTS
   */

  @Get(['admin/reports', 'admin-all', ''])
  @Roles('Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN')
  async getAllReportsForSuperAdmin(
    @Req() req: any,
    @Query() query: QueryBackOfficeReportDto,
  ) {
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.backOfficeService.getAllReportsForSuperAdmin(companyId, query);
  }

  @Post(['admin/reports/:id/acknowledge', ':id/acknowledge'])
  @Roles('Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN')
  async acknowledgeReport(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AcknowledgeBackOfficeReportDto,
  ) {
    const adminUserId = req.user?.sub || req.user?.id;
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.backOfficeService.acknowledgeReport(
      companyId,
      adminUserId,
      id,
      dto,
    );
  }

  @Get(['admin/staff', 'staff-list'])
  @Roles('Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN')
  async getBackOfficeStaffList(@Req() req: any) {
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.backOfficeService.getBackOfficeStaffList(companyId);
  }
}
