import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class ConfirmDeliveryDto {
  @IsNotEmpty()
  @IsString()
  receiverName: string;

  @IsOptional()
  @IsString()
  receiverPhone?: string;

  @IsOptional()
  @IsString()
  deliveredAt?: string;

  @IsOptional()
  @IsString()
  deliveryRemarks?: string;

  @IsNotEmpty()
  @IsString()
  podImageUrl: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsNumber()
  longitude?: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  version: number;
}
