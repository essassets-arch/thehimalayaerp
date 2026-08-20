import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDispatchDailyReportItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  customProductName?: string;

  @IsOptional()
  @IsNumber()
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
  @IsNumber()
  coverQty?: number;

  @IsOptional()
  @IsNumber()
  coverUnitWeight?: number;

  @IsOptional()
  @IsNumber()
  actualCoverWeight?: number;

  @IsOptional()
  @IsNumber()
  frameQty?: number;

  @IsOptional()
  @IsNumber()
  frameUnitWeight?: number;

  @IsOptional()
  @IsNumber()
  actualFrameWeight?: number;

  @IsOptional()
  @IsString()
  weightOverrideReason?: string;

  @IsOptional()
  @IsNumber()
  setQty?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
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
