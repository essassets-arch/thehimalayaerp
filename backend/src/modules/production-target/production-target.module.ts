import { Module } from '@nestjs/common';
import { ProductionTargetController } from './production-target.controller';
import { ProductionTargetService } from './production-target.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductionTargetController],
  providers: [ProductionTargetService],
  exports: [ProductionTargetService],
})
export class ProductionTargetModule {}
