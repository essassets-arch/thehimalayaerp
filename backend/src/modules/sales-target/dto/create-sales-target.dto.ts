import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { TargetPeriod } from '@prisma/client';

export class CreateSalesTargetDto {
  @IsString()
  @IsNotEmpty()
  salespersonId: string;

  @IsEnum(TargetPeriod)
  targetPeriod: TargetPeriod;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  revenueTarget: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
