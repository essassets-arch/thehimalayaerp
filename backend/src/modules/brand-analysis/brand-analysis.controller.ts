import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BrandAnalysisService } from './brand-analysis.service';
import {
  CreateBrandAnalysisDto,
  ApproveBrandAnalysisDto,
  RejectBrandAnalysisDto,
  StartBrandAnalysisDto,
  CompleteBrandAnalysisDto,
} from './dto/brand-analysis.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('brand-analysis')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BrandAnalysisController {
  constructor(private readonly brandAnalysisService: BrandAnalysisService) {}

  @Post()
  @Permissions('store.brand-analysis.create')
  create(@Body() createDto: CreateBrandAnalysisDto, @Request() req) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.create(createDto, userId);
  }

  @Get('my-requests')
  @Permissions('store.brand-analysis.read')
  findAllForStore(@Request() req) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.findAllForStore(userId);
  }

  @Get('super-admin/requests')
  @Permissions('super-admin.brand-analysis.read')
  findAllForSuperAdmin() {
    return this.brandAnalysisService.findAllForSuperAdmin();
  }

  @Get('finance/requests')
  @Permissions('finance.brand-analysis.read')
  findAllForFinance() {
    return this.brandAnalysisService.findAllForFinance();
  }

  @Get(':id')
  @Permissions(
    'store.brand-analysis.read',
    'super-admin.brand-analysis.read',
    'finance.brand-analysis.read',
  )
  findOne(@Param('id') id: string) {
    return this.brandAnalysisService.findOne(id);
  }

  @Post(':id/approve')
  @Permissions('super-admin.brand-analysis.approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveBrandAnalysisDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.approve(id, dto, userId);
  }

  @Post(':id/reject')
  @Permissions('super-admin.brand-analysis.reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectBrandAnalysisDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.reject(id, dto, userId);
  }

  @Post(':id/start-analysis')
  @Permissions('finance.brand-analysis.start')
  startAnalysis(
    @Param('id') id: string,
    @Body() dto: StartBrandAnalysisDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.startAnalysis(id, dto, userId);
  }

  @Post(':id/complete-analysis')
  @Permissions('finance.brand-analysis.complete')
  completeAnalysis(
    @Param('id') id: string,
    @Body() dto: CompleteBrandAnalysisDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.completeAnalysis(id, dto, userId);
  }
}
