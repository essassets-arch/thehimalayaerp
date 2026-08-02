import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { ProductionWorkflowService } from './production-workflow.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { QcPassDto } from './dto/qc-pass.dto';

@Controller()
export class ProductionWorkflowController {
  constructor(private readonly workflowService: ProductionWorkflowService) {}

  // ==========================================
  // DASHBOARD
  // ==========================================
  @Get('production/dashboard')
  @Permissions('production.floor.read', 'production.qc.read')
  async getDashboard() {
    const data = await this.workflowService.getDashboardCounts();
    return { success: true, data };
  }

  @Get('production/reports/summary')
  async getReportsSummary() {
    const data = await this.workflowService.getGlobalSummaryReport();
    return { success: true, data };
  }

  // ==========================================
  // SHIFT & SCRAP ENTRIES
  // ==========================================
  @Post('production/shift-entries')
  @Permissions('production.floor.create') // Adjust permissions as needed
  async createShiftEntry(@Body() dto: any, @Req() req: any) {
    const data = await this.workflowService.createShiftEntry(dto, req.user?.sub || 'system');
    return { success: true, data };
  }

  @Post('production/scrap-entries')
  @Permissions('production.floor.create')
  async createScrapEntry(@Body() dto: any, @Req() req: any) {
    const data = await this.workflowService.createScrapEntry(dto, req.user?.sub || 'system');
    return { success: true, data };
  }

  // ==========================================
  // FINISHED GOODS
  // ==========================================
  @Get('production/finished-goods')
  async getFinishedGoods(@Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId;
    const data = await this.workflowService.getFinishedGoods(companyId);
    return { success: true, data };
  }

  // ==========================================
  // PRODUCTION FLOOR
  // ==========================================
  @Get('production/floor')
  @Permissions('production.floor.read')
  async getFloorJobs() {
    const data = await this.workflowService.getJobsByStatus(['IN_PRODUCTION', 'REWORK_IN_PROGRESS']);
    return { success: true, data };
  }

  @Post('production/:id/start')
  @Permissions('production.floor.start')
  async startJob(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.startJob(id, req.user?.sub || 'system');
  }

  @Post('production/:id/complete')
  @Permissions('production.floor.complete')
  async completeJob(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.completeWork(id, req.user?.sub || 'system');
  }

  // ==========================================
  // QC PENDING
  // ==========================================
    @Get('production/qc-history')
  @Permissions('production.qc.read')
  async getQCHistory() {
    const data = await this.workflowService.getQcHistoryInspections();
    return { success: true, data };
  }

  @Get('production/qc-pending')
  @Permissions('production.qc.read')
  async getQCPending() {
    const data = await this.workflowService.getQcPendingInspections();
    return { success: true, data };
  }

  @Post('production/:id/qc-pass')
  @Permissions('production.qc.approve')
  async qcPass(@Param('id') id: string, @Body() dto: QcPassDto, @Req() req: any) {
    return this.workflowService.passQC(id, req.user?.sub || 'system', dto);
  }

  @Post('production/:id/qc-fail')
  @Permissions('production.qc.reject')
  async qcFail(@Param('id') id: string, @Body() dto: { failureReason: string; remarks?: string }, @Req() req: any) {
    return this.workflowService.failQC(id, req.user?.sub || 'system', dto.failureReason, dto.remarks);
  }

  // ==========================================
  // QC FAILED
  // ==========================================
  @Get('production/qc-failed')
  @Permissions('production.floor.read')
  async getQCFailed() {
    const data = await this.workflowService.getJobsByStatus(['QC_FAILED']);
    return { success: true, data };
  }

  @Post('production/:id/start-rework')
  @Permissions('production.floor.rework')
  async startRework(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.startRework(id, req.user?.sub || 'system');
  }

  @Post('production/:id/complete-rework')
  @Permissions('production.floor.rework')
  async completeRework(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.completeRework(id, req.user?.sub || 'system');
  }

  // ==========================================
  // READY FOR DISPATCH
  // ==========================================
  @Get('production/ready-for-dispatch')
  @Permissions('logistics.dispatches.read')
  async getReadyForDispatch() {
    const data = await this.workflowService.getJobsByStatus(['READY_FOR_DISPATCH']);
    return { success: true, data };
  }

  // ==========================================
  // PLANT HEAD (READ ONLY)
  // ==========================================
  @Get('plant-head/qc-failures')
  @Permissions('plant-head.qc-failures.read')
  async getPlantHeadQCFailures() {
    const data = await this.workflowService.getJobsByStatus(['QC_FAILED']);
    return { success: true, data };
  }
}

