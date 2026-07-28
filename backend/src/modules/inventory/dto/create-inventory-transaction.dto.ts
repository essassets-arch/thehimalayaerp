import { IsString, IsNumber, Min, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryTransactionDto {
  @IsString()
  productId: string;

  @IsString()
  warehouseId: string;

  @IsString()
  @IsIn(['IN', 'OUT', 'ADJUSTMENT'])
  type: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity: number;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;
}
