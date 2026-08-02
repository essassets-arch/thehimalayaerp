import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReturnReasonCode, ReturnResolutionType } from '@prisma/client';

export class ReturnItemDto {
  @IsUUID()
  salesOrderItemId: string;

  @IsNumber()
  @Min(0.001)
  requestedQuantity: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  conditionReported?: string;

  @IsObject()
  @IsOptional()
  evidence?: Record<string, any>;
}

export class RequestSalesReturnDto {
  @IsUUID()
  salesOrderId: string;

  @IsUUID()
  @IsOptional()
  complaintId?: string;

  @IsEnum(ReturnReasonCode)
  reasonCode: ReturnReasonCode;

  @IsString()
  @IsOptional()
  customerRemarks?: string;

  @IsString()
  @IsOptional()
  internalRemarks?: string;

  @IsEnum(ReturnResolutionType)
  resolutionType: ReturnResolutionType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];
}
