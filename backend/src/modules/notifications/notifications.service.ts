import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationPriority } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { FirebasePushService } from './firebase-push.service';

export interface CreateNotificationDto {
  companyId: string;
  userId: string;
  type?: string;
  module?: string;
  priority?: NotificationPriority;
  title: string;
  message: string;
  route?: string;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  actorName?: string;
  eventKey?: string;
}

export interface NotifyRoleDto {
  companyId: string;
  role?: string;
  roles?: string[];
  type?: string;
  module?: string;
  priority?: NotificationPriority;
  title: string;
  message: string;
  route?: string;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  actorName?: string;
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
   * The canonical ERP event contract. Business modules supply an event code;
   * this service supplies a consistent module and urgency when a caller does
   * not explicitly override them. Keep all delivery concerns here.
   */
  private describeEvent(type?: string): { module: string; priority: NotificationPriority } {
    const event = String(type || 'GENERAL').toUpperCase();
    const moduleByPrefix: Array<[string, string]> = [
      ['LEAD_', 'SALES'], ['SAMPLE_', 'SALES'], ['QUOTATION_', 'SALES'], ['SALES_ORDER_', 'SALES'],
      ['FULFILLMENT_', 'PLANT_HEAD'], ['WORK_ORDER_', 'PRODUCTION'], ['PRODUCTION_', 'PRODUCTION'],
      ['QC_', 'QC'], ['REWORK_', 'PRODUCTION'], ['DISPATCH', 'DISPATCH'], ['VEHICLE_', 'DISPATCH'],
      ['PAYMENT_', 'FINANCE'], ['PO_', 'PROCUREMENT'], ['MATERIAL_', 'STORE'], ['INVENTORY_', 'STORE'],
      ['LEAVE_', 'HR'], ['ATTENDANCE_', 'HR'], ['PAYROLL_', 'HR'], ['RETURN_', 'DISPATCH'],
      ['REPLACEMENT_', 'DISPATCH'], ['BROADCAST', 'ADMIN'],
    ];
    const module = moduleByPrefix.find(([prefix]) => event.startsWith(prefix))?.[1] || 'SYSTEM';
    const critical = ['QC_FAILED', 'PAYMENT_OVERDUE', 'LOW_STOCK', 'PRODUCTION_BLOCKED', 'SYSTEM_ALERT'];
    const high = ['APPROVAL_REQUIRED', 'INSPECTION_REQUIRED', 'VERIFICATION_REQUIRED', 'DISPATCH_REQUIRED', 'PRODUCTION_REQUIRED', 'REJECTED'];
    return {
      module,
      priority: critical.some((part) => event.includes(part))
        ? NotificationPriority.CRITICAL
        : high.some((part) => event.includes(part))
          ? NotificationPriority.HIGH
          : NotificationPriority.MEDIUM,
    };
  }

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
      module,
      priority,
      title,
      message,
      route,
      entityType,
      entityId,
      actorUserId,
      actorName,
      eventKey,
    } = dto;
    const event = this.describeEvent(type);

    if (eventKey) {
      const existing = await this.prisma.notification.findUnique({
        where: { eventKey },
      });
      if (existing) {
        this.logger.log(`Notification with eventKey "${eventKey}" already exists. Skipping duplicate creation.`);
        return existing;
      }
    }

    // 1. Create PostgreSQL Notification first (Source of Truth)
    const notification = await this.prisma.notification.create({
      data: {
        companyId,
        userId,
        type,
        module: module || event.module,
        priority: priority || event.priority,
        title,
        message,
        route,
        entityType,
        entityId,
        actorUserId,
        actorName,
        eventKey,
        isRead: false,
        status: 'UNREAD',
        fcmStatus: 'PENDING',
      },
    });

    // 2. Attempt push notification delivery sequentially
    try {
      const deviceTokens = await this.prisma.fcmDeviceToken.findMany({
        where: { userId, companyId },
        select: { token: true },
      });

      if (deviceTokens.length === 0) {
        // Safe state: Bell = CREATED, Push = NOT_ATTEMPTED (NO_TOKENS)
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            fcmStatus: 'NO_TOKENS',
            fcmAttemptedAt: new Date(),
          },
        });
      } else {
        const response = await this.firebasePushService.sendPushToUser(
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

        if (response) {
          const successCount = response.successCount || 0;
          const failureCount = response.failureCount || 0;
          let fcmStatus = 'SENT';
          if (successCount > 0 && failureCount > 0) {
            fcmStatus = 'PARTIAL';
          } else if (successCount === 0 && failureCount > 0) {
            fcmStatus = 'FAILED';
          }

          const firstSuccess = response.responses?.find((r: any) => r.success);
          const fcmMessageId = firstSuccess?.messageId || null;

          await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
              fcmStatus,
              fcmMessageId,
              fcmSuccessCount: successCount,
              fcmFailureCount: failureCount,
              fcmAttemptedAt: new Date(),
            },
          });
        }
      }
    } catch (err: any) {
      this.logger.error(`Synchronous FCM dispatch failed for notification ${notification.id}: ${err?.message || err}`);
      try {
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            fcmStatus: 'FAILED',
            fcmError: err?.message || String(err),
            fcmAttemptedAt: new Date(),
            fcmFailureCount: 1,
          },
        });
      } catch (dbErr) {
        this.logger.error(`Failed to update FCM error status in database: ${dbErr}`);
      }
    }

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
      module,
      priority,
      title,
      message,
      route,
      entityType,
      entityId,
      actorUserId,
      actorName,
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
        module,
        priority,
        title,
        message,
        route,
        entityType,
        entityId,
        actorUserId,
        actorName,
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
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    const payload = {
      title: 'FCM Verification 🚀',
      message: 'Dual-channel push notifications are fully configured and functional!',
      route: '/plant-head/incoming-orders',
      type: 'TEST'
    };

    // 1. Create PostgreSQL Notification first (Source of Truth) so diagnostics has log
    const notification = await this.prisma.notification.create({
      data: {
        companyId: resolvedCompanyId,
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        route: payload.route,
        isRead: false,
        status: 'UNREAD',
        fcmStatus: 'PENDING',
      },
    });

    const tokens = await this.prisma.fcmDeviceToken.findMany({
      where: { userId, companyId: resolvedCompanyId },
    });

    // The bell notification is the source of truth and must be created even
    // when FCM is unavailable. This makes the test endpoint useful for
    // verifying the in-app path while clearly reporting a missing push target.
    if (tokens.length === 0) {
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          fcmStatus: 'NO_TOKENS',
          fcmAttemptedAt: new Date(),
        },
      });
      return {
        success: true,
        pushDelivered: false,
        message: 'Test bell notification created. No registered FCM device token was found.',
        notificationId: notification.id,
        tokensCount: 0,
      };
    }

    try {
      const fcmResult = await this.firebasePushService.sendPushToUser(userId, resolvedCompanyId, payload.title, payload.message, {
        notificationId: notification.id,
        type: payload.type,
        route: payload.route
      });

      if (fcmResult) {
        const successCount = fcmResult.successCount || 0;
        const failureCount = fcmResult.failureCount || 0;
        let fcmStatus = 'SENT';
        if (successCount > 0 && failureCount > 0) {
          fcmStatus = 'PARTIAL';
        } else if (successCount === 0 && failureCount > 0) {
          fcmStatus = 'FAILED';
        }

        const firstSuccess = fcmResult.responses?.find((r: any) => r.success);
        const fcmMessageId = firstSuccess?.messageId || null;

        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            fcmStatus,
            fcmMessageId,
            fcmSuccessCount: successCount,
            fcmFailureCount: failureCount,
            fcmAttemptedAt: new Date(),
          },
        });
      }

      return { success: true, message: 'Test push notification triggered successfully.', tokensCount: tokens.length, fcmResult };
    } catch (e: any) {
      try {
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            fcmStatus: 'FAILED',
            fcmError: e.message || String(e),
            fcmAttemptedAt: new Date(),
            fcmFailureCount: 1,
          },
        });
      } catch (dbErr) {}
      return { success: false, error: e.message };
    }
  }

  async getPushStatus(userId: string, companyId?: string) {
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    
    const lastToken = await this.prisma.fcmDeviceToken.findFirst({
      where: { userId, companyId: resolvedCompanyId },
      orderBy: { lastSeenAt: 'desc' },
      select: { lastSeenAt: true },
    });

    const lastAttempt = await this.prisma.notification.findFirst({
      where: { userId, companyId: resolvedCompanyId, fcmAttemptedAt: { not: null } },
      orderBy: { fcmAttemptedAt: 'desc' },
      select: { fcmAttemptedAt: true, fcmStatus: true },
    });

    const lastSuccess = await this.prisma.notification.findFirst({
      where: { userId, companyId: resolvedCompanyId, fcmStatus: 'SENT' },
      orderBy: { fcmAttemptedAt: 'desc' },
      select: { fcmAttemptedAt: true },
    });

    const isConfigured = this.firebasePushService.getIsConfigured();
    const projectId = this.firebasePushService.getProjectId();

    return {
      firebaseAdminInitialized: isConfigured,
      firebaseProjectId: projectId,
      userAuthenticated: true,
      registeredDeviceTokens: await this.prisma.fcmDeviceToken.count({ where: { userId, companyId: resolvedCompanyId } }),
      activeDeviceTokens: await this.prisma.fcmDeviceToken.count({
        where: {
          userId,
          companyId: resolvedCompanyId,
          lastSeenAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      serviceWorkerExpected: '/firebase-messaging-sw.js',
      permission: 'UNKNOWN_ON_SERVER',
      platform: 'WEB',
      lastTokenRegistration: lastToken?.lastSeenAt || null,
      lastPushAttempt: lastAttempt?.fcmAttemptedAt || null,
      lastPushSuccess: lastSuccess?.fcmAttemptedAt || null,
    };
  }
}
