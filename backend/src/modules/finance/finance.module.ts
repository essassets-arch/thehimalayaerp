import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { CreditService } from './credit.service';
import { FinanceSalesAnalyticsController } from './finance-sales-analytics.controller';
import { FinanceSalesAnalyticsService } from './finance-sales-analytics.service';
import { FinanceSalesAnalyticsMetricService } from './finance-sales-analytics-metric.service';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  controllers: [
    InvoicesController,
    PaymentsController,
    LedgerController,
    FinanceSalesAnalyticsController,
  ],
  providers: [
    InvoicesService,
    PaymentsService,
    LedgerService,
    CreditService,
    FinanceSalesAnalyticsService,
    FinanceSalesAnalyticsMetricService,
  ],
  exports: [LedgerService, CreditService, FinanceSalesAnalyticsService],
})
export class FinanceModule {}

