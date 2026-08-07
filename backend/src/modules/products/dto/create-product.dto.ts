import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @IsString()
  @IsOptional()
  productType?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  dispatchCategory?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  gstRate?: number;

  @IsString()
  @IsOptional()
  hsnCode?: string;

  @IsString()
  @IsOptional()
  variantDetails?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
