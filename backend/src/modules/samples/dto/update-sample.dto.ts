import { PartialType } from '@nestjs/mapped-types';
import { CreateSampleDto } from './create-sample.dto';
import { IsNumber, IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateSampleDto extends PartialType(CreateSampleDto) {
  @IsOptional()
  @IsNumber()
  expectedVersion?: number;

  @IsOptional()
  @IsString()
  customerFeedback?: string;

  @IsOptional()
  @IsString()
  sampleResult?: string;

  @IsOptional()
  @IsString()
  deliveryState?: string;

  @IsOptional()
  @IsString()
  proofOfDelivery?: string;

  @IsOptional()
  @IsObject()
  dispatchDetails?: {
    weight?: string;
    vehicleNo?: string;
    driverName?: string;
    driverPhone?: string;
    remarks?: string;
    transport?: string;
    lrNo?: string;
    dispatchDate?: string;
    cost?: string;
  };

  @IsOptional()
  @IsString()
  retrievalStatus?: string;

  @IsOptional()
  @IsString()
  returnRequestedDate?: string;
}
