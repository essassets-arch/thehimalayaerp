import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Headers,
  Request,
  UnauthorizedException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { SamplesService } from './samples.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller(['samples', 'sales/samples'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  private extractAuthData(req: any, headers: any) {
    const companyId =
      req.user?.companyId ||
      headers['x-company-id'] ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const userId =
      req.user?.sub || req.user?.id || 'a6605e65-beca-40f2-a19f-8e451e270867';
    const role = req.user?.role || 'admin';

    if (!companyId) {
      throw new UnauthorizedException('Company ID is required');
    }

    return { companyId, userId, role };
  }

  private mapSampleStatus(data: any): any {
    if (!data) return data;
    if (Array.isArray(data)) {
      return data.map((item) => this.mapSampleStatus(item));
    }
    const statusMap: Record<string, string> = {
      CREATED: 'CREATED',
      PENDING_DISPATCH: 'PENDING',
      DISPATCHED: 'SENT',
      IN_TRANSIT: 'SENT',
      DELIVERED: 'DELIVERED',
      TESTING: 'UNDER_TESTING',
      EVALUATION_ACTIVE: 'EVALUATION_ACTIVE',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      RETURN_REQUESTED: 'RETURN_REQUESTED',
      RETURNED: 'RETURNED',
    };
    const leadName =
      data.lead?.companyName ||
      data.lead?.leadNumber ||
      data.customer?.companyName ||
      data.customer?.customerCode ||
      data.company?.name ||
      'Lead Customer';
    
    const primaryItem = data.items?.[0];
    const product =
      data.items && data.items.length > 1
        ? data.items.map((it: any) => `${it.product?.product_name || it.product?.name || it.specifications || 'Item'} (${it.quantity || 1} Pcs)`).join(', ')
        : primaryItem?.product?.product_name || primaryItem?.product?.name || primaryItem?.specifications || 'Sample Product';
    
    const productName = primaryItem?.product?.product_name || primaryItem?.product?.name || primaryItem?.specifications || 'Sample Product';
    const quantity = data.items?.reduce((sum: number, it: any) => sum + Number(it.quantity || 0), 0) || 1;
    const contactPerson = data.lead?.contactPerson || data.customer?.contactPerson || '';
    const phone = data.lead?.phone || data.customer?.phone || '';

    const dispatchStatus = data.dispatchStatus || (data.deliveredAt ? 'Delivered' : data.dispatchDate ? 'In Transit' : 'Pending Dispatch');

    return {
      ...data,
      status: statusMap[data.status] || data.status,
      leadName,
      customerName: leadName,
      companyName: leadName,
      customer: leadName,
      product,
      productName,
      quantity,
      contactPerson,
      phone,
      contactPhone: phone,
      dispatchStatus,
      delivered: Boolean(data.deliveredAt),
      deliveredDate: data.deliveredAt,
      sampleItems: data.items,
      products: data.items,
    };
  }

  @RequirePermissions('admin.samples.create')
  @Post()
  async create(
    @Body() createSampleDto: CreateSampleDto,
    @Request() req,
    @Headers() headers,
  ) {
    const { companyId, userId } = this.extractAuthData(req, headers);
    createSampleDto.companyId = companyId;
    try {
      const result = await this.samplesService.create(createSampleDto, userId);
      return this.mapSampleStatus(result);
    } catch (error) {
      console.error('CREATE SAMPLE FAILED:', error);
      throw error;
    }
  }

  @RequirePermissions('admin.samples.read', 'logistics.dispatches.read')
  @Get()
  async findAll(@Request() req, @Headers() headers) {
    const { companyId, userId, role } = this.extractAuthData(req, headers);
    const result = await this.samplesService.findAll(companyId, userId, role);
    return this.mapSampleStatus(result);
  }

  @RequirePermissions('admin.samples.read', 'logistics.dispatches.read')
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req, @Headers() headers) {
    const { companyId, userId, role } = this.extractAuthData(req, headers);
    const result = await this.samplesService.findOne(
      id,
      companyId,
      userId,
      role,
    );
    return this.mapSampleStatus(result);
  }

  @RequirePermissions('admin.samples.update', 'logistics.dispatches.read')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSampleDto: UpdateSampleDto,
    @Request() req,
    @Headers() headers,
  ) {
    const { companyId, userId, role } = this.extractAuthData(req, headers);
    const result = await this.samplesService.update(
      id,
      companyId,
      updateSampleDto,
      userId,
      role,
    );
    return this.mapSampleStatus(result);
  }

  @RequirePermissions(
    'admin.samples.create',
    'admin.samples.update',
    'logistics.dispatches.start-delivery',
    'logistics.dispatches.confirm-delivery',
  )
  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: SampleStatus;
      expectedVersion: number;
      extraData?: Record<string, any>;
    },
    @Request() req,
    @Headers() headers,
  ) {
    if (!body.status || !body.expectedVersion) {
      throw new BadRequestException('status and expectedVersion are required');
    }
    const { companyId, userId } = this.extractAuthData(req, headers);
    const result = await this.samplesService.updateStatus(
      id,
      companyId,
      body.status,
      body.expectedVersion,
      userId,
    );
    return this.mapSampleStatus(result);
  }
}
