import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDailyReportItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  customProductName?: string;

  @IsOptional()
  @IsInt()
  srNo?: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  capacity?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  coverQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coverUnitWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCoverWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  frameQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  frameUnitWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualFrameWeight?: number;

  @IsOptional()
  @IsString()
  weightOverrideReason?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  setQty?: number;

  @IsOptional()
  @IsString()
  workOrderId?: string;

  @IsOptional()
  @IsString()
  productionPlanId?: string;

  @IsOptional()
  @IsString()
  salesOrderId?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateDailyReportDto {
  @IsString()
  reportDate: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  supervisorName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDailyReportItemDto)
  items: CreateDailyReportItemDto[];
}

export class UpdateDailyReportDto {
  @IsOptional()
  @IsString()
  reportDate?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  supervisorName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDailyReportItemDto)
  items?: CreateDailyReportItemDto[];
}

export class QueryDailyReportDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  preset?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  capacity?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;
}
