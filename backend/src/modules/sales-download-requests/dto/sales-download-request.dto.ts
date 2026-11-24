import { IsInt, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDownloadRequestDto {
  @IsString()
  @MaxLength(64)
  module: string; // LEADS_CSV | ORDERS_CSV | REPORTS_CSV | REPORTS_PDF

  @IsString()
  @MaxLength(64)
  exportType: string; // summary | item_level | leads | quotations | orders | followups | customers | sales_summary | pdf

  @IsString()
  @MaxLength(16)
  format: string; // CSV | PDF

  @IsString()
  @MaxLength(200)
  resourceLabel: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  recordCount?: number;

  @IsOptional()
  @IsObject()
  filtersSnapshot?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ReviewDownloadRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class ConsumeDownloadRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string;
}
