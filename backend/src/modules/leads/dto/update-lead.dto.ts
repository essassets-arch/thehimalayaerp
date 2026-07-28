import { IsString, IsOptional, IsEmail, IsNumber, Min, IsEnum, IsInt } from 'class-validator';
import { LeadSource } from '@prisma/client';

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsString()
  @IsOptional()
  productInterest?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedQuantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  assignedToId?: string;

  @IsInt()
  expectedVersion: number;
}
