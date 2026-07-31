import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesTargetDto } from './create-sales-target.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SalesTargetStatus } from '@prisma/client';

export class UpdateSalesTargetDto extends PartialType(CreateSalesTargetDto) {
  @IsEnum(SalesTargetStatus)
  @IsOptional()
  status?: SalesTargetStatus;
}
