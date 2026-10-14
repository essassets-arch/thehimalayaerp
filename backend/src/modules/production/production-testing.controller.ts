import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import {
  ProductionTestingService,
  CreateTestingRecord,
} from './production-testing.service';

@Controller('production/testing')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductionTestingController {
  constructor(private readonly testingService: ProductionTestingService) {}

  @RequirePermissions(
    'production.productiontesting.read',
    'production.testing.read',
    'production.floor.read',
    'production.qc.read',
    'production.productionworkflow.read',
    'plant-head.testing.read',
    'planthead.read',
    'plant-head.read',
    'planthead.testing.read',
  )
  @Get()
  async listTestingRecords(@Req() req: any) {
    const data = await this.testingService.listTestingRecords(
      req.user.companyId,
    );
    return { success: true, data };
  }

  // ── Testing Reports Endpoints (Declared before :id to prevent route clash) ──

  @RequirePermissions(
    'production.productiontesting.read',
    'production.testing.read',
    'plant-head.testing.read',
    'planthead.read',
    'plant-head.read',
    'planthead.testing.read',
  )
  @Get('reports/template/defaults')
  getDefaultReportTemplate() {
    const data = this.testingService.getDefaultTemplate();
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.read',
    'production.testing.read',
    'plant-head.testing.read',
    'planthead.read',
    'plant-head.read',
    'planthead.testing.read',
  )
  @Get('reports')
  async listReports(@Req() req: any) {
    const data = await this.testingService.listReports(
      req.user.companyId,
      req.query,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.read',
    'production.testing.read',
    'plant-head.testing.read',
    'planthead.read',
    'plant-head.read',
    'planthead.testing.read',
  )
  @Get('reports/:reportId')
  async getReport(@Param('reportId') reportId: string, @Req() req: any) {
    const data = await this.testingService.getReport(
      reportId,
      req.user.companyId,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.create',
    'production.testing.create',
    'production.floor.create',
    'production.qc.approve',
  )
  @Post('reports')
  async createReport(@Body() dto: any, @Req() req: any) {
    const data = await this.testingService.createReport(
      dto,
      req.user.sub,
      req.user.companyId,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.update',
    'production.testing.update',
    'production.floor.create',
    'plant-head.testing.read',
    'planthead.read',
  )
  @Put('reports/:reportId')
  async updateReport(
    @Param('reportId') reportId: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const data = await this.testingService.updateReport(
      reportId,
      dto,
      req.user.sub,
      req.user.companyId,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.update',
    'production.testing.update',
    'production.qc.approve',
    'plant-head.testing.read',
    'planthead.read',
  )
  @Patch('reports/:reportId/status')
  async updateReportStatus(
    @Param('reportId') reportId: string,
    @Body() dto: { status: 'Approved' | 'Rejected'; rejectionReason?: string; remarks?: string },
    @Req() req: any,
  ) {
    const data = await this.testingService.updateReportStatus(
      reportId,
      dto,
      req.user.sub,
      req.user.companyId,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.update',
    'production.testing.update',
    'plant-head.testing.read',
    'planthead.read',
  )
  @Post('reports/:reportId/revise')
  async createRevision(
    @Param('reportId') reportId: string,
    @Req() req: any,
  ) {
    const data = await this.testingService.createRevision(
      reportId,
      req.user.sub,
      req.user.companyId,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.delete',
    'production.testing.delete',
  )
  @Delete('reports/:reportId')
  async deleteReport(
    @Param('reportId') reportId: string,
    @Req() req: any,
  ) {
    const data = await this.testingService.deleteReport(
      reportId,
      req.user.companyId,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.read',
    'production.testing.read',
    'production.floor.read',
    'production.qc.read',
    'production.productionworkflow.read',
    'plant-head.testing.read',
    'planthead.read',
    'plant-head.read',
    'planthead.testing.read',
  )
  @Get(':id')
  async getTestingRecord(@Param('id') id: string, @Req() req: any) {
    const data = await this.testingService.getTestingRecord(
      id,
      req.user.companyId,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.create',
    'production.testing.create',
    'production.floor.create',
    'production.qc.approve',
  )
  @Post()
  async createTestingRecord(
    @Body()
    dto: CreateTestingRecord,
    @Req() req: any,
  ) {
    const data = await this.testingService.createTestingRecord(
      dto,
      req.user.sub,
      req.user.companyId,
    );
    return { success: true, data: data.testingRecord, ...data };
  }

  @RequirePermissions(
    'production.productiontesting.update',
    'production.testing.update',
    'production.floor.create',
    'plant-head.testing.read',
    'planthead.read',
    'plant-head.read',
    'planthead.testing.read',
  )
  @Put(':id')
  async updateTestingRecord(
    @Param('id') id: string,
    @Body()
    dto: {
      productId?: string;
      productName?: string;
      quantity?: number;
      status?: string;
      remarks?: string;
    },
    @Req() req: any,
  ) {
    const data = await this.testingService.updateTestingRecord(
      id,
      dto,
      req.user.companyId,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.update',
    'production.testing.update',
    'production.floor.create',
    'plant-head.testing.read',
    'planthead.read',
    'plant-head.read',
    'planthead.testing.read',
  )
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: string; remarks?: string },
    @Req() req: any,
  ) {
    const data = await this.testingService.updateStatus(
      id,
      dto,
      req.user.companyId,
      req.user.sub,
    );
    return { success: true, data };
  }

  @RequirePermissions(
    'production.productiontesting.delete',
    'production.testing.delete',
    'production.floor.create',
  )
  @Delete(':id')
  async deleteTestingRecord(@Param('id') id: string, @Req() req: any) {
    const data = await this.testingService.deleteTestingRecord(
      id,
      req.user.companyId,
    );
    return { success: true, data };
  }
}
