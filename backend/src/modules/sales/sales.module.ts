import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SequenceModule } from '../../common/sequence/sequence.module';

@Module({
  imports: [SequenceModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
