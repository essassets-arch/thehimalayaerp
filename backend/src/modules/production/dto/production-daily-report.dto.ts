import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDailyReportItemDto {
  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  productId?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  customProductName?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsInt()
  srNo?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  size?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  type?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  capacity?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsInt()
  @Min(0)
  coverQty?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  @Min(0)
  coverUnitWeight?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  @Min(0)
  actualCoverWeight?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsInt()
  @Min(0)
  frameQty?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  @Min(0)
  frameUnitWeight?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  @Min(0)
  actualFrameWeight?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  weightOverrideReason?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsInt()
  @Min(0)
  setQty?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  workOrderId?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  productionPlanId?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  salesOrderId?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  remarks?: string | null;
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
