import * as fs from 'fs';
import * as path from 'path';
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
  Query,
  Headers,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DispatchService } from './dispatch.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';

@Controller('logistics/dispatches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  private extractAuthData(req: any, headers: Record<string, string>) {
    const userId = req.user?.sub || 'a6605e65-beca-40f2-a19f-8e451e270867';
    const companyId =
      req.user?.companyId ||
      headers['x-company-id'] ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return { userId, companyId };
  }

  @Get()
  @RequirePermissions('logistics.dispatches.read')
  async listDispatches(
    @Req() req: any,
    @Headers() headers: Record<string, string>,
    @Query('status') status?: string,
  ) {
    const { userId } = this.extractAuthData(req, headers);
    const dispatches = await this.dispatchService.listDispatches(
      userId,
      req.user?.role,
      status,
    );
    return dispatches;
  }

  @Get('queue')
  @RequirePermissions('logistics.dispatches.read')
  async getDispatchQueue(
    @Req() req: any,
    @Headers() headers: Record<string, string>,
  ) {
    const { userId, companyId } = this.extractAuthData(req, headers);
    const queue = await this.dispatchService.getDispatchQueue(
      userId,
      req.user?.role,
      companyId,
    );
    return queue;
  }

  @Get('finished-goods-history')
  @RequirePermissions('logistics.dispatches.read')
  async getFinishedGoodsHistory() {
    const data = await this.dispatchService.getFinishedGoodsHistory();
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('logistics.dispatches.read')
  async getDispatch(
    @Param('id') id: string,
    @Req() req: any,
    @Headers() headers: Record<string, string>,
  ) {
    const { userId } = this.extractAuthData(req, headers);
    return this.dispatchService.getDispatch(id, userId, req.user?.role);
  }

  @Post()
  @RequirePermissions('logistics.dispatches.create')
  async createDispatch(
    @Body() dto: CreateDispatchDto,
    @Req() req: any,
    @Headers() headers: Record<string, string>,
  ) {
    const { userId } = this.extractAuthData(req, headers);
    try {
      return await this.dispatchService.createDispatch(dto, userId);
    } catch (e: any) {
      console.error('[DISPATCH_CREATE_ERROR]', e);
      throw e;
    }
  }

  @Post(':id/start-delivery')
  @RequirePermissions('logistics.dispatches.start-delivery')
  async startDelivery(@Param('id') id: string) {
    return this.dispatchService.startDelivery(id);
  }

  @Post(':id/confirm-delivery')
  @RequirePermissions('logistics.dispatches.confirm-delivery')
  async confirmDelivery(
    @Param('id') id: string,
    @Body() dto: ConfirmDeliveryDto,
    @Req() req: any,
    @Headers() headers: Record<string, string>,
  ) {
    const { userId } = this.extractAuthData(req, headers);
    return this.dispatchService.confirmDelivery(id, dto, userId);
  }

  @Post(':id/deliver')
  @RequirePermissions(
    'logistics.dispatches.confirm-delivery',
    'logistics.dispatches.create',
    'logistics.dispatches.read',
  )
  @UseInterceptors(
    FileInterceptor('pod', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async deliverDispatch(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: any,
    @Req() req: any,
    @Headers() headers: Record<string, string>,
  ) {
    const { userId } = this.extractAuthData(req, headers);
    let podUrl = body.podUrl || body.podImageUrl;
    if (file) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'pod');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      podUrl = `/uploads/pod/${filename}`;
    }

    const dto: ConfirmDeliveryDto = {
      receiverName: body.receivedBy || body.receiverName || 'Authorized Receiver',
      receiverPhone: body.receiverPhone || '',
      deliveryRemarks: body.deliveryRemarks || '',
      podImageUrl: podUrl || '/uploads/pod/default-pod.png',
      deliveredAt: body.deliveredAt ? String(body.deliveredAt) : new Date().toISOString(),
    };

    return this.dispatchService.confirmDelivery(id, dto, userId);
  }
}
