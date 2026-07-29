import { IsString, IsEnum, IsUUID, IsOptional, IsObject, IsArray, ValidateNested, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ReplacementReasonCode } from '@prisma/client';

export class ReplacementItemDto {
  @IsUUID()
  salesOrderItemId: string;

  @IsNumber()
  @Min(0.001)
  requestedQuantity: number;

  @IsString()
  reason: string;
}

export class RequestReplacementDto {
  @IsUUID()
  salesOrderId: string;

  @IsUUID()
  @IsOptional()
  complaintId?: string;

  @IsUUID()
  @IsOptional()
  returnId?: string;

  @IsEnum(ReplacementReasonCode)
  reasonCode: ReplacementReasonCode;

  @IsString()
  @IsOptional()
  customerRemarks?: string;

  @IsString()
  @IsOptional()
  internalRemarks?: string;

  @IsObject()
  @IsOptional()
  evidence?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReplacementItemDto)
  items: ReplacementItemDto[];
}
