import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import {
  SalesOrderStatus,
  ProductionStatus,
  DispatchStatus,
  PaymentStatus,
  OrderClosureStatus,
} from '@prisma/client';

export class ListSalesOrdersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SalesOrderStatus)
  orderStatus?: SalesOrderStatus;

  @IsOptional()
  @IsEnum(ProductionStatus)
  productionStatus?: ProductionStatus;

  @IsOptional()
  @IsEnum(DispatchStatus)
  dispatchStatus?: DispatchStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(OrderClosureStatus)
  closureStatus?: OrderClosureStatus;
}
