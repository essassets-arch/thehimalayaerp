import { IsString, IsNumber, Min, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryTransactionDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  warehouseId?: string;

  @IsString()
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
