import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { TargetPeriod } from '@prisma/client';

export class CreateDispatchTargetDto {
  @IsEnum(TargetPeriod)
  @IsNotEmpty()
  targetPeriod: TargetPeriod;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantityTarget: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  depot?: string;
}
