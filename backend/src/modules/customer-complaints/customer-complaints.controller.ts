import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AdminRemarksDto,
  CreateCustomerComplaintDto,
} from './dto/create-customer-complaint.dto';
import { CustomerComplaintsService } from './customer-complaints.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class CustomerComplaintsController {
  constructor(private readonly service: CustomerComplaintsService) {}
  @Post('sales/complaints') create(
    @Body() dto: CreateCustomerComplaintDto,
    @Req() req: any,
  ) {
    return this.service.create(dto, req.user.id);
  }
  @Get('sales/complaints') listSales(@Req() req: any) {
    return this.service.listSales(req.user.id);
  }
  @Get('sales/complaints/:id') salesOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.service.findSales(id, req.user.id);
  }
  @Put('sales/complaints/:id') update(
    @Param('id') id: string,
    @Body() dto: CreateCustomerComplaintDto,
    @Req() req: any,
  ) {
    return this.service.updateSales(id, dto, req.user.id);
  }
  @Delete('sales/complaints/:id') remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.service.removeSales(id, req.user.id);
  }
  @Post('sales/complaints/:id/resubmit') resubmit(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.service.resubmit(id, req.user.id);
  }
  @Get('admin/complaints') listAdmin() {
    return this.service.listAdmin();
  }
  @Get('admin/complaints/:id') adminOne(@Param('id') id: string) {
    return this.service.findAdmin(id);
  }
  @Put('admin/complaints/:id/approve') approve(
    @Param('id') id: string,
    @Body() dto: Partial<AdminRemarksDto>,
    @Req() req: any,
  ) {
    return this.service.approve(id, req.user.id, dto.adminRemarks);
  }
  @Put('admin/complaints/:id/reject') reject(
    @Param('id') id: string,
    @Body() dto: AdminRemarksDto,
    @Req() req: any,
  ) {
    return this.service.reject(id, req.user.id, dto.adminRemarks);
  }
  @Put('admin/complaints/:id/remarks') remarks(
    @Param('id') id: string,
    @Body() dto: AdminRemarksDto,
    @Req() req: any,
  ) {
    return this.service.remarks(id, req.user.id, dto.adminRemarks);
  }
}
