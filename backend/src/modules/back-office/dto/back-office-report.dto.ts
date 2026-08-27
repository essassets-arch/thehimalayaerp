import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBackOfficeReportDto {
  @IsString()
  reportDate: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  tasksCompleted: string;

  @IsOptional()
  @IsString()
  issuesOrBlockers?: string;

  @IsOptional()
  @IsString()
  planForTomorrow?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(24)
  workingHours?: number;

  @IsOptional()
  @IsIn(['DRAFT', 'SUBMITTED'])
  status?: string;
}

export class UpdateBackOfficeReportDto {
  @IsOptional()
  @IsDateString()
  reportDate?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  tasksCompleted?: string;

  @IsOptional()
  @IsString()
  issuesOrBlockers?: string;

  @IsOptional()
  @IsString()
  planForTomorrow?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  workingHours?: number;

  @IsOptional()
  @IsIn(['DRAFT', 'SUBMITTED'])
  status?: string;
}

export class AcknowledgeBackOfficeReportDto {
  @IsOptional()
  @IsString()
  adminRemarks?: string;

  @IsOptional()
  @IsIn(['SUBMITTED', 'ACKNOWLEDGED'])
  status?: string;
}

export class QueryBackOfficeReportDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;

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
