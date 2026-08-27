import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDispatchDailyReportItemDto {
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
  @IsNumber()
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
  @IsNumber()
  coverQty?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  coverUnitWeight?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  actualCoverWeight?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  frameQty?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  frameUnitWeight?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  actualFrameWeight?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  weightOverrideReason?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  setQty?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  extraCoverQty?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsNumber()
  extraFrameQty?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  remarks?: string | null;
}

export class CreateDispatchDailyReportDto {
  @IsString()
  reportDate: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  dispatchExecutive?: string;

  @IsOptional()
  @IsString()
  dispatchType?: string;

  @IsOptional()
  @IsString()
  supervisorName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDispatchDailyReportItemDto)
  items: CreateDispatchDailyReportItemDto[];
}

export class UpdateDispatchDailyReportDto {
  @IsOptional()
  @IsString()
  reportDate?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  dispatchExecutive?: string;

  @IsOptional()
  @IsString()
  dispatchType?: string;

  @IsOptional()
  @IsString()
  supervisorName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDispatchDailyReportItemDto)
  items?: CreateDispatchDailyReportItemDto[];
}

export class QueryDispatchDailyReportDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsString()
  preset?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  capacity?: string;
}
