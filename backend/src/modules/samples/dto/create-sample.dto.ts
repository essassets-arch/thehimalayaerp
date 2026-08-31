import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class CreateSampleItemDto {
  @IsOptional()
  productId?: any;

  @IsOptional()
  quantity?: any;

  @IsOptional()
  specifications?: any;
}

export class CreateSampleDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  leadId?: any;

  @IsOptional()
  customerId?: any;

  @IsOptional()
  expectedDeliveryDate?: any;

  @IsOptional()
  testingDeadline?: any;

  @IsOptional()
  returnDeadline?: any;

  @IsOptional()
  @IsString()
  dispatchReference?: string;

  @IsOptional()
  status?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSampleItemDto)
  items?: CreateSampleItemDto[];

  @IsOptional()
  products?: any[];

  @IsOptional()
  sampleItems?: any[];

  @IsOptional()
  transportationCost?: any;

  @IsOptional()
  transportCost?: any;

  @IsOptional()
  leadName?: string;

  @IsOptional()
  customer?: string;

  @IsOptional()
  product?: string;

  @IsOptional()
  productName?: string;

  @IsOptional()
  quantity?: any;
}
