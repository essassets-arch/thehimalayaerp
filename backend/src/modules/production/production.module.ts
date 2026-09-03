import { Module } from '@nestjs/common';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { ProductionTestingController } from './production-testing.controller';
import { ProductionTestingService } from './production-testing.service';
import { ProductionWorkflowController } from './production-workflow.controller';
import { ProductionWorkflowService } from './production-workflow.service';
import { MachineController } from './machine.controller';
import { MachineService } from './machine.service';
import { MachineStatusController } from './machine-status.controller';
import { MachineStatusService } from './machine-status.service';
import { ProductionDailyReportController } from './production-daily-report.controller';
import { ProductionDailyReportService } from './production-daily-report.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { SequenceModule } from '../../common/sequence/sequence.module';
import { FinishedGoodsStockService } from './finished-goods-stock.service';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [WorkflowModule, SequenceModule, InventoryModule, NotificationsModule],
  controllers: [
    ProductionController,
    ProductionTestingController,
    ProductionWorkflowController,
    MachineController,
    MachineStatusController,
    ProductionDailyReportController,
  ],
  providers: [
    ProductionService,
    ProductionTestingService,
    ProductionWorkflowService,
    MachineService,
    MachineStatusService,
    ProductionDailyReportService,
    FinishedGoodsStockService,
  ],
  exports: [FinishedGoodsStockService],
})
export class ProductionModule {}
