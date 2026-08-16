import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FirebasePushService } from './firebase-push.service';

export interface CreateNotificationDto {
  companyId: string;
  userId: string;
  type?: string;
  title: string;
  message: string;
  route?: string;
  entityType?: string;
  entityId?: string;
  eventKey?: string;
}

export interface NotifyRoleDto {
  companyId: string;
  role?: string;
  roles?: string[];
  type?: string;
  title: string;
  message: string;
  route?: string;
  entityType?: string;
  entityId?: string;
  eventKeyPrefix?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebasePushService: FirebasePushService,
  ) {}

  /**
   * Primary method to notify a single specific user.
   * Creates PostgreSQL Notification record first (Source of Truth),
   * then attempts asynchronous FCM push post-commit.
   */
  async notifyUser(dto: CreateNotificationDto): Promise<any> {
    const {
      companyId,
      userId,
      type = 'GENERAL',
      title,
      message,
      route,
      entityType,
      entityId,
      eventKey,
    } = dto;

    if (eventKey) {
      const existing = await this.prisma.notification.findUnique({
        where: { eventKey },
      });
      if (existing) {
        this.logger.log(`Notification with eventKey "${eventKey}" already exists. Skipping duplicate creation.`);
        return existing;
      }
    }

    const notification = await this.prisma.notification.create({
      data: {
        companyId,
        userId,
        type,
        title,
        message,
        route,
        entityType,
        entityId,
        eventKey,
        isRead: false,
        status: 'UNREAD',
      },
    });

    setImmediate(async () => {
      try {
        await this.firebasePushService.sendPushToUser(
          userId,
          companyId,
          title,
          message,
          {
            notificationId: notification.id,
            type,
            route: route || '',
            entityType: entityType || '',
            entityId: entityId || '',
          },
        );
      } catch (err: any) {
        this.logger.error(`Async FCM dispatch failed for notification ${notification.id}: ${err?.message || err}`);
      }
    });

    return notification;
  }

  /**
   * Primary method to notify all active users matching target role(s) within a specific company.
   */
  async notifyRole(dto: NotifyRoleDto): Promise<any[]> {
    const {
      companyId,
      role,
      roles,
      type = 'GENERAL',
      title,
      message,
      route,
      entityType,
      entityId,
      eventKeyPrefix,
    } = dto;

    const targetRoles = roles || (role ? [role] : []);
    if (targetRoles.length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        companyId,
        isActive: true,
        role: {
          code: { in: targetRoles },
        },
      },
      select: { id: true },
    });

    if (users.length === 0) {
      return [];
    }

    const createdNotifications: any[] = [];
    for (const u of users) {
      const eventKey = eventKeyPrefix ? `${eventKeyPrefix}:${u.id}` : undefined;
      const notif = await this.notifyUser({
        companyId,
        userId: u.id,
        type,
        title,
        message,
        route,
        entityType,
        entityId,
        eventKey,
      });
      createdNotifications.push(notif);
    }

    return createdNotifications;
  }

  private async resolveCompanyId(userId: string, companyId?: string): Promise<string> {
    if (companyId) return companyId;
    if (!userId) return '';
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    return user?.companyId || '';
  }

  async getNotifications(userId: string, companyId?: string, limit = 20, offset = 0) {
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          userId,
          companyId: resolvedCompanyId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.getUnreadCount(userId, resolvedCompanyId),
    ]);

    return {
      items,
      unreadCount,
    };
  }

  async getUnreadCount(userId: string, companyId?: string): Promise<number> {
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    return this.prisma.notification.count({
      where: {
        userId,
        companyId: resolvedCompanyId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string, companyId?: string) {
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    const result = await this.prisma.notification.updateMany({
      where: {
        id,
        userId,
        companyId: resolvedCompanyId,
      },
      data: {
        isRead: true,
        status: 'READ',
        readAt: new Date(),
      },
    });
    if (result.count === 0) {
      throw new NotFoundException('Notification not found or access denied');
    }
    return result;
  }

  async markAllAsRead(userId: string, companyId?: string) {
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    return this.prisma.notification.updateMany({
      where: {
        userId,
        companyId: resolvedCompanyId,
        isRead: false,
      },
      data: {
        isRead: true,
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  async registerDeviceToken(
    userId: string,
    companyId: string | undefined,
    token: string,
    deviceType = 'web',
    userAgent?: string,
  ) {
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    return this.prisma.fcmDeviceToken.upsert({
      where: { token },
      create: {
        companyId: resolvedCompanyId,
        userId,
        token,
        deviceType,
        userAgent,
        lastSeenAt: new Date(),
      },
      update: {
        companyId: resolvedCompanyId,
        userId,
        deviceType,
        userAgent,
        lastSeenAt: new Date(),
      },
    });
  }

  async removeDeviceToken(userId: string, companyId: string | undefined, token: string) {
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    return this.prisma.fcmDeviceToken.deleteMany({
      where: {
        token,
        userId,
        companyId: resolvedCompanyId,
      },
    });
  }

  async broadcast(body: any, companyId: string) {
    const { roleCodes, title, message, route } = body;
    const targetRoles = Array.isArray(roleCodes) ? roleCodes : [roleCodes];

    const users = await this.prisma.user.findMany({
      where: {
        companyId,
        isActive: true,
        ...(targetRoles.includes('ALL')
          ? {}
          : {
              role: {
                code: { in: targetRoles },
              },
            }),
      },
      select: { id: true },
    });

    if (users.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No users found matching selected roles.',
      };
    }

    for (const u of users) {
      await this.notifyUser({
        companyId,
        userId: u.id,
        type: 'BROADCAST',
        title: title || 'System Announcement',
        message: message || '',
        route,
      });
    }

    return {
      success: true,
      count: users.length,
      message: `Successfully broadcasted notification to ${users.length} user(s).`,
    };
  }

  async getBroadcastHistory(companyId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    const userIds = Array.from(new Set(notifications.map((n) => n.userId)));
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      include: {
        role: true,
      },
    });

    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(u.id, {
        name: u.name,
        email: u.email,
        roleName: u.role?.name || 'User',
      });
    }

    return notifications.map((notif) => {
      const u = userMap.get(notif.userId);
      return {
        ...notif,
        recipientName: u?.name || 'Unknown Recipient',
        recipientEmail: u?.email || 'N/A',
        recipientRole: u?.roleName || 'N/A',
      };
    });
  }

  async sendTestPushToUser(userId: string, companyId: string) {
    const tokens = await this.prisma.fcmDeviceToken.findMany({
      where: { userId, companyId }
    });

    if (tokens.length === 0) {
      return { success: false, message: 'No registered FCM device tokens found for this user.' };
    }

    const payload = {
      title: 'FCM Verification 🚀',
      message: 'Dual-channel push notifications are fully configured and functional!',
      route: '/plant-head/incoming-orders',
      type: 'TEST'
    };

    try {
      await this.firebasePushService.sendPushToUser(userId, companyId, payload.title, payload.message, {
        route: payload.route,
        type: payload.type
      });
      return { success: true, message: 'Test push notification triggered successfully.', tokensCount: tokens.length };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
