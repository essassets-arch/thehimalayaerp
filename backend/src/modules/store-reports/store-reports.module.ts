import { Module } from '@nestjs/common';
import { StoreReportsController } from './store-reports.controller';
import { StoreReportsService } from './store-reports.service';

@Module({
  controllers: [StoreReportsController],
  providers: [StoreReportsService]
})
export class StoreReportsModule {}
