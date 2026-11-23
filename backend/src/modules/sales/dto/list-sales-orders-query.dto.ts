import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export const MAX_SALES_ORDERS_PAGE_SIZE = 1000;

function clampOptionalInt(
  value: unknown,
  min: number,
  max: number,
): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return parsed;
  }
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

export class ListSalesOrdersQueryDto {
  @IsOptional()
  @Transform(({ value }) => clampOptionalInt(value, 1, 100000))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) =>
    clampOptionalInt(value, 1, MAX_SALES_ORDERS_PAGE_SIZE),
  )
  @IsInt()
  @Min(1)
  @Max(MAX_SALES_ORDERS_PAGE_SIZE)
  pageSize?: number;

  @IsOptional()
  @Transform(({ value }) =>
    clampOptionalInt(value, 1, MAX_SALES_ORDERS_PAGE_SIZE),
  )
  @IsInt()
  @Min(1)
  @Max(MAX_SALES_ORDERS_PAGE_SIZE)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  workflowStateId?: string;

  // Filter by SalesOrderStatus or comma-separated statuses
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  orderStatus?: string;

  @IsOptional()
  @IsString()
  productionStatus?: string;

  @IsOptional()
  @IsString()
  dispatchStatus?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  closureStatus?: string;

  @IsOptional()
  includeDeleted?: string | boolean;

  @IsOptional()
  _t?: string | number;

  @IsOptional()
  _?: string | number;
}
