import { IsEnum, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { ProductionTargetStatus } from '@prisma/client';

export class UpdateProductionTargetDto {
  @IsEnum(ProductionTargetStatus)
  @IsOptional()
  status?: ProductionTargetStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantityTarget?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
