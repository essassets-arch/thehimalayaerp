import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { ListSalesOrdersQueryDto } from './dto/list-sales-orders-query.dto';
import { SalesOrderListResponseDto } from './dto/sales-order-list-response.dto';
import { SalesOrderResponseDto } from './dto/sales-order-response.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { ConvertQuotationToOrderDto } from './dto/convert-quotation-to-order.dto';
import { IsOptional, IsString } from 'class-validator';

export class WorkflowActionDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

@Controller('sales/orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @RequirePermissions(
    'sales.orders.read',
    'logistics.dispatches.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  async listOrders(
    @Query() query: ListSalesOrdersQueryDto,
    @Req() req: any,
  ): Promise<SalesOrderListResponseDto> {
    return this.salesService.listOrders(query, req.user?.sub, req.user?.role);
  }

  @Get('delivered/pending-payment')
  @RequirePermissions('sales.orders.read')
  async listDeliveredPendingPayment(@Req() req: any) {
    return this.salesService.listDeliveredPendingPayment(
      req.user?.sub,
      req.user?.role,
    );
  }

  @Get('lookup/by-number')
  @RequirePermissions(
    'sales.orders.read',
    'logistics.dispatches.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  async lookupOrder(
    @Query('orderNumber') orderNumber: string,
    @Query('id') id: string,
    @Req() req: any,
  ): Promise<any> {
    const target = orderNumber || id || '';
    return this.salesService.getOrder(target, req.user?.sub, req.user?.role);
  }

  @Get(':id')
  @RequirePermissions(
    'sales.orders.read',
    'logistics.dispatches.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  async getOrder(@Param('id') id: string, @Req() req: any): Promise<any> {
    return this.salesService.getOrder(id, req.user?.sub, req.user?.role);
  }

  @Post()
  @RequirePermissions('sales.orders.create')
  @UseInterceptors(IdempotencyInterceptor)
  async createOrder(
    @Body() dto: CreateSalesOrderDto,
    @Req() req: any,
  ): Promise<SalesOrderResponseDto> {
    return this.salesService.createOrder(dto, req.user?.sub, req.user?.role);
  }

  @Post('from-quotation')
  @RequirePermissions('sales.orders.create')
  @UseInterceptors(IdempotencyInterceptor)
  async convertQuotationToOrder(
    @Body() dto: ConvertQuotationToOrderDto,
    @Req() req: any,
  ): Promise<SalesOrderResponseDto> {
    return this.salesService.convertQuotationToOrder(
      dto,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/action')
  @RequirePermissions('sales.orders.update')
  @UseInterceptors(IdempotencyInterceptor)
  async processAction(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @Req() req: any,
  ) {
    return this.salesService.processAction(
      id,
      dto,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/submit')
  @RequirePermissions('sales.orders.update')
  async submitOrder(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @Req() req: any,
  ) {
    dto.action = 'SUBMIT';
    return this.salesService.processAction(
      id,
      dto,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/approve')
  @RequirePermissions('sales.orders.approve')
  async approveOrder(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @Req() req: any,
  ) {
    dto.action = 'CONFIRM';
    return this.salesService.processAction(
      id,
      dto,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/reject')
  @RequirePermissions('sales.orders.approve')
  async rejectOrder(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @Req() req: any,
  ) {
    dto.action = 'REJECT';
    return this.salesService.processAction(
      id,
      dto,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/send-to-plant')
  @RequirePermissions('sales.orders.update')
  async sendToPlant(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @Req() req: any,
  ) {
    dto.action = 'SEND_TO_PLANT';
    return this.salesService.processAction(
      id,
      dto,
      req.user?.sub,
      req.user?.role,
    );
  }

  @Post(':id/send-to-plant-head')
  @RequirePermissions('sales.orders.update')
  @UseInterceptors(IdempotencyInterceptor)
  async sendToPlantHead(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @Req() req: any,
  ) {
    dto.action = 'SEND_TO_PLANT';
    return this.salesService.processAction(
      id,
      dto,
      req.user?.sub,
      req.user?.role,
    );
  }
}
