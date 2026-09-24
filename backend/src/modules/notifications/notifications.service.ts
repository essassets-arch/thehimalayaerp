import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationPriority } from '@prisma/client';
export { NotificationPriority } from '@prisma/client';
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
  eventKey?: string;
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
  private describeEvent(type?: string): {
    module: string;
    priority: NotificationPriority;
  } {
    const event = String(type || 'GENERAL').toUpperCase();
    const moduleByPrefix: Array<[string, string]> = [
      ['LEAD_', 'SALES'],
      ['SAMPLE_', 'SALES'],
      ['QUOTATION_', 'SALES'],
      ['SALES_ORDER_', 'SALES'],
      ['FULFILLMENT_', 'PLANT_HEAD'],
      ['WORK_ORDER_', 'PRODUCTION'],
      ['PRODUCTION_', 'PRODUCTION'],
      ['QC_', 'QC'],
      ['REWORK_', 'PRODUCTION'],
      ['DISPATCH', 'DISPATCH'],
      ['VEHICLE_', 'DISPATCH'],
      ['PAYMENT_', 'FINANCE'],
      ['PO_', 'PROCUREMENT'],
      ['MATERIAL_', 'STORE'],
      ['INVENTORY_', 'STORE'],
      ['LEAVE_', 'HR'],
      ['ATTENDANCE_', 'HR'],
      ['PAYROLL_', 'HR'],
      ['RETURN_', 'DISPATCH'],
      ['REPLACEMENT_', 'DISPATCH'],
      ['BROADCAST', 'ADMIN'],
    ];
    const module =
      moduleByPrefix.find(([prefix]) => event.startsWith(prefix))?.[1] ||
      'SYSTEM';
    const critical = [
      'QC_FAILED',
      'PAYMENT_OVERDUE',
      'LOW_STOCK',
      'PRODUCTION_BLOCKED',
      'SYSTEM_ALERT',
    ];
    const high = [
      'APPROVAL_REQUIRED',
      'INSPECTION_REQUIRED',
      'VERIFICATION_REQUIRED',
      'DISPATCH_REQUIRED',
      'PRODUCTION_REQUIRED',
      'REJECTED',
    ];
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
        this.logger.log(
          `Notification with eventKey "${eventKey}" already exists. Skipping duplicate creation.`,
        );
        return existing;
      }
    }

    // 0. Safeguard: Prevent Dispatch cross-contamination between Dispatch 1 and Dispatch 2
    const recipient = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        dispatchCategory: true,
        role: { select: { code: true } },
      },
    });

    if (recipient) {
      const roleCode = String(recipient.role?.code || '').toUpperCase();
      const userEmail = String(recipient.email || '').toLowerCase();
      const cat = String(recipient.dispatchCategory || '').toUpperCase();

      const isD2User =
        roleCode === 'DISPATCH_2' || cat === 'D2' || userEmail.includes('sahad');
      const isD1User =
        ['DISPATCH_1', 'DISPATCH_EXECUTIVE', 'DISPATCH'].includes(roleCode) ||
        cat === 'D1' ||
        userEmail.includes('ravikant');

      const isD2Content =
        (route && route.startsWith('/dispatch-2')) ||
        type.includes('DISPATCH_2') ||
        title.toLowerCase().includes('dispatch 2') ||
        title.toLowerCase().includes('sahad') ||
        message.toLowerCase().includes('dispatch 2') ||
        message.toLowerCase().includes('sahad');

      const isD1Content =
        (route && route.startsWith('/dispatch') && !route.startsWith('/dispatch-2')) ||
        type.includes('DISPATCH_1') ||
        entityType === 'WorkOrder' ||
        title.toLowerCase().includes('dispatch 1') ||
        title.toLowerCase().includes('factory') ||
        message.toLowerCase().includes('dispatch 1') ||
        message.toLowerCase().includes('factory');

      if (isD2User && !isD1User && isD1Content && !isD2Content) {
        this.logger.warn(
          `[Isolation] Suppressed Dispatch 1 notification "${title}" from sending to Dispatch 2 user ${recipient.email}`,
        );
        return null;
      }

      if (isD1User && !isD2User && isD2Content && !isD1Content) {
        this.logger.warn(
          `[Isolation] Suppressed Dispatch 2 notification "${title}" from sending to Dispatch 1 user ${recipient.email}`,
        );
        return null;
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
      let deviceTokens = await this.prisma.fcmDeviceToken.findMany({
        where: { userId, ...(companyId ? { companyId } : {}) },
        select: { token: true },
      });

      if (deviceTokens.length === 0) {
        deviceTokens = await this.prisma.fcmDeviceToken.findMany({
          where: { userId },
          select: { token: true },
        });
      }

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
      this.logger.error(
        `Synchronous FCM dispatch failed for notification ${notification.id}: ${err?.message || err}`,
      );
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
        this.logger.error(
          `Failed to update FCM error status in database: ${dbErr}`,
        );
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
      eventKey,
      eventKeyPrefix,
    } = dto;

    const rawRoles = roles || (role ? [role] : []);
    if (rawRoles.length === 0) {
      return [];
    }

    const ROLE_ALIASES: Record<string, string[]> = {
      PRODUCTION: ['PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'PRODUCTION', 'PRODUCTION_MANAGER', 'PRODUCTION_HEAD'],
      PRODUCTION_PLANNER: ['PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'PRODUCTION', 'PRODUCTION_MANAGER'],
      PRODUCTION_OPERATOR: ['PRODUCTION_OPERATOR', 'PRODUCTION_PLANNER', 'PRODUCTION'],
      PRODUCTION_MANAGER: ['PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'PRODUCTION', 'PRODUCTION_MANAGER', 'PRODUCTION_HEAD'],
      DISPATCH: ['DISPATCH_EXECUTIVE', 'DISPATCH_1', 'DISPATCH'],
      DISPATCH_1: ['DISPATCH_EXECUTIVE', 'DISPATCH_1', 'DISPATCH'],
      DISPATCH_2: ['DISPATCH_2'],
      DISPATCH_EXECUTIVE: ['DISPATCH_EXECUTIVE', 'DISPATCH_1', 'DISPATCH'],
      PLANT_HEAD: ['PLANT_HEAD'],
      SALES: ['SALES_EXECUTIVE', 'SALES_MANAGER', 'SUPER_SALES', 'SALES'],
      SALES_EXECUTIVE: ['SALES_EXECUTIVE', 'SALES_MANAGER', 'SUPER_SALES'],
      SALES_MANAGER: ['SALES_MANAGER', 'SALES_EXECUTIVE', 'SUPER_SALES'],
      SUPER_SALES: ['SUPER_SALES', 'SALES_MANAGER', 'SALES_EXECUTIVE'],
      QC: ['QC_INSPECTOR', 'QC'],
      QC_INSPECTOR: ['QC_INSPECTOR', 'QC'],
      STORE: ['STORE_MANAGER', 'STORE'],
      STORE_MANAGER: ['STORE_MANAGER', 'STORE'],
      FINANCE: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE', 'FINANCE'],
      FINANCE_MANAGER: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE', 'FINANCE'],
      FINANCE_EXECUTIVE: ['FINANCE_EXECUTIVE', 'FINANCE_MANAGER', 'FINANCE'],
      HR: ['HR'],
      ADMIN: ['SUPER_ADMIN', 'ADMIN'],
      SUPER_ADMIN: ['SUPER_ADMIN', 'ADMIN'],
    };

    const expandedRoles = new Set<string>();
    for (const r of rawRoles) {
      const upper = String(r || '').toUpperCase();
      expandedRoles.add(upper);
      if (ROLE_ALIASES[upper]) {
        for (const alias of ROLE_ALIASES[upper]) {
          expandedRoles.add(alias);
        }
      }
    }
    const targetRoles = Array.from(expandedRoles);

    const isTargetingD1 = targetRoles.some((r) =>
      ['DISPATCH_1', 'DISPATCH_EXECUTIVE', 'DISPATCH'].includes(r),
    );
    const isTargetingD2 = targetRoles.includes('DISPATCH_2');

    let baseUserFilter: any = {
      ...(companyId ? { companyId } : {}),
      isActive: true,
      role: {
        code: { in: targetRoles },
      },
    };

    if (isTargetingD1 && !isTargetingD2) {
      baseUserFilter = {
        ...baseUserFilter,
        AND: [
          { NOT: { role: { code: 'DISPATCH_2' } } },
          { NOT: { email: { contains: 'sahad', mode: 'insensitive' } } },
          { NOT: { dispatchCategory: 'D2' } },
        ],
      };
    } else if (isTargetingD2 && !isTargetingD1) {
      baseUserFilter = {
        ...baseUserFilter,
        AND: [
          { NOT: { role: { code: { in: ['DISPATCH_1', 'DISPATCH_EXECUTIVE', 'DISPATCH'] } } } },
          { NOT: { email: { contains: 'ravikant', mode: 'insensitive' } } },
          { NOT: { dispatchCategory: 'D1' } },
        ],
      };
    }

    let users = await this.prisma.user.findMany({
      where: baseUserFilter,
      select: { id: true, companyId: true },
    });

    if (users.length === 0 && companyId) {
      const fallbackFilter = { ...baseUserFilter };
      delete fallbackFilter.companyId;
      users = await this.prisma.user.findMany({
        where: fallbackFilter,
        select: { id: true, companyId: true },
      });
    }

    if (users.length === 0) {
      return [];
    }

    const createdNotifications: any[] = [];
    for (const u of users) {
      const uEventKey = eventKey
        ? `${eventKey}:${u.id}`
        : eventKeyPrefix
        ? `${eventKeyPrefix}:${u.id}`
        : undefined;
      const notif = await this.notifyUser({
        companyId: u.companyId || companyId,
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
        eventKey: uEventKey,
      });
      if (notif) {
        createdNotifications.push(notif);
      }
    }

    return createdNotifications;
  }

  private async resolveCompanyId(
    userId: string,
    companyId?: string,
  ): Promise<string> {
    if (companyId) return companyId;
    if (!userId) return '';
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    return user?.companyId || '';
  }

  /**
   * Generates a strict isolation filter ensuring Dispatch 1 and Dispatch 2 users
   * never see each other's notifications.
   */
  private async getDispatchIsolationFilter(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        dispatchCategory: true,
        role: { select: { code: true } },
      },
    });
    if (!user) return {};

    const roleCode = String(user.role?.code || '').toUpperCase();
    const email = String(user.email || '').toLowerCase();
    const cat = String(user.dispatchCategory || '').toUpperCase();

    const isD2User =
      roleCode === 'DISPATCH_2' || cat === 'D2' || email.includes('sahad');
    const isD1User =
      ['DISPATCH_1', 'DISPATCH_EXECUTIVE', 'DISPATCH'].includes(roleCode) ||
      cat === 'D1' ||
      email.includes('ravikant');

    if (isD2User && !isD1User) {
      // Dispatch 2 MUST NOT see Dispatch 1 (Factory / WorkOrder) notifications
      return {
        NOT: [
          {
            AND: [
              { route: { startsWith: '/dispatch' } },
              { NOT: { route: { startsWith: '/dispatch-2' } } },
            ],
          },
          { type: { contains: 'DISPATCH_1' } },
          { entityType: 'WorkOrder' },
          { title: { contains: 'Dispatch 1', mode: 'insensitive' } },
          { message: { contains: 'Dispatch 1', mode: 'insensitive' } },
          { message: { contains: 'Factory', mode: 'insensitive' } },
        ],
      };
    }

    if (isD1User && !isD2User) {
      // Dispatch 1 MUST NOT see Dispatch 2 (Sahad Trading) notifications
      return {
        NOT: [
          { route: { startsWith: '/dispatch-2' } },
          { type: { contains: 'DISPATCH_2' } },
          { title: { contains: 'Dispatch 2', mode: 'insensitive' } },
          { message: { contains: 'Dispatch 2', mode: 'insensitive' } },
          { message: { contains: 'Sahad', mode: 'insensitive' } },
        ],
      };
    }

    return {};
  }

  async getNotifications(
    userId: string,
    companyId?: string,
    limit = 20,
    offset = 0,
  ) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return {
        items: [],
        unreadCount: 0,
      };
    }
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    const isolationFilter = await this.getDispatchIsolationFilter(userId);
    const whereCondition = {
      userId,
      companyId: resolvedCompanyId,
      ...isolationFilter,
    };

    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({
        where: {
          ...whereCondition,
          isRead: false,
        },
      }),
    ]);

    return {
      items,
      unreadCount,
    };
  }

  async getUnreadCount(userId: string, companyId?: string): Promise<number> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return 0;
    }
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    const isolationFilter = await this.getDispatchIsolationFilter(userId);
    return this.prisma.notification.count({
      where: {
        userId,
        companyId: resolvedCompanyId,
        isRead: false,
        ...isolationFilter,
      },
    });
  }

  async markAsRead(id: string, userId: string, companyId?: string) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new NotFoundException('User ID is required');
    }
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
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return { count: 0 };
    }
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    const isolationFilter = await this.getDispatchIsolationFilter(userId);
    return this.prisma.notification.updateMany({
      where: {
        userId,
        companyId: resolvedCompanyId,
        isRead: false,
        ...isolationFilter,
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

  async removeDeviceToken(
    userId: string,
    companyId: string | undefined,
    token: string,
  ) {
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    return this.prisma.fcmDeviceToken.deleteMany({
      where: {
        token,
        userId,
        companyId: resolvedCompanyId,
      },
    });
  }

  async broadcast(
    body: any,
    companyId: string,
    actorMeta?: { actorUserId?: string; actorRole?: string; actorName?: string },
  ) {
    const { roleCodes, userIds, employeeIds, title, message, route, priority, sender, module: reqModule } = body;
    const rawTargetRoles = Array.isArray(roleCodes) ? roleCodes : roleCodes ? [roleCodes] : [];
    let rawUserIds = Array.isArray(userIds) ? userIds : userIds ? [userIds] : [];
    const rawEmpIds = Array.isArray(employeeIds) ? employeeIds : employeeIds ? [employeeIds] : [];

    // Determine sender module: 'HR' vs 'SUPER_ADMIN'
    const declaredSender = String(sender || reqModule || actorMeta?.actorRole || '').toUpperCase();
    const isHRSender = declaredSender === 'HR' || declaredSender.includes('HR');
    const senderModule = isHRSender ? 'HR' : 'SUPER_ADMIN';
    const defaultActorName = isHRSender ? 'HR Department' : 'Super Admin';
    const actorName = actorMeta?.actorName || defaultActorName;
    const actorUserId = actorMeta?.actorUserId;

    // Role & Department Mappings for broad, department-accurate coverage
    const ROLE_ALIASES: Record<string, string[]> = {
      PRODUCTION: ['PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'PRODUCTION', 'PRODUCTION_MANAGER', 'PRODUCTION_HEAD'],
      PRODUCTION_PLANNER: ['PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'PRODUCTION', 'PRODUCTION_MANAGER'],
      PRODUCTION_OPERATOR: ['PRODUCTION_OPERATOR', 'PRODUCTION_PLANNER', 'PRODUCTION'],
      DISPATCH: ['DISPATCH_EXECUTIVE', 'DISPATCH_1', 'DISPATCH_2', 'DISPATCH'],
      DISPATCH_1: ['DISPATCH_EXECUTIVE', 'DISPATCH_1', 'DISPATCH'],
      DISPATCH_2: ['DISPATCH_2', 'DISPATCH_EXECUTIVE'],
      DISPATCH_EXECUTIVE: ['DISPATCH_EXECUTIVE', 'DISPATCH_1', 'DISPATCH_2', 'DISPATCH'],
      PLANT_HEAD: ['PLANT_HEAD'],
      SALES: ['SALES_EXECUTIVE', 'SALES_MANAGER', 'SUPER_SALES', 'SALES'],
      SALES_EXECUTIVE: ['SALES_EXECUTIVE', 'SALES_MANAGER', 'SUPER_SALES', 'SALES'],
      SALES_MANAGER: ['SALES_MANAGER', 'SALES_EXECUTIVE', 'SUPER_SALES', 'SALES'],
      SUPER_SALES: ['SUPER_SALES', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SALES'],
      QC: ['QC_INSPECTOR', 'QC_MANAGER', 'QC'],
      QC_INSPECTOR: ['QC_INSPECTOR', 'QC_MANAGER', 'QC'],
      STORE: ['STORE_MANAGER', 'STORE_EXECUTIVE', 'STORE'],
      STORE_MANAGER: ['STORE_MANAGER', 'STORE_EXECUTIVE', 'STORE'],
      FINANCE: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE', 'FINANCE'],
      FINANCE_MANAGER: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE', 'FINANCE'],
      FINANCE_EXECUTIVE: ['FINANCE_EXECUTIVE', 'FINANCE_MANAGER', 'FINANCE'],
      HR: ['HR', 'HR_MANAGER', 'HR_EXECUTIVE'],
      MANAGEMENT: ['SUPER_ADMIN', 'ADMIN', 'BACK_OFFICE', 'PLANT_HEAD'],
      ADMIN: ['SUPER_ADMIN', 'ADMIN', 'BACK_OFFICE'],
      SUPER_ADMIN: ['SUPER_ADMIN', 'ADMIN', 'BACK_OFFICE'],
    };

    const DEPT_KEYWORDS: Record<string, string[]> = {
      SALES: ['Sales', 'Sales Department', 'DEPT-SALES', 'DEPT_SALES_DEPARTMENT'],
      SALES_EXECUTIVE: ['Sales', 'Sales Department', 'DEPT-SALES', 'DEPT_SALES_DEPARTMENT'],
      PRODUCTION: ['Production', 'Production Department', 'DEPT-PRODUCTION', 'DEPT_PRODUCTION_DEPARTMENT'],
      PRODUCTION_PLANNER: ['Production', 'Production Department', 'DEPT-PRODUCTION', 'DEPT_PRODUCTION_DEPARTMENT'],
      STORE: ['Store', 'Store Department', 'DEPT-STORE', 'DEPT_STORE_DEPARTMENT', 'Warehouse'],
      STORE_MANAGER: ['Store', 'Store Department', 'DEPT-STORE', 'DEPT_STORE_DEPARTMENT', 'Warehouse'],
      QC: ['QC', 'Quality', 'QC Department', 'DEPT-QC'],
      QC_INSPECTOR: ['QC', 'Quality', 'QC Department', 'DEPT-QC'],
      DISPATCH: ['Dispatch', 'Dispatch Department', 'DEPT-DISPATCH', 'DEPT_DISPATCH_DEPARTMENT'],
      DISPATCH_EXECUTIVE: ['Dispatch', 'Dispatch Department', 'DEPT-DISPATCH', 'DEPT_DISPATCH_DEPARTMENT'],
      FINANCE: ['Finance', 'Accounts', 'Finance Department', 'DEPT-FINANCE', 'DEPT_FINANCE_DEPARTMENT'],
      FINANCE_EXECUTIVE: ['Finance', 'Accounts', 'Finance Department', 'DEPT-FINANCE', 'DEPT_FINANCE_DEPARTMENT'],
      HR: ['HR', 'Human Resources', 'HR Department', 'DEPT-HR', 'DEPT_HR_DEPARTMENT'],
      PLANT_HEAD: ['Operations', 'Plant', 'Plant Head'],
      MANAGEMENT: ['Admin', 'Super Admin', 'DEPT-SUPER-ADMIN', 'DEPT_SUPER_ADMIN_DEPARTMENT', 'Management'],
      SUPER_ADMIN: ['Admin', 'Super Admin', 'DEPT-SUPER-ADMIN', 'DEPT_SUPER_ADMIN_DEPARTMENT', 'Management'],
    };

    // 1. Resolve User-Wise Target Recipients
    const combinedIdentifiers = Array.from(new Set([...rawUserIds, ...rawEmpIds].map((x) => String(x).trim()))).filter(Boolean);
    let resolvedUserIds: string[] = [];

    if (combinedIdentifiers.length > 0) {
      // Find matching users directly
      const directUsers = await this.prisma.user.findMany({
        where: {
          OR: [
            { id: { in: combinedIdentifiers } },
            { publicId: { in: combinedIdentifiers } },
            { email: { in: combinedIdentifiers } },
          ],
          ...(companyId ? { companyId } : {}),
        },
        select: { id: true },
      });
      resolvedUserIds.push(...directUsers.map((u) => u.id));

      // Find users linked via employee table
      const linkedEmployees = await this.prisma.employee.findMany({
        where: {
          OR: [
            { id: { in: combinedIdentifiers } },
            { publicId: { in: combinedIdentifiers } },
            { employeeCode: { in: combinedIdentifiers } },
            { workEmail: { in: combinedIdentifiers } },
            { userId: { in: combinedIdentifiers } },
          ],
          ...(companyId ? { companyId } : {}),
        },
        select: { userId: true },
      });
      resolvedUserIds.push(
        ...linkedEmployees.map((e) => e.userId).filter(Boolean) as string[],
      );
      resolvedUserIds = Array.from(new Set(resolvedUserIds));
    }

    let whereClause: any = {
      isActive: true,
      ...(companyId ? { companyId } : {}),
    };

    if (resolvedUserIds.length > 0) {
      whereClause.id = { in: resolvedUserIds };
    } else if (rawTargetRoles.length > 0 && !rawTargetRoles.includes('ALL')) {
      const expandedRoleSet = new Set<string>();
      const deptKeywordsSet = new Set<string>();

      for (const r of rawTargetRoles) {
        const upper = String(r || '').toUpperCase();
        expandedRoleSet.add(upper);
        if (ROLE_ALIASES[upper]) {
          ROLE_ALIASES[upper].forEach((alias) => expandedRoleSet.add(alias));
        }
        if (DEPT_KEYWORDS[upper]) {
          DEPT_KEYWORDS[upper].forEach((kw) => deptKeywordsSet.add(kw));
        }
      }

      const roleList = Array.from(expandedRoleSet);
      const kwList = Array.from(deptKeywordsSet);

      const orConditions: any[] = [
        { role: { code: { in: roleList } } },
        { role: { name: { in: roleList } } },
      ];

      if (kwList.length > 0) {
        orConditions.push({
          employee: {
            department: {
              code: { in: kwList },
            },
          },
        });
        for (const kw of kwList) {
          orConditions.push({
            employee: {
              department: {
                name: { contains: kw, mode: 'insensitive' },
              },
            },
          });
        }
      }

      whereClause.OR = orConditions;
    }

    let users = await this.prisma.user.findMany({
      where: whereClause,
      select: { id: true, companyId: true },
    });

    if (users.length === 0 && companyId) {
      const fallbackFilter = { ...whereClause };
      delete fallbackFilter.companyId;
      users = await this.prisma.user.findMany({
        where: fallbackFilter,
        select: { id: true, companyId: true },
      });
    }

    if (users.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No active users found matching selected criteria.',
      };
    }

    let parsedPriority: NotificationPriority = NotificationPriority.HIGH;
    if (priority) {
      const pUpper = String(priority).toUpperCase();
      if (pUpper === 'CRITICAL' || pUpper === 'URGENT') parsedPriority = NotificationPriority.CRITICAL;
      else if (pUpper === 'LOW') parsedPriority = NotificationPriority.LOW;
      else if (pUpper === 'MEDIUM' || pUpper === 'NORMAL') parsedPriority = NotificationPriority.MEDIUM;
    }

    let pushDeliveredCount = 0;
    let pushNoTokensCount = 0;
    let pushFailedCount = 0;

    for (const u of users) {
      const notif = await this.notifyUser({
        companyId: u.companyId || companyId,
        userId: u.id,
        type: 'BROADCAST',
        module: senderModule,
        priority: parsedPriority,
        title: title || (isHRSender ? 'HR Notice' : 'Corporate Announcement'),
        message: message || '',
        route: route || '/notifications',
        actorUserId,
        actorName,
      });

      if (notif) {
        if (notif.fcmStatus === 'SENT' || notif.fcmStatus === 'PARTIAL') pushDeliveredCount++;
        else if (notif.fcmStatus === 'NO_TOKENS') pushNoTokensCount++;
        else if (notif.fcmStatus === 'FAILED') pushFailedCount++;
      }
    }

    return {
      success: true,
      count: users.length,
      pushDelivered: pushDeliveredCount,
      pushNoTokens: pushNoTokensCount,
      pushFailed: pushFailedCount,
      message: `Successfully broadcasted notification to ${users.length} user(s) (${pushDeliveredCount} received push alert).`,
    };
  }

  async getBroadcastHistory(companyId: string, senderRole?: string) {
    const norm = String(senderRole || '').toUpperCase();
    const isHR = norm === 'HR' || norm.includes('HR');
    const isSuperAdmin = norm === 'SUPER_ADMIN' || norm === 'ADMIN' || norm.includes('ADMIN');

    // ONLY return broadcasts dispatched via broadcast tools, NEVER automated order/delivery/dispatch transactions!
    const whereClause: any = {
      companyId,
      type: 'BROADCAST',
    };

    if (isHR) {
      whereClause.module = 'HR';
    } else if (isSuperAdmin) {
      whereClause.module = { not: 'HR' };
    }

    const notifications = await this.prisma.notification.findMany({
      where: whereClause,
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
        senderName: notif.actorName || (notif.module === 'HR' ? 'HR Department' : 'Super Admin'),
      };
    });
  }

  async sendTestPushToUser(userId: string, companyId: string) {
    const resolvedCompanyId = await this.resolveCompanyId(userId, companyId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    const userRoleCode = (user?.role?.code || 'SUPER_ADMIN').toUpperCase();
    const userRoleName = user?.role?.name || 'Admin';

    let defaultRoute = '/notifications';
    let moduleTag = 'SYSTEM';

    if (userRoleCode.includes('HR')) {
      defaultRoute = '/hr/employees';
      moduleTag = 'HR';
    } else if (userRoleCode.includes('SUPER_ADMIN') || userRoleCode.includes('ADMIN')) {
      defaultRoute = '/super-admin';
      moduleTag = 'SUPER_ADMIN';
    } else if (userRoleCode.includes('SALES')) {
      defaultRoute = '/sales';
      moduleTag = 'SALES';
    } else if (userRoleCode.includes('PLANT')) {
      defaultRoute = '/plant-head';
      moduleTag = 'PLANT_HEAD';
    } else if (userRoleCode.includes('PRODUCTION')) {
      defaultRoute = '/production';
      moduleTag = 'PRODUCTION';
    } else if (userRoleCode.includes('STORE')) {
      defaultRoute = '/store';
      moduleTag = 'STORE';
    } else if (userRoleCode.includes('QC')) {
      defaultRoute = '/qc';
      moduleTag = 'QC';
    } else if (userRoleCode.includes('FINANCE')) {
      defaultRoute = '/finance';
      moduleTag = 'FINANCE';
    } else if (userRoleCode.includes('DISPATCH')) {
      defaultRoute = '/dispatch';
      moduleTag = 'DISPATCH';
    }

    const payload = {
      title: `${userRoleName} Alerts 🚀`,
      message: `Notifications for ${userRoleName} are active and functional!`,
      route: defaultRoute,
      type: 'TEST',
      module: moduleTag,
    };

    // 1. Create PostgreSQL Notification first (Source of Truth) so diagnostics has log
    const notification = await this.prisma.notification.create({
      data: {
        companyId: resolvedCompanyId,
        userId,
        type: payload.type,
        module: payload.module,
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
        message:
          'Test bell notification created. No registered FCM device token was found.',
        notificationId: notification.id,
        tokensCount: 0,
      };
    }

    try {
      const fcmResult = await this.firebasePushService.sendPushToUser(
        userId,
        resolvedCompanyId,
        payload.title,
        payload.message,
        {
          notificationId: notification.id,
          type: payload.type,
          route: payload.route,
        },
      );

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

      return {
        success: true,
        message: 'Test push notification triggered successfully.',
        tokensCount: tokens.length,
        fcmResult,
      };
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
      where: {
        userId,
        companyId: resolvedCompanyId,
        fcmAttemptedAt: { not: null },
      },
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
      registeredDeviceTokens: await this.prisma.fcmDeviceToken.count({
        where: { userId, companyId: resolvedCompanyId },
      }),
      activeDeviceTokens: await this.prisma.fcmDeviceToken.count({
        where: {
          userId,
          companyId: resolvedCompanyId,
          lastSeenAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
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
