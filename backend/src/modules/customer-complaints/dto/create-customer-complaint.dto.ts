import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CustomerComplaintItemDto {
  @IsOptional()
  @IsString()
  orderItemId?: string;

  @IsString()
  productId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  orderedQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveredQuantity?: number;

  @IsNumber()
  @Min(0.001)
  complaintQuantity: number;
}

export class CreateCustomerComplaintDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  complaintType: string;

  @IsIn(['Low', 'Medium', 'High', 'Critical'])
  priority: string;

  @IsDateString()
  complaintDate: string;

  @IsString()
  @MaxLength(250)
  subject: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  salesRemarks?: string;

  @IsOptional()
  @IsString()
  attachment?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerComplaintItemDto)
  items?: CustomerComplaintItemDto[];
}

export class AdminRemarksDto {
  @IsOptional()
  @IsString()
  adminRemarks?: string;
}

export class RejectComplaintDto {
  @IsString()
  rejectionReason: string;

  @IsOptional()
  @IsString()
  adminRemarks?: string;
}
