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
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  product_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @IsString()
  @IsOptional()
  product_code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  product_family?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  unit_of_measure?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  unitPrice?: number;

  @IsString()
  @IsOptional()
  productType?: string;

  @IsString()
  @IsOptional()
  product_type?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  dispatchCategory?: string;

  @IsString()
  @IsOptional()
  dispatch_category?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  gstRate?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  gst_rate?: number;

  @IsString()
  @IsOptional()
  hsnCode?: string;

  @IsString()
  @IsOptional()
  hsn_sac_code?: string;

  @IsString()
  @IsOptional()
  variantDetails?: string;

  @IsString()
  @IsOptional()
  variant_details?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minimumStock?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  reorderQuantity?: number;

  @IsString()
  @IsOptional()
  reorderUnit?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  leadTimeDays?: number;

  @IsString()
  @IsOptional()
  preferredVendorId?: string;

  @IsBoolean()
  @IsOptional()
  isAutoReorderEnabled?: boolean;

  @IsString()
  @IsOptional()
  storageLocation?: string;

  @IsString()
  @IsOptional()
  storage_location?: string;
}
