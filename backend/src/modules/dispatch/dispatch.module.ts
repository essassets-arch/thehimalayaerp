import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [WorkflowModule, FinanceModule],
  controllers: [DispatchController],
  providers: [DispatchService],
})
export class DispatchModule {}
