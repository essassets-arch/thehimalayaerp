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
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('brand-analysis')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BrandAnalysisController {
  constructor(private readonly brandAnalysisService: BrandAnalysisService) {}

  @Post()
  @RequirePermissions(
    'store.brand-analysis.create',
    'store.create',
    'store.read',
    'store.manage',
    'inventory.stock.read',
    'inventory.inventory.read',
    'procurement.create',
  )
  create(@Body() createDto: CreateBrandAnalysisDto, @Request() req) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.create(createDto, userId);
  }

  @Get('my-requests')
  @RequirePermissions(
    'store.brand-analysis.read',
    'store.read',
    'inventory.stock.read',
    'inventory.inventory.read',
    'procurement.read',
  )
  findAllForStore(@Request() req) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.findAllForStore(userId);
  }

  @Get('super-admin/requests')
  @RequirePermissions('super-admin.brand-analysis.read', 'admin.read')
  findAllForSuperAdmin() {
    return this.brandAnalysisService.findAllForSuperAdmin();
  }

  @Get('finance/requests')
  @RequirePermissions('finance.brand-analysis.read', 'finance.read')
  findAllForFinance() {
    return this.brandAnalysisService.findAllForFinance();
  }

  @Get(':id')
  @RequirePermissions(
    'store.brand-analysis.read',
    'super-admin.brand-analysis.read',
    'finance.brand-analysis.read',
    'store.read',
    'inventory.stock.read',
    'inventory.inventory.read',
    'procurement.read',
    'finance.read',
    'admin.read',
  )
  findOne(@Param('id') id: string) {
    return this.brandAnalysisService.findOne(id);
  }

  @Post(':id/approve')
  @RequirePermissions('super-admin.brand-analysis.approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveBrandAnalysisDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.approve(id, dto, userId);
  }

  @Post(':id/reject')
  @RequirePermissions('super-admin.brand-analysis.reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectBrandAnalysisDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.reject(id, dto, userId);
  }

  @Post(':id/start-analysis')
  @RequirePermissions('finance.brand-analysis.start')
  startAnalysis(
    @Param('id') id: string,
    @Body() dto: StartBrandAnalysisDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.startAnalysis(id, dto, userId);
  }

  @Post(':id/complete-analysis')
  @RequirePermissions('finance.brand-analysis.complete')
  completeAnalysis(
    @Param('id') id: string,
    @Body() dto: CompleteBrandAnalysisDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.brandAnalysisService.completeAnalysis(id, dto, userId);
  }
}
