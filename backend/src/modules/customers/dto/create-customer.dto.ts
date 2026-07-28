import {
  IsString,
  IsOptional,
  IsEmail,
  IsObject,
  IsNumber,
  Min,
  IsDecimal,
  Matches,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  companyName: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  @IsString()
  gstin?: string;

  @IsOptional()
  @IsString()
  pan?: string;

  @IsOptional()
  @IsObject()
  billingAddress?: Record<string, any>;

  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, any>;

  @IsOptional()
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTerms?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
