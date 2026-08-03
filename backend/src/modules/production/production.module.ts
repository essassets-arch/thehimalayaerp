import { Module } from '@nestjs/common';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { ProductionTestingController } from './production-testing.controller';
import { ProductionTestingService } from './production-testing.service';
import { ProductionWorkflowController } from './production-workflow.controller';
import { ProductionWorkflowService } from './production-workflow.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { SequenceModule } from '../../common/sequence/sequence.module';

@Module({
  imports: [WorkflowModule, SequenceModule],
  controllers: [
    ProductionController,
    ProductionTestingController,
    ProductionWorkflowController,
  ],
  providers: [
    ProductionService,
    ProductionTestingService,
    ProductionWorkflowService,
  ],
})
export class ProductionModule {}
