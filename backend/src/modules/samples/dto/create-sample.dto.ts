import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { SampleStatus } from '@prisma/client';

export class CreateSampleItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  specifications?: string;
}

export class CreateSampleDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsDateString()
  testingDeadline?: string;

  @IsOptional()
  @IsDateString()
  returnDeadline?: string;

  @IsOptional()
  @IsString()
  dispatchReference?: string;

  @IsOptional()
  @IsEnum(SampleStatus)
  status?: SampleStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSampleItemDto)
  items: CreateSampleItemDto[];
}
