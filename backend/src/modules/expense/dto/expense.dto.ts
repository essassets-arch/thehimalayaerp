import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseClaimStatus } from '@prisma/client';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  expenseName: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

export class ApproveExpenseDto {
  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class RejectExpenseDto {
  @IsNotEmpty()
  @IsString()
  remarks: string;
}

export class ExpenseQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;
}
