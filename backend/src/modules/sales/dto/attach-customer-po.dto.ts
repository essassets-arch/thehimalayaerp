import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class AttachCustomerPoDto {
  @IsString()
  customerPurchaseOrderNo: string;

  @IsDateString()
  customerPurchaseOrderDate: string;

  @IsString()
  @IsOptional()
  customerPurchaseOrderFileUrl?: string;

  @IsNumber()
  @Min(1)
  expectedVersion: number;
}
