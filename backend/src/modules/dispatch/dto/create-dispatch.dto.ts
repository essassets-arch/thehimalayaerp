import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateDispatchItemDto {
  @IsNotEmpty()
  @IsString()
  salesOrderItemId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workOrderIds?: string[];
}

export class CreateDispatchDto {
  @IsNotEmpty()
  @IsString()
  salesOrderId: string;

  @IsNotEmpty()
  @IsString()
  deliveryAddress: string;

  @IsNotEmpty()
  @IsString()
  vehicleNumber: string;

  @IsOptional()
  @IsString()
  transporterName?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsNumber()
  @Min(0)
  totalWeight?: number;

  @IsOptional()
  @IsString()
  dispatchRemarks?: string;

  @IsOptional()
  @IsString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  challanNumber?: string;

  @IsOptional()
  @IsString()
  ewayBillNumber?: string;

  @IsOptional()
  @IsString()
  dispatchCategory?: string;

  @IsOptional()
  @IsNumber()
  freightAmount?: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDispatchItemDto)
  items: CreateDispatchItemDto[];
}
