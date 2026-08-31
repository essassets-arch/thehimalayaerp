import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AdminRemarksDto,
  CreateCustomerComplaintDto,
  RejectComplaintDto,
} from './dto/create-customer-complaint.dto';
import { CustomerComplaintsService } from './customer-complaints.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class CustomerComplaintsController {
  constructor(private readonly service: CustomerComplaintsService) {}

  @RequirePermissions('sales.customercomplaints.create')
  @Post('sales/complaints')
  create(@Body() dto: CreateCustomerComplaintDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 'system';
    const role = req.user?.role?.code || req.user?.role;
    return this.service.create(dto, userId, role);
  }

  @RequirePermissions('sales.customercomplaints.read')
  @Get('sales/complaints-meta/orders-and-customers')
  metaOrdersAndCustomers(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 'system';
    const role = req.user?.role?.code || req.user?.role;
    return this.service.getMetaOrdersAndCustomers(userId, role);
  }

  @RequirePermissions('sales.customercomplaints.read')
  @Get('sales/complaints')
  listSales(@Req() req: any, @Query() query: any) {
    const userId = req.user?.id || req.user?.sub || 'system';
    const role = req.user?.role?.code || req.user?.role;
    return this.service.listSales(userId, role, query);
  }

  @RequirePermissions('sales.customercomplaints.read')
  @Get('sales/complaints/:id')
  salesOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 'system';
    const role = req.user?.role?.code || req.user?.role;
    return this.service.findSales(id, userId, role);
  }

  @RequirePermissions('sales.customercomplaints.update')
  @Put('sales/complaints/:id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateCustomerComplaintDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub || 'system';
    const role = req.user?.role?.code || req.user?.role;
    return this.service.updateSales(id, dto, userId, role);
  }

  @RequirePermissions('sales.customercomplaints.delete')
  @Delete('sales/complaints/:id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 'system';
    const role = req.user?.role?.code || req.user?.role;
    return this.service.removeSales(id, userId, role);
  }

  @RequirePermissions('sales.customercomplaints.submit')
  @Post('sales/complaints/:id/submit')
  submit(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 'system';
    const role = req.user?.role?.code || req.user?.role;
    return this.service.resubmit(id, userId, role);
  }

  @RequirePermissions('sales.customercomplaints.submit')
  @Post('sales/complaints/:id/resubmit')
  resubmit(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 'system';
    const role = req.user?.role?.code || req.user?.role;
    return this.service.resubmit(id, userId, role);
  }

  // ─── Plant Head Endpoints ───
  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'sales.customercomplaints.read',
  )
  @Get('plant-head/complaints')
  listPlantHead(@Query() query: any) {
    return this.service.listPlantHead(query);
  }

  @RequirePermissions(
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
    'sales.customercomplaints.read',
  )
  @Get('plant-head/complaints/:id')
  plantHeadOne(@Param('id') id: string) {
    return this.service.findPlantHead(id);
  }

  @RequirePermissions(
    'admin.planthead.create',
    'planthead.create',
    'sales.customercomplaints.approve',
  )
  @Put('plant-head/complaints/:id/approve')
  plantHeadApprove(
    @Param('id') id: string,
    @Body() dto: Partial<AdminRemarksDto>,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub || 'system';
    return this.service.approve(id, userId, dto.adminRemarks);
  }

  @RequirePermissions(
    'admin.planthead.create',
    'planthead.create',
    'sales.customercomplaints.reject',
  )
  @Put('plant-head/complaints/:id/reject')
  plantHeadReject(
    @Param('id') id: string,
    @Body() dto: RejectComplaintDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub || 'system';
    return this.service.reject(
      id,
      userId,
      dto.rejectionReason,
      dto.adminRemarks,
    );
  }

  // ─── Admin Endpoints (backward compatibility) ───
  @RequirePermissions('sales.customercomplaints.read')
  @Get('admin/complaints')
  listAdmin(@Query() query: any) {
    return this.service.listPlantHead(query);
  }

  @RequirePermissions('sales.customercomplaints.read')
  @Get('admin/complaints/:id')
  adminOne(@Param('id') id: string) {
    return this.service.findPlantHead(id);
  }

  @RequirePermissions('sales.customercomplaints.approve')
  @Put('admin/complaints/:id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: Partial<AdminRemarksDto>,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub || 'system';
    return this.service.approve(id, userId, dto.adminRemarks);
  }

  @RequirePermissions('sales.customercomplaints.reject')
  @Put('admin/complaints/:id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectComplaintDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub || 'system';
    return this.service.reject(
      id,
      userId,
      dto.rejectionReason,
      dto.adminRemarks,
    );
  }

  @RequirePermissions('sales.customercomplaints.update')
  @Put('admin/complaints/:id/remarks')
  remarks(
    @Param('id') id: string,
    @Body() dto: AdminRemarksDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub || 'system';
    return this.service.remarks(id, userId, dto.adminRemarks || '');
  }
}
