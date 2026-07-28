import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { CrmInsightsController } from './crm-insights.controller';
import { CrmInsightsService } from './crm-insights.service';

@Module({
  imports: [WorkflowModule],
  controllers: [LeadsController, CrmInsightsController],
  providers: [LeadsService, CrmInsightsService]
})
export class CrmModule {}
