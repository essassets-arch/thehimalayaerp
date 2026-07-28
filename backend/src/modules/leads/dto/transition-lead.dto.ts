import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';
import { LeadQualificationStatus } from '@prisma/client';

export class TransitionLeadDto {
  @IsInt()
  expectedVersion: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsEnum(LeadQualificationStatus)
  qualificationStatus?: LeadQualificationStatus;
}
