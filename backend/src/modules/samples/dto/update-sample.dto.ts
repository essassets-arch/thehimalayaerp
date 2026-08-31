import { PartialType } from '@nestjs/mapped-types';
import { CreateSampleDto } from './create-sample.dto';
import { IsOptional } from 'class-validator';

export class UpdateSampleDto extends PartialType(CreateSampleDto) {
  @IsOptional()
  expectedVersion?: number;

  @IsOptional()
  customerFeedback?: string;

  @IsOptional()
  sampleResult?: string;

  @IsOptional()
  deliveryState?: string;

  @IsOptional()
  deliveredAt?: any;

  @IsOptional()
  proofOfDelivery?: any;

  @IsOptional()
  dispatchDetails?: any;

  @IsOptional()
  retrievalStatus?: string;

  @IsOptional()
  returnRequestedDate?: any;

  @IsOptional()
  returnedAt?: any;

  @IsOptional()
  dispatchDate?: any;
}
