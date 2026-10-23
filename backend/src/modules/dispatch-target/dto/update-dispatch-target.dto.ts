import { IsEnum, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { DispatchTargetStatus, TargetPeriod } from '@prisma/client';

export class UpdateDispatchTargetDto {
  @IsEnum(TargetPeriod)
  @IsOptional()
  targetPeriod?: TargetPeriod;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsEnum(DispatchTargetStatus)
  @IsOptional()
  status?: DispatchTargetStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantityTarget?: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  depot?: string;
}
