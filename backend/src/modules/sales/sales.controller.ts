import {
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
import { Permissions } from '../../common/decorators/permissions.decorator';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { ConvertQuotationToOrderDto } from './dto/convert-quotation-to-order.dto';
import { AttachCustomerPoDto } from './dto/attach-customer-po.dto';
import { RunCreditCheckDto } from './dto/run-credit-check.dto';
import { ApproveCreditExceptionDto } from './dto/approve-credit-exception.dto';
import { ConfirmSalesOrderDto } from './dto/confirm-sales-order.dto';
import { SendOrderToPlantHeadDto } from './dto/send-order-to-plant-head.dto';
import { CancelSalesOrderDto } from './dto/cancel-sales-order.dto';
import { TransitionResponseDto } from './dto/transition-response.dto';

@Controller('sales/orders')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @Permissions('sales.orders.read')
  async listOrders(
    @Query() query: ListSalesOrdersQueryDto,
  ): Promise<SalesOrderListResponseDto> {
    return this.salesService.listOrders(query);
  }

  @Get(':id')
  @Permissions('sales.orders.read')
  async getOrder(@Param('id') id: string): Promise<SalesOrderResponseDto> {
    return this.salesService.getOrder(id);
  }

  @Get(':id/timeline')
  @Permissions('sales.orders.read')
  async getOrderTimeline(@Param('id') id: string): Promise<any[]> {
    return this.salesService.getOrderTimeline(id);
  }

  @Post()
  @Permissions('sales.orders.create')
  @UseInterceptors(IdempotencyInterceptor)
  async createOrder(
    @Body() dto: CreateSalesOrderDto,
    @Req() req: any,
  ): Promise<SalesOrderResponseDto> {
    return this.salesService.createOrder(dto, req.user?.sub);
  }

  @Post('from-quotation')
  @Permissions('sales.orders.create')
  @UseInterceptors(IdempotencyInterceptor)
  async convertQuotationToOrder(
    @Body() dto: ConvertQuotationToOrderDto,
    @Req() req: any,
  ): Promise<SalesOrderResponseDto> {
    return this.salesService.convertQuotationToOrder(dto, req.user?.sub);
  }

  @Post(':id/customer-po')
  @Permissions('sales.orders.update')
  @UseInterceptors(IdempotencyInterceptor)
  async attachCustomerPo(
    @Param('id') id: string,
    @Body() dto: AttachCustomerPoDto,
    @Req() req: any,
  ): Promise<TransitionResponseDto> {
    return this.salesService.attachCustomerPo(id, dto, req.user?.sub);
  }

  @Post(':id/credit-check')
  @Permissions('sales.orders.update')
  @UseInterceptors(IdempotencyInterceptor)
  async runCreditCheck(
    @Param('id') id: string,
    @Body() dto: RunCreditCheckDto,
    @Req() req: any,
  ): Promise<TransitionResponseDto> {
    return this.salesService.runCreditCheck(id, dto, req.user?.sub);
  }

  @Post(':id/credit-exception/approve')
  @Permissions('sales.credit.override')
  @UseInterceptors(IdempotencyInterceptor)
  async approveCreditException(
    @Param('id') id: string,
    @Body() dto: ApproveCreditExceptionDto,
    @Req() req: any,
  ): Promise<TransitionResponseDto> {
    return this.salesService.approveCreditException(id, dto, req.user?.sub);
  }

  @Post(':id/confirm')
  @Permissions('sales.orders.confirm')
  @UseInterceptors(IdempotencyInterceptor)
  async confirmOrder(
    @Param('id') id: string,
    @Body() dto: ConfirmSalesOrderDto,
    @Req() req: any,
  ): Promise<TransitionResponseDto> {
    return this.salesService.confirmOrder(id, dto, req.user?.sub);
  }

  @Post(':id/send-to-plant-head')
  @Permissions('sales.orders.send_to_plant')
  @UseInterceptors(IdempotencyInterceptor)
  async sendToPlantHead(
    @Param('id') id: string,
    @Body() dto: SendOrderToPlantHeadDto,
    @Req() req: any,
  ): Promise<TransitionResponseDto> {
    return this.salesService.sendToPlantHead(id, dto, req.user?.sub);
  }

  @Post(':id/cancel')
  @Permissions('sales.orders.cancel')
  @UseInterceptors(IdempotencyInterceptor)
  async cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelSalesOrderDto,
    @Req() req: any,
  ): Promise<TransitionResponseDto> {
    return this.salesService.cancelOrder(id, dto, req.user?.sub);
  }
}
