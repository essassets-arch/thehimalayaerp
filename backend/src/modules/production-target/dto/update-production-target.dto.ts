import { IsEnum, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { ProductionTargetStatus, TargetPeriod } from '@prisma/client';

export class UpdateProductionTargetDto {
  @IsEnum(TargetPeriod)
  @IsOptional()
  targetPeriod?: TargetPeriod;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

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

  @IsString()
  @IsOptional()
  plantId?: string;
}

