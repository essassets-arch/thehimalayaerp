import { Module } from '@nestjs/common';
import { CustomerComplaintsController } from './customer-complaints.controller';
import { CustomerComplaintsService } from './customer-complaints.service';
import { SequenceModule } from '../../common/sequence/sequence.module';

@Module({
  imports: [SequenceModule],
  controllers: [CustomerComplaintsController],
  providers: [CustomerComplaintsService],
  exports: [CustomerComplaintsService],
})
export class CustomerComplaintsModule {}
