import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @RequirePermissions('admin.notifications.read')
  @Get('unread')
  async getUnread(@Req() req: any) {
    const userId = req.user?.sub;
    return this.notificationsService.getUnread(userId);
  }

  @RequirePermissions('admin.notifications.update')
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.notificationsService.markAsRead(id, userId);
  }

  @RequirePermissions('admin.notifications.update')
  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.sub;
    return this.notificationsService.markAllAsRead(userId);
  }
}
