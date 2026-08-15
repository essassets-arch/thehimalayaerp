import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  BankAccountType,
  EmployeeStatus,
  EmploymentType,
  Gender,
} from '@prisma/client';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CreateEmployeeDto {
  @IsString() @IsNotEmpty() employeeCode!: string;
  @IsString() @IsNotEmpty() firstName!: string;
  @IsString() @IsNotEmpty() lastName!: string;
  @IsDateString() dateOfBirth!: string;
  @IsEnum(Gender) gender!: Gender;
  @IsString() @IsNotEmpty() jobTitle!: string;
  @IsString() @IsNotEmpty() departmentId!: string;
  @IsOptional() @IsString() reportingManagerId?: string;
  @IsString() @IsNotEmpty() workLocationId!: string;
  @IsEnum(EmploymentType) employmentType!: EmploymentType;
  @IsDateString() joiningDate!: string;
  @IsOptional() @IsDateString() probationEndDate?: string;
  @IsEmail() workEmail!: string;
  @IsOptional() @IsEmail() personalEmail?: string;
  @IsString() @IsNotEmpty() phoneNumber!: string;
  @IsString() @IsNotEmpty() residentialAddress!: string;
  @IsString() @IsNotEmpty() emergencyContactName!: string;
  @IsString() @IsNotEmpty() emergencyContactPhone!: string;
  @IsString() @IsNotEmpty() emergencyRelationship!: string;
  @Transform(upper) @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/) panNumber!: string;
  @Matches(/^\d{12}$/) aadhaarNumber!: string;
  @IsOptional() @Matches(/^\d{12}$/) uanNumber?: string;
  @IsOptional() @IsString() esicNumber?: string;
  @IsString() @IsNotEmpty() bankName!: string;
  @IsString() @IsNotEmpty() accountHolderName!: string;
  @IsEnum(BankAccountType) bankAccountType!: BankAccountType;
  @Matches(/^\d{6,20}$/) bankAccountNumber!: string;
  @ValidateIf((o) => o.confirmAccountNumber !== undefined)
  @IsString()
  confirmAccountNumber?: string;
  @Transform(upper) @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/) ifscCode!: string;
  @IsOptional() @IsString() branchName?: string;
  @IsOptional() @IsString() draftId?: string;
}

export class EmployeeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = undefined;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = undefined;

  @IsOptional()
  @IsString()
  search?: string = undefined;

  @IsOptional()
  @IsString()
  departmentId?: string = undefined;

  @IsOptional()
  @IsString()
  locationId?: string = undefined;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType = undefined;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus = undefined;

  @IsOptional()
  @IsString()
  reportingManagerId?: string = undefined;

  @IsOptional()
  @IsDateString()
  joiningDateFrom?: string = undefined;

  @IsOptional()
  @IsDateString()
  joiningDateTo?: string = undefined;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @Matches(/^(asc|desc)$/i)
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class UpdateEmployeeDto {
  @IsInt() @Min(1) version!: number;
}
