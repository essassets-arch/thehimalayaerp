import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalesOrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  orderedQuantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  specifications?: Record<string, any>;
}

export class CreateSalesOrderDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  @IsOptional()
  quotationId?: string;

  @IsDateString()
  @IsOptional()
  orderDate?: string;

  @IsDateString()
  @IsOptional()
  requestedDeliveryDate?: string;

  @IsString()
  @IsOptional()
  customerPurchaseOrderNo?: string;

  @IsDateString()
  @IsOptional()
  customerPurchaseOrderDate?: string;

  @IsString()
  @IsOptional()
  customerPurchaseOrderFileUrl?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  paymentTermsDays?: number;

  @IsString()
  @IsOptional()
  deliveryTerms?: string;

  @IsOptional()
  billingAddress?: any;

  @IsOptional()
  shippingAddress?: any;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderItemDto)
  items: CreateSalesOrderItemDto[];
}
