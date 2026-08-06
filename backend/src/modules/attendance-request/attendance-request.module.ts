import { Module } from '@nestjs/common';
import { AttendanceRequestController } from './attendance-request.controller';
import { AttendanceRequestService } from './attendance-request.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceRequestController],
  providers: [AttendanceRequestService],
  exports: [AttendanceRequestService],
})
export class AttendanceRequestModule {}
