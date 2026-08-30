import {
  UseGuards,
  Controller,
  Get,
  Patch,
  Param,
  Req,
  Post,
  Body,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get paginated notifications for current authenticated user.
   */
  @Get()
  async getNotifications(
    @Req() req: any,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const userId = req.user?.sub;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    return this.notificationsService.getNotifications(
      userId,
      companyId,
      limit,
      offset,
    );
  }

  /**
   * Get accurate unread count for current authenticated user.
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    const unreadCount = await this.notificationsService.getUnreadCount(
      userId,
      companyId,
    );
    return { unreadCount };
  }

  /**
   * Legacy endpoint backward compatibility.
   */
  @Get('unread')
  async getUnreadLegacy(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    const result = await this.notificationsService.getNotifications(
      userId,
      companyId,
      20,
      0,
    );
    return result.items.filter((item) => !item.isRead);
  }

  /**
   * Mark a single notification as read.
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    await this.notificationsService.markAsRead(id, userId, companyId);
    return { success: true };
  }

  /**
   * Mark all unread notifications as read.
   */
  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    await this.notificationsService.markAllAsRead(userId, companyId);
    return { success: true };
  }

  /**
   * Register FCM Device Token for current authenticated user.
   */
  @Post('device-token')
  async registerDeviceToken(
    @Body() body: { token: string; deviceType?: string; userAgent?: string },
    @Req() req: any,
  ) {
    if (!body?.token) {
      throw new BadRequestException('FCM token is required');
    }
    const userId = req.user?.sub;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    const deviceToken = await this.notificationsService.registerDeviceToken(
      userId,
      companyId,
      body.token,
      body.deviceType || 'web',
      body.userAgent,
    );
    return { success: true, deviceToken };
  }

  /**
   * Remove FCM Device Token on user logout.
   */
  @Delete('device-token')
  async removeDeviceToken(@Body() body: { token: string }, @Req() req: any) {
    if (!body?.token) {
      throw new BadRequestException('FCM token is required');
    }
    const userId = req.user?.sub;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    await this.notificationsService.removeDeviceToken(
      userId,
      companyId,
      body.token,
    );
    return { success: true };
  }

  /**
   * Super Admin broadcast endpoint.
   */
  @RequirePermissions('admin.notifications.create')
  @Post('broadcast')
  async broadcast(@Body() body: any, @Req() req: any) {
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    return this.notificationsService.broadcast(body, companyId);
  }

  /**
   * Broadcast history.
   */
  @RequirePermissions('admin.notifications.read')
  @Get('broadcast-history')
  async getBroadcastHistory(@Req() req: any) {
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    return this.notificationsService.getBroadcastHistory(companyId);
  }

  /**
   * Health check and push notifications diagnostic info.
   */
  @Get('push-status')
  async getPushStatus(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    return this.notificationsService.getPushStatus(userId, companyId);
  }

  /**
   * Test push notifications for current logged in user.
   */
  @Post('test-push')
  async testPush(@Req() req: any) {
    const userId = req.user?.sub;
    const companyId = req.user?.companyId || req.headers['x-company-id'];
    return this.notificationsService.sendTestPushToUser(userId, companyId);
  }
}
