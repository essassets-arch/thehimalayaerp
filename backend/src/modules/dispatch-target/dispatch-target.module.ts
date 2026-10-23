import { Module } from '@nestjs/common';
import { DispatchTargetService } from './dispatch-target.service';
import { DispatchTargetController } from './dispatch-target.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DispatchTargetController],
  providers: [DispatchTargetService],
  exports: [DispatchTargetService],
})
export class DispatchTargetModule {}
