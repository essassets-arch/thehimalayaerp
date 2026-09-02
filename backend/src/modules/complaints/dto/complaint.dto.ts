import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EmployeeComplaintPriority, EmployeeComplaintStatus } from '@prisma/client';

export class CreateComplaintDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  category: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  subject: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  priority?: string;
}

export class UpdateComplaintStatusDto {
  @IsNotEmpty()
  @IsEnum(EmployeeComplaintStatus)
  status: EmployeeComplaintStatus;

  @IsOptional()
  @IsString()
  hrRemarks?: string;
}

export class ComplaintQueryDto {
  @IsOptional()
  @IsEnum(EmployeeComplaintStatus)
  status?: EmployeeComplaintStatus;

  @IsOptional()
  @IsEnum(EmployeeComplaintPriority)
  priority?: EmployeeComplaintPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;
}
