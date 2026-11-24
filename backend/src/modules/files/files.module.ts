import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PrismaModule } from '../../database/prisma.module';
import { SalesDownloadRequestsModule } from '../sales-download-requests/sales-download-requests.module';

@Module({
  imports: [PrismaModule, SalesDownloadRequestsModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
