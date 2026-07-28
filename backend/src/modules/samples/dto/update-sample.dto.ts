import { PartialType } from '@nestjs/mapped-types';
import { CreateSampleDto } from './create-sample.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSampleDto extends PartialType(CreateSampleDto) {
  @IsNumber()
  expectedVersion: number;

  @IsOptional()
  @IsString()
  customerFeedback?: string;

  @IsOptional()
  @IsString()
  sampleResult?: string;
}
