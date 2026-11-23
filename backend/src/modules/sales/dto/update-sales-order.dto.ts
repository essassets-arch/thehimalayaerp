import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSalesOrderItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productCode?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  orderedQuantity: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  specifications?: any;
}

export class UpdateSalesOrderDto {
  @IsOptional()
  @IsString()
  customerPurchaseOrderNo?: string;

  @IsOptional()
  @IsString()
  customerPurchaseOrderDate?: string | null;

  @IsOptional()
  @IsString()
  requestedDeliveryDate?: string | null;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paymentTermsDays?: number;

  @IsOptional()
  @IsString()
  deliveryTerms?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  freightAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  transportCharges?: number;

  @IsOptional()
  shippingAddress?: any;

  @IsOptional()
  billingAddress?: any;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSalesOrderItemDto)
  items?: UpdateSalesOrderItemDto[];
}
