import { Module } from '@nestjs/common';
import { PlantHeadController } from './plant-head.controller';
import { PlantHeadService } from './plant-head.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlantHeadController],
  providers: [PlantHeadService],
  exports: [PlantHeadService],
})
export class PlantHeadModule {}
