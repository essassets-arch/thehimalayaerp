import { Module, Global } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { FirebasePushService } from './firebase-push.service';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebasePushService],
  exports: [NotificationsService, FirebasePushService],
})
export class NotificationsModule {}
