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

function formatAddress(addr: any): string {
  if (!addr) return '';
  if (typeof addr === 'string') {
    const trimmed = addr.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return formatAddress(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    if (trimmed.toLowerCase() === 'see lead/customer address') return '';
    return trimmed;
  }
  if (typeof addr === 'object') {
    const parts: string[] = [];
    const line1 = addr.line1 || addr.addressLine1 || addr.street || addr.address || '';
    const line2 = addr.line2 || addr.addressLine2 || addr.landmark || '';
    const city = addr.city || '';
    const state = addr.state || '';
    const pincode = addr.pincode || addr.postalCode || addr.zipCode || '';
    const country = addr.country || '';

    if (line1) parts.push(line1);
    if (line2) parts.push(line2);
    if (city) parts.push(city);
    if (state && pincode) parts.push(`${state} - ${pincode}`);
    else if (state) parts.push(state);
    else if (pincode) parts.push(pincode);
    if (country && country.toLowerCase() !== 'india') parts.push(country);

    return parts.filter(Boolean).join(', ');
  }
  return '';
}

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

    const rawItems: any[] = data.items || data.products || data.sampleItems || [];

    const enrichedItems = rawItems.map((it: any) => {
      const p = it.product;
      const pName = p?.name || p?.product_name || it.productName || it.name || it.specifications || 'Sample Product';
      const pSku = p?.sku || it.sku || it.productCode || '';
      const pCat = p?.category || it.category || '';
      const pType = p?.productType || it.productType || '';
      const pDispatchCat = p?.dispatchCategory || it.dispatchCategory || '';

      const nameUpper = String(pName).toUpperCase();
      const skuUpper = String(pSku).toUpperCase();
      const catUpper = String(pCat).toUpperCase();
      const typeUpper = String(pType).toUpperCase();

      const itemIsTrading =
        typeUpper === 'TRADING' ||
        String(pDispatchCat).toUpperCase() === 'D2' ||
        ['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING'].includes(catUpper) ||
        nameUpper.startsWith('WCB') ||
        nameUpper.startsWith('PCB') ||
        nameUpper.startsWith('HTCB') ||
        nameUpper.startsWith('DTCB') ||
        nameUpper.startsWith('MCB') ||
        nameUpper.startsWith('BTCB') ||
        nameUpper.startsWith('FRC') ||
        nameUpper.startsWith('RCC') ||
        nameUpper.includes('COVERBLOCK') ||
        nameUpper.includes('COVER BLOCK') ||
        nameUpper.includes('FRC COVER') ||
        nameUpper.includes('RCC PIPE') ||
        skuUpper.startsWith('WCB') ||
        skuUpper.startsWith('PCB') ||
        skuUpper.startsWith('FRC') ||
        skuUpper.startsWith('RCC');

      const itemDispatchCategory = itemIsTrading ? 'D2' : 'D1';

      // Match lead.detailedItems if available
      let detailedLeadItem: any = null;
      if (Array.isArray(data.lead?.detailedItems)) {
        detailedLeadItem = data.lead.detailedItems.find((di: any) =>
          (di.productId && (di.productId === it.productId || di.productId === p?.id)) ||
          (di.productCode && di.productCode === pSku) ||
          (di.productName && di.productName === pName)
        );
      }

      return {
        ...it,
        productId: it.productId || p?.id,
        productName: pName,
        name: pName,
        sku: pSku,
        category: pCat,
        productType: pType || (itemIsTrading ? 'TRADING' : 'MANUFACTURING'),
        dispatchCategory: itemDispatchCategory,
        isTrading: itemIsTrading,
        quantity: Number(it.quantity) || 1,
        specifications: it.specifications || detailedLeadItem?.specification || '',
        color: detailedLeadItem?.color || '',
        size: p?.size || detailedLeadItem?.size || '',
        capacity: p?.capacity || detailedLeadItem?.capacity || '',
        unit: p?.unit || 'Pcs',
        unitPrice: p?.unitPrice != null ? Number(p.unitPrice) : detailedLeadItem?.unitPrice != null ? Number(detailedLeadItem.unitPrice) : undefined,
      };
    });

    const d1Items = enrichedItems.filter((it: any) => !it.isTrading);
    const d2Items = enrichedItems.filter((it: any) => it.isTrading);

    const d1Product = d1Items.map((it: any) => `${it.productName} (${it.quantity} Pcs)`).join(', ');
    const d2Product = d2Items.map((it: any) => `${it.productName} (${it.quantity} Pcs)`).join(', ');

    const d1Quantity = d1Items.reduce((sum: number, it: any) => sum + it.quantity, 0);
    const d2Quantity = d2Items.reduce((sum: number, it: any) => sum + it.quantity, 0);

    const isMixed = d1Items.length > 0 && d2Items.length > 0;

    const primaryItem = enrichedItems[0];
    const product =
      enrichedItems.length > 1
        ? enrichedItems.map((it: any) => `${it.productName} (${it.quantity} Pcs)`).join(', ')
        : primaryItem?.productName || 'Sample Product';

    const productName = primaryItem?.productName || 'Sample Product';
    const quantity = enrichedItems.reduce((sum: number, it: any) => sum + Number(it.quantity || 0), 0) || 1;

    const contactPerson = data.lead?.contactPerson || data.customer?.contactPerson || '';
    const phone = data.lead?.phone || data.customer?.phone || '';
    const email = data.lead?.email || data.customer?.email || '';
    const salesExecutiveName = data.salesExecutive?.name || data.lead?.salesExecutive?.name || '';

    const deliveryAddress =
      formatAddress(data.deliveryAddress) ||
      formatAddress(data.address) ||
      formatAddress(data.lead?.address) ||
      formatAddress(data.customer?.shippingAddress) ||
      formatAddress(data.customer?.billingAddress) ||
      '';

    const transportCost =
      data.transportCost != null && !isNaN(Number(data.transportCost))
        ? Number(data.transportCost)
        : data.transportationCost != null && !isNaN(Number(data.transportationCost))
        ? Number(data.transportationCost)
        : data.lead?.transportationCost != null && !isNaN(Number(data.lead.transportationCost))
        ? Number(data.lead.transportationCost)
        : data.lead?.expectedTransportationCost != null && !isNaN(Number(data.lead.expectedTransportationCost))
        ? Number(data.lead.expectedTransportationCost)
        : 0;

    const primaryProd = primaryItem?.product;
    const prodCategory = primaryProd?.category || primaryItem?.category || '';
    const prodType = primaryProd?.productType || primaryItem?.productType || '';
    const prodDispatchCat = primaryProd?.dispatchCategory || primaryItem?.dispatchCategory || '';

    const isTrading = primaryItem ? primaryItem.isTrading : false;
    const dispatchCategory = prodDispatchCat || (isTrading ? 'D2' : 'D1');
    const dispatchStatus = data.dispatchStatus || (data.deliveredAt ? 'Delivered' : data.dispatchDate ? 'In Transit' : 'Pending Dispatch');

    return {
      ...data,
      status: statusMap[data.status] || data.status,
      leadName,
      customerName: leadName,
      companyName: leadName,
      customer: leadName,
      address: deliveryAddress || data.address || 'See Lead/Customer address',
      deliveryAddress,
      formattedAddress: deliveryAddress,
      product,
      productName,
      quantity,
      contactPerson,
      phone,
      contactPhone: phone,
      email,
      salesExecutiveName,
      transportCost,
      transportationCost: transportCost,
      dispatchStatus,
      delivered: Boolean(data.deliveredAt),
      deliveredDate: data.deliveredAt,
      items: enrichedItems,
      sampleItems: enrichedItems,
      products: enrichedItems,
      d1Items,
      d2Items,
      d1Product,
      d2Product,
      d1Quantity,
      d2Quantity,
      hasD1Items: d1Items.length > 0,
      hasD2Items: d2Items.length > 0,
      isMixed,
      category: prodCategory,
      productType: prodType || (isTrading ? 'TRADING' : 'MANUFACTURING'),
      dispatchCategory,
      isTrading,
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
