import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SalesDownloadRequestsService } from './sales-download-requests.service';
import {
  CreateDownloadRequestDto,
  ReviewDownloadRequestDto,
  ConsumeDownloadRequestDto,
} from './dto/sales-download-request.dto';

@Controller('sales/download-requests')
@UseGuards(JwtAuthGuard)
export class SalesDownloadRequestsController {
  constructor(
    private readonly service: SalesDownloadRequestsService,
  ) {}

  @Post()
  async createRequest(@Body() dto: CreateDownloadRequestDto, @Req() req: any) {
    return this.service.createRequest(dto, {
      userId: req.user?.sub || req.user?.id,
      role: req.user?.role,
      companyId: req.user?.companyId,
      email: req.user?.email,
      name: req.user?.name,
    });
  }

  @Get('my')
  async listMyRequests(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.service.listMyRequests(userId);
  }

  @Get('active-approval')
  async getActiveApproval(
    @Req() req: any,
    @Query('module') moduleName: string,
    @Query('exportType') exportType?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.service.getActiveApproval(userId, moduleName, exportType);
  }

  @Get('admin')
  async listAdminRequests(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.listAdminRequests(req.user?.role, req.user?.companyId, {
      status,
      search,
    });
  }

  @Post(':id/approve')
  async approveRequest(
    @Param('id') id: string,
    @Body() dto: ReviewDownloadRequestDto,
    @Req() req: any,
  ) {
    return this.service.approveRequest(id, dto, {
      userId: req.user?.sub || req.user?.id,
      role: req.user?.role,
      name: req.user?.name,
      email: req.user?.email,
    });
  }

  @Post(':id/reject')
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: ReviewDownloadRequestDto,
    @Req() req: any,
  ) {
    return this.service.rejectRequest(id, dto, {
      userId: req.user?.sub || req.user?.id,
      role: req.user?.role,
      name: req.user?.name,
      email: req.user?.email,
    });
  }

  @Post(':id/consume')
  async consumeApproval(
    @Param('id') id: string,
    @Body() dto: ConsumeDownloadRequestDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.service.consumeApproval(id, dto, userId);
  }
}
