import { Module } from '@nestjs/common';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ComplaintsController],
  providers: [ComplaintsService, PrismaService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
