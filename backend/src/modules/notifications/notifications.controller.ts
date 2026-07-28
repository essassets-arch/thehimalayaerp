import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread')
  async getUnread(@Req() req: any) {
    // Hardcode user ID for prototype since we don't have JWT guards yet
    const userId = 'USR-001'; 
    return this.notificationsService.getUnread(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = 'USR-001';
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = 'USR-001';
    return this.notificationsService.markAllAsRead(userId);
  }
}
