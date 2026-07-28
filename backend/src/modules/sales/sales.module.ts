import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SequenceModule } from '../../common/sequence/sequence.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [SequenceModule, WorkflowModule, FinanceModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
