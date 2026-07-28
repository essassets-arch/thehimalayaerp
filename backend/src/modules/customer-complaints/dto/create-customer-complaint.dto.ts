import { IsString, IsEnum, IsUUID, IsOptional, IsObject } from 'class-validator';
import { CustomerComplaintType } from '@prisma/client';

export class CreateCustomerComplaintDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  salesOrderId: string;

  @IsUUID()
  @IsOptional()
  invoiceId?: string;

  @IsEnum(CustomerComplaintType)
  complaintType: CustomerComplaintType;

  @IsString()
  description: string;

  @IsObject()
  @IsOptional()
  evidence?: Record<string, any>;
}
