import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { CrmInsightsController } from './crm-insights.controller';
import { CrmInsightsService } from './crm-insights.service';
import { SalesRemindersController } from './sales-reminders.controller';

@Module({
  imports: [WorkflowModule],
  controllers: [
    LeadsController,
    CrmInsightsController,
    SalesRemindersController,
  ],
  providers: [LeadsService, CrmInsightsService],
})
export class CrmModule {}
