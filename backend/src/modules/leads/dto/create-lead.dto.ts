import { IsString, IsOptional, IsEmail, IsNumber, Min, IsEnum } from 'class-validator';
import { LeadSource } from '@prisma/client';

export class CreateLeadDto {
  @IsString()
  companyName: string;

  @IsString()
  contactPerson: string;

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
}
