import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { ProductionWorkflowService } from './production-workflow.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { QcPassDto } from './dto/qc-pass.dto';

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductionWorkflowController {
  constructor(private readonly workflowService: ProductionWorkflowService) {}

  // ==========================================
  // DASHBOARD
  // ==========================================
  @Get('production/dashboard')
  @RequirePermissions('production.floor.read', 'production.qc.read')
  async getDashboard() {
    const data = await this.workflowService.getDashboardCounts();
    return { success: true, data };
  }

  @RequirePermissions('production.productionworkflow.read')
  @Get('production/reports/summary')
  async getReportsSummary() {
    const data = await this.workflowService.getGlobalSummaryReport();
    return { success: true, data };
  }

  // ==========================================
  // SHIFT & SCRAP ENTRIES
  // ==========================================
  @Post('production/shift-entries')
  @RequirePermissions('production.floor.create') // Adjust permissions as needed
  async createShiftEntry(@Body() dto: any, @Req() req: any) {
    const data = await this.workflowService.createShiftEntry(
      dto,
      req.user?.sub || 'system',
    );
    return { success: true, data };
  }

  @Post('production/scrap-entries')
  @RequirePermissions('production.floor.create')
  async createScrapEntry(@Body() dto: any, @Req() req: any) {
    const data = await this.workflowService.createScrapEntry(
      dto,
      req.user?.sub || 'system',
    );
    return { success: true, data };
  }

  // ==========================================
  // FINISHED GOODS
  // ==========================================
  @RequirePermissions('production.productionworkflow.read')
  @Get('production/finished-goods')
  async getFinishedGoods(@Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId;
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role;
    const data = await this.workflowService.getFinishedGoods(companyId, userId, role);
    return { success: true, data };
  }

  @Post('production/finished-goods')
  @RequirePermissions('production.productionworkflow.read', 'production.productionworkflow.create', 'production.floor.create')
  async createFinishedGoods(@Body() dto: any, @Req() req: any) {
    const data = await this.workflowService.createFinishedGoods(
      dto,
      req.user?.sub || 'system',
    );
    return { success: true, data };
  }

  @Post('production/finished-goods/stock-in')
  @RequirePermissions('production.productionworkflow.read', 'production.productionworkflow.create', 'production.floor.create')
  async stockInFinishedGoods(@Body() dto: any, @Req() req: any) {
    const data = await this.workflowService.stockInFinishedGoods(
      dto,
      req.user?.sub || 'system',
    );
    return { success: true, data };
  }

  @Post('production/finished-goods/stock-out')
  @RequirePermissions('production.productionworkflow.read', 'production.productionworkflow.create', 'production.floor.create')
  async stockOutFinishedGoods(@Body() dto: any, @Req() req: any) {
    const data = await this.workflowService.stockOutFinishedGoods(
      dto,
      req.user?.sub || 'system',
    );
    return { success: true, data };
  }

  @Post('production/finished-goods/adjust')
  @RequirePermissions('production.productionworkflow.read', 'production.productionworkflow.create', 'production.floor.create')
  async adjustFinishedGoods(@Body() dto: any, @Req() req: any) {
    const data = await this.workflowService.adjustFinishedGoods(
      dto,
      req.user?.sub || 'system',
    );
    return { success: true, data };
  }

  @Get('production/finished-goods/:productId/history')
  @RequirePermissions('production.productionworkflow.read')
  async getFinishedGoodsHistory(
    @Param('productId') productId: string,
    @Req() req: any,
  ) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId || 'COMP-000001';
    const data = await this.workflowService.getFinishedGoodsHistory(companyId, productId);
    return { success: true, data };
  }

  // ==========================================
  // PRODUCTION FLOOR
  // ==========================================
  @Get('production/floor')
  @RequirePermissions('production.floor.read')
  async getFloorJobs() {
    const data = await this.workflowService.getJobsByStatus([
      'IN_PRODUCTION',
      'REWORK_IN_PROGRESS',
    ]);
    return { success: true, data };
  }

  @Post('production/:id/start')
  @RequirePermissions('production.floor.start')
  async startJob(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.startJob(id, req.user?.sub || 'system');
  }

  @Post('production/:id/complete')
  @RequirePermissions('production.floor.complete')
  async completeJob(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.completeWork(id, req.user?.sub || 'system');
  }

  // ==========================================
  // QC PENDING
  // ==========================================
  @Get('production/qc-history')
  @RequirePermissions('production.qc.read')
  async getQCHistory() {
    const data = await this.workflowService.getQcHistoryInspections();
    return { success: true, data };
  }

  @Get('production/qc-pending')
  @RequirePermissions('production.qc.read')
  async getQCPending() {
    const data = await this.workflowService.getQcPendingInspections();
    return { success: true, data };
  }

  @Post('production/:id/qc-pass')
  @RequirePermissions('production.qc.approve')
  async qcPass(
    @Param('id') id: string,
    @Body() dto: QcPassDto,
    @Req() req: any,
  ) {
    return this.workflowService.passQC(id, req.user?.sub || 'system', dto);
  }

  @Post('production/:id/qc-fail')
  @RequirePermissions('production.qc.reject')
  async qcFail(
    @Param('id') id: string,
    @Body() dto: { failureReason: string; remarks?: string },
    @Req() req: any,
  ) {
    return this.workflowService.failQC(
      id,
      req.user?.sub || 'system',
      dto.failureReason,
      dto.remarks,
    );
  }

  // ==========================================
  // QC FAILED
  // ==========================================
  @Get('production/qc-failed')
  @RequirePermissions('production.floor.read', 'production.qc.read', 'production.productionworkflow.read')
  async getQCFailed() {
    const data = await this.workflowService.getJobsByStatus(['QC_FAILED']);
    return { success: true, data };
  }

  @Post('production/:id/start-rework')
  @RequirePermissions('production.floor.rework', 'production.floor.start', 'production.floor.create')
  async startRework(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.startRework(id, req.user?.sub || 'system');
  }

  @Post('production/:id/complete-rework')
  @RequirePermissions('production.floor.rework')
  async completeRework(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.completeRework(id, req.user?.sub || 'system');
  }

  // ==========================================
  // READY FOR DISPATCH
  // ==========================================
  @Get('production/ready-for-dispatch')
  @RequirePermissions('logistics.dispatches.read')
  async getReadyForDispatch() {
    const data = await this.workflowService.getJobsByStatus([
      'READY_FOR_DISPATCH',
    ]);
    return { success: true, data };
  }

  // ==========================================
  // PLANT HEAD (READ ONLY)
  // ==========================================
  @Get('plant-head/qc-failures')
  @RequirePermissions('plant-head.qc-failures.read')
  async getPlantHeadQCFailures() {
    const data = await this.workflowService.getJobsByStatus(['QC_FAILED']);
    return { success: true, data };
  }
}
