import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { FinanceModule } from '../finance/finance.module';
import { InventoryModule } from '../inventory/inventory.module';
import { DispatchDailyReportService } from './dispatch-daily-report.service';
import {
  Dispatch1DailyReportController,
  Dispatch2DailyReportController,
} from './dispatch-daily-report.controller';

@Module({
  imports: [WorkflowModule, FinanceModule, InventoryModule],
  controllers: [
    DispatchController,
    Dispatch1DailyReportController,
    Dispatch2DailyReportController,
  ],
  providers: [DispatchService, DispatchDailyReportService],
})
export class DispatchModule {}
