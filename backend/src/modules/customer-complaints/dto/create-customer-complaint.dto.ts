import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCustomerComplaintDto {
  @IsString() customerId: string;
  @IsString() productId: string;
  @IsString() complaintType: string;
  @IsIn(['Low', 'Medium', 'High', 'Critical']) priority: string;
  @IsDateString() complaintDate: string;
  @IsString() @MaxLength(250) subject: string;
  @IsString() description: string;
  @IsOptional() @IsString() salesRemarks?: string;
  @IsOptional() @IsString() attachment?: string;
  @IsOptional() @IsIn(['DRAFT', 'PENDING_SUPER_ADMIN']) status?:
    'DRAFT' | 'PENDING_SUPER_ADMIN';
}

export class AdminRemarksDto {
  @IsString() adminRemarks: string;
}
