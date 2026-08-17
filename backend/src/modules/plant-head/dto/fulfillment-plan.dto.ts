import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FulfillmentPlanItemDto {
  @IsUUID()
  salesOrderItemId: string;

  @IsNumber()
  @Min(0)
  directDispatchQty: number;

  @IsNumber()
  @Min(0)
  productionQty: number;

  @IsString()
  @IsOptional()
  targetDate?: string;

  @IsString()
  @IsOptional()
  priority?: string;
}

export class SubmitFulfillmentPlanDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FulfillmentPlanItemDto)
  items: FulfillmentPlanItemDto[];
}
