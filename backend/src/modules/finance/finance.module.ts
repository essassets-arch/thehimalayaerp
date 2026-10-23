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
import { FinanceReadyForDispatchController } from './finance-ready-for-dispatch.controller';
import { FinanceReadyForDispatchService } from './finance-ready-for-dispatch.service';
import {
  FinanceExpensesController,
  FinanceExpenseCategoriesController,
} from './finance-expenses.controller';
import { FinanceExpensesService } from './finance-expenses.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [WorkflowModule, FilesModule],
  controllers: [
    InvoicesController,
    PaymentsController,
    LedgerController,
    FinanceSalesAnalyticsController,
    FinanceReportsController,
    FinanceReadyForDispatchController,
    FinanceExpensesController,
    FinanceExpenseCategoriesController,
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
    FinanceReadyForDispatchService,
    FinanceExpensesService,
  ],
  exports: [
    LedgerService,
    CreditService,
    FinanceSalesAnalyticsService,
    PaymentFollowupEngineService,
    PaymentsService,
    FinanceReportsService,
    FinanceReadyForDispatchService,
    FinanceExpensesService,
  ],
})
export class FinanceModule {}
