import { Module } from '@nestjs/common';
import { BackOfficeService } from './back-office.service';
import { BackOfficeController } from './back-office.controller';
import { PrismaModule } from '../../database/prisma.module';
import { SequenceModule } from '../../common/sequence/sequence.module';

@Module({
  imports: [PrismaModule, SequenceModule],
  controllers: [BackOfficeController],
  providers: [BackOfficeService],
  exports: [BackOfficeService],
})
export class BackOfficeModule {}
