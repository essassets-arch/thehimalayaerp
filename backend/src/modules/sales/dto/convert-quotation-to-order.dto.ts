import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class ConvertQuotationToOrderDto {
  @IsUUID()
  quotationId: string;

  @IsString()
  @IsOptional()
  customerPurchaseOrderNo?: string;

  @IsDateString()
  @IsOptional()
  customerPurchaseOrderDate?: string;

  @IsString()
  @IsOptional()
  customerPurchaseOrderFileUrl?: string;

  @IsDateString()
  @IsOptional()
  requestedDeliveryDate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
