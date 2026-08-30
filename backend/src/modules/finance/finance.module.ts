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
import { PaymentFollowupEngineService } from './payment-followup-engine.service';
import { FinanceReportsController } from './finance-reports.controller';
import { FinanceReportsService } from './finance-reports.service';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  controllers: [
    InvoicesController,
    PaymentsController,
    LedgerController,
    FinanceSalesAnalyticsController,
    FinanceReportsController,
  ],
  providers: [
    InvoicesService,
    PaymentsService,
    PaymentFollowupEngineService,
    LedgerService,
    CreditService,
    FinanceSalesAnalyticsService,
    FinanceSalesAnalyticsMetricService,
    FinanceReportsService,
  ],
  exports: [
    LedgerService,
    CreditService,
    FinanceSalesAnalyticsService,
    PaymentFollowupEngineService,
    PaymentsService,
    FinanceReportsService,
  ],
})
export class FinanceModule {}
