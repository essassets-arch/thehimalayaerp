import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { CreditService } from './credit.service';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  controllers: [InvoicesController, PaymentsController, LedgerController],
  providers: [InvoicesService, PaymentsService, LedgerService, CreditService],
  exports: [LedgerService, CreditService],
})
export class FinanceModule {}
