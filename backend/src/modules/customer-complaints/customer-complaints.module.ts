import { Module } from '@nestjs/common';
import { CustomerComplaintsController } from './customer-complaints.controller';
import { CustomerComplaintsService } from './customer-complaints.service';

@Module({
  controllers: [CustomerComplaintsController],
  providers: [CustomerComplaintsService]
})
export class CustomerComplaintsModule {}
