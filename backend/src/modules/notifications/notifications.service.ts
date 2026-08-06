import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnread(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        status: 'UNREAD',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        status: 'UNREAD',
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  async broadcast(body: any, companyId: string) {
    const { roleCodes, title, message } = body;
    const targetRoles = Array.isArray(roleCodes) ? roleCodes : [roleCodes];

    let activeCompanyId = companyId;
    const companyExists = await this.prisma.company.findUnique({
      where: { id: companyId }
    });
    if (!companyExists) {
      const firstCompany = await this.prisma.company.findFirst();
      if (firstCompany) {
        activeCompanyId = firstCompany.id;
      }
    }

    const users = await this.prisma.user.findMany({
      where: {
        companyId: activeCompanyId,
        isActive: true,
        ...(targetRoles.includes('ALL') ? {} : {
          role: {
            code: { in: targetRoles },
          },
        }),
      },
    });

    if (users.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No users found matching selected roles.',
      };
    }

    const notificationsData = users.map((user) => ({
      companyId: activeCompanyId,
      userId: user.id,
      title: title || 'Broadcast Notification',
      message: message || '',
      status: 'UNREAD' as const,
    }));

    await this.prisma.notification.createMany({
      data: notificationsData,
    });

    return {
      success: true,
      count: users.length,
      message: `Successfully broadcasted notification to ${users.length} users.`,
    };
  }

  async getBroadcastHistory(companyId: string) {
    let activeCompanyId = companyId;
    const companyExists = await this.prisma.company.findUnique({
      where: { id: companyId }
    });
    if (!companyExists) {
      const firstCompany = await this.prisma.company.findFirst();
      if (firstCompany) {
        activeCompanyId = firstCompany.id;
      }
    }

    const notifications = await this.prisma.notification.findMany({
      where: {
        companyId: activeCompanyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    const userIds = notifications.map(n => n.userId);
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      include: {
        role: true
      }
    });

    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(u.id, {
        name: u.name,
        email: u.email,
        roleName: u.role?.name || 'User'
      });
    }

    return notifications.map(notif => {
      const u = userMap.get(notif.userId);
      return {
        ...notif,
        recipientName: u?.name || 'Unknown Recipient',
        recipientEmail: u?.email || 'N/A',
        recipientRole: u?.roleName || 'N/A'
      };
    });
  }
}
