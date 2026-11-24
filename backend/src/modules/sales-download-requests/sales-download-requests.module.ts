import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SalesDownloadRequestsController } from './sales-download-requests.controller';
import { SalesDownloadRequestsService } from './sales-download-requests.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SalesDownloadRequestsController],
  providers: [SalesDownloadRequestsService],
  exports: [SalesDownloadRequestsService],
})
export class SalesDownloadRequestsModule {}
