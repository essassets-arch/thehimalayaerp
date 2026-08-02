import { Module } from '@nestjs/common';
import { ProcurementController } from './procurement.controller';
import { ProcurementService } from './procurement.service';
import { ProcurementClosureService } from './procurement-closure.service';
import { POReportService } from './po-report.service';
import { MaterialRejectionService } from './material-rejection.service';

@Module({
  controllers: [ProcurementController],
  providers: [
    ProcurementService,
    ProcurementClosureService,
    POReportService,
    MaterialRejectionService,
  ],
})
export class ProcurementModule {}
