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

  @Get(['admin/reports', 'admin-all', '', 'reports'])
  @Roles('Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN')
  async getAllReportsForSuperAdmin(
    @Req() req: any,
    @Query() query: QueryBackOfficeReportDto,
  ) {
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.backOfficeService.getAllReportsForSuperAdmin(companyId, query);
  }

  @Post(['admin/reports/:id/acknowledge', ':id/acknowledge', 'reports/:id/acknowledge'])
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

  @Get(['admin/staff', 'staff-list', 'staff', 'staffs'])
  @Roles('Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN')
  async getBackOfficeStaffList(@Req() req: any) {
    const companyId =
      req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.backOfficeService.getBackOfficeStaffList(companyId);
  }

  /**
   * AR — APPL SHEET (Invoice-level register, 21 columns)
   */
  @Get('appl-ar')
  @Roles('Back Office', 'BACK_OFFICE', 'back-office', 'Finance Manager', 'FINANCE_MANAGER', 'Finance', 'FINANCE', 'Super Admin', 'SUPER_ADMIN')
  async getApplAr(@Query() query: any) {
    return this.backOfficeService.getApplArRegister(query);
  }

  @Post('appl-ar')
  @Roles('Back Office', 'BACK_OFFICE', 'back-office')
  async createApplAr(@Body() dto: any) {
    return this.backOfficeService.createApplArInvoice(dto);
  }

  @Put('appl-ar/:id')
  @Roles('Back Office', 'BACK_OFFICE', 'back-office')
  async updateApplAr(@Param('id') id: string, @Body() dto: any) {
    return this.backOfficeService.updateApplArInvoice(id, dto);
  }

  @Delete('appl-ar/:id')
  @Roles('Back Office', 'BACK_OFFICE', 'back-office')
  async deleteApplAr(@Param('id') id: string) {
    return this.backOfficeService.deleteApplArInvoice(id);
  }

  /**
   * AR — HCPPL SHEET (Summary sheet: Unpaid & RT matrices)
   */
  @Get('hcppl-ar')
  @Roles('Back Office', 'BACK_OFFICE', 'back-office', 'Finance Manager', 'FINANCE_MANAGER', 'Finance', 'FINANCE', 'Super Admin', 'SUPER_ADMIN')
  async getHcpplAr() {
    return this.backOfficeService.getHcpplArSummary();
  }

  @Get('hcppl-ar/entries')
  @Roles('Back Office', 'BACK_OFFICE', 'back-office', 'Finance Manager', 'FINANCE_MANAGER', 'Finance', 'FINANCE', 'Super Admin', 'SUPER_ADMIN')
  async getHcpplArEntries(@Query() query: any) {
    return this.backOfficeService.getHcpplArEntries(query);
  }

  @Post('hcppl-ar/entry')
  @Roles('Back Office', 'BACK_OFFICE', 'back-office')
  async createHcpplArEntry(@Body() dto: any) {
    return this.backOfficeService.createHcpplArInvoice(dto);
  }

  @Put('hcppl-ar/entry/:id')
  @Roles('Back Office', 'BACK_OFFICE', 'back-office')
  async updateHcpplArEntry(@Param('id') id: string, @Body() dto: any) {
    return this.backOfficeService.updateHcpplArInvoice(id, dto);
  }

  @Delete('hcppl-ar/entry/:id')
  @Roles('Back Office', 'BACK_OFFICE', 'back-office')
  async deleteHcpplArEntry(@Param('id') id: string) {
    return this.backOfficeService.deleteHcpplArInvoice(id);
  }

  /**
   * CONFIRMED DISPATCHES (Read-only consolidation for Dispatch 1 & Dispatch 2)
   */
  @Get('dispatches')
  @Roles(
    'Back Office',
    'BACK_OFFICE',
    'back-office',
    'Back Office / Admin',
    'Back Office Lead',
    'Data Analyst & Back Office Lead',
    'Super Admin',
    'SUPER_ADMIN',
    'Admin',
    'ADMIN',
  )
  async getConfirmedDispatches(@Query() query: any) {
    return this.backOfficeService.getConfirmedDispatches(query);
  }
}


