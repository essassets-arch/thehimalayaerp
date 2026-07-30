import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { BrandAnalysisRecommendation } from '@prisma/client';

export class CreateBrandAnalysisDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  brandName: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  quantityUnit: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  imageOriginalName?: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  orderDetails?: string;

  @IsString()
  @IsOptional()
  requiredByDate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class ApproveBrandAnalysisDto {
  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  version: number;
}

export class RejectBrandAnalysisDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  version: number;
}

export class StartBrandAnalysisDto {
  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  version: number;
}

export class CompleteBrandAnalysisDto {
  @IsString()
  @IsNotEmpty()
  analysisResult: string;

  @IsString()
  @IsNotEmpty()
  recommendedBrand: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedUnitCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedTotalCost?: number;

  @IsString()
  @IsOptional()
  supplierName?: string;

  @IsString()
  @IsOptional()
  financeRemarks?: string;

  @IsEnum(BrandAnalysisRecommendation)
  recommendation: BrandAnalysisRecommendation;

  @IsString()
  @IsOptional()
  analysisDocumentUrl?: string;

  @IsNumber()
  version: number;
}
