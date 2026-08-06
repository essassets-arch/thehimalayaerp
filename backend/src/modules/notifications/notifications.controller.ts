import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Patch, Param, Req, Post, Body } from '@nestjs/common';
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

  @RequirePermissions('admin.notifications.create')
  @Post('broadcast')
  async broadcast(@Body() body: any, @Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.notificationsService.broadcast(body, companyId);
  }

  @RequirePermissions('admin.notifications.read')
  @Get('broadcast-history')
  async getBroadcastHistory(@Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    return this.notificationsService.getBroadcastHistory(companyId);
  }
}
