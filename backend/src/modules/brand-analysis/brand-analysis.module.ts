import { Module } from '@nestjs/common';
import { BrandAnalysisService } from './brand-analysis.service';
import { BrandAnalysisController } from './brand-analysis.controller';
import { BrandAnalysisUploadController } from './brand-analysis-upload.controller';

@Module({
  controllers: [BrandAnalysisController, BrandAnalysisUploadController],
  providers: [BrandAnalysisService],
})
export class BrandAnalysisModule {}
