import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getKolkataDate } from '../attendance/attendance.service';

@Injectable()
export class AttendanceRequestService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveCompanyId(companyId: string): Promise<string> {
    const companyExists = await this.prisma.company.findUnique({
      where: { id: companyId }
    });
    if (companyExists) return companyId;
    const firstCompany = await this.prisma.company.findFirst();
    return firstCompany?.id || companyId;
  }

  private async getEmployee(userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const employee = await this.prisma.employee.findFirst({
      where: { userId }
    });
    if (employee && employee.companyId === activeCompanyId) return employee;

    throw new BadRequestException('A linked employee profile is required to request manual attendance.');
  }

  async createRequest(userId: string, companyId: string, body: { date: string; reason: string }) {
    const employee = await this.getEmployee(userId, companyId);
    if (!body?.date || !body?.reason?.trim()) {
      throw new BadRequestException('Attendance date and reason are required.');
    }

    // Date-only browser values are interpreted as a Kolkata calendar date.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      throw new BadRequestException('Attendance date must be a valid calendar date.');
    }
    const requestDate = new Date(`${body.date}T00:00:00.000+05:30`);
    if (Number.isNaN(requestDate.getTime()) || requestDate > getKolkataDate().endOfDay) {
      throw new BadRequestException('Manual attendance cannot be requested for a future date.');
    }

    const existingPending = await this.prisma.manualAttendanceRequest.findFirst({
      where: {
        employeeId: employee.id,
        date: {
          gte: getKolkataDate(requestDate).startOfDay,
          lte: getKolkataDate(requestDate).endOfDay,
        },
        status: 'PENDING',
      },
    });
    if (existingPending) {
      throw new BadRequestException('A manual attendance request for this date is already pending.');
    }

    // Create the manual request
    const request = await this.prisma.manualAttendanceRequest.create({
      data: {
        employeeId: employee.id,
        date: requestDate,
        reason: body.reason.trim(),
        status: 'PENDING',
      },
      include: {
        employee: true
      }
    });

    return request;
  }

  async getMyRequests(userId: string, companyId: string) {
    const employee = await this.getEmployee(userId, companyId);
    return this.prisma.manualAttendanceRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPendingRequests(userId: string, companyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user || !user.role || !user.role.code.toUpperCase().includes('HR')) {
      throw new ForbiddenException('Only HR has permission to view pending attendance requests.');
    }

    const activeCompanyId = await this.getActiveCompanyId(companyId);
    return this.prisma.manualAttendanceRequest.findMany({
      where: {
        status: 'PENDING',
        employee: {
          companyId: activeCompanyId
        }
      },
      include: {
        employee: {
          include: {
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAuditHistory(userId: string, companyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user || !user.role || !user.role.code.toUpperCase().includes('HR')) {
      throw new ForbiddenException('Only HR has permission to view attendance request history.');
    }

    const activeCompanyId = await this.getActiveCompanyId(companyId);
    return this.prisma.manualAttendanceRequest.findMany({
      where: {
        status: { in: ['APPROVED', 'REJECTED'] },
        employee: {
          companyId: activeCompanyId
        }
      },
      include: {
        employee: {
          include: {
            department: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async approveRequest(id: string, userId: string, companyId: string, body: { remarks?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user || !user.role || !user.role.code.toUpperCase().includes('HR')) {
      throw new ForbiddenException('Only HR can approve attendance requests.');
    }

    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const request = await this.prisma.manualAttendanceRequest.findFirst({
      where: { id, employee: { companyId: activeCompanyId } },
      include: { employee: true },
    });
    if (!request) {
      throw new NotFoundException('Attendance request not found.');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not in PENDING status.');
    }

    const attendanceDate = getKolkataDate(request.date).startOfDay;
    return this.prisma.$transaction(async (tx) => {
      // Never overwrite an actual punch record.  A manual approval fills a missing day only.
      await tx.attendance.upsert({
        where: {
          employeeId_attendanceDate: {
            employeeId: request.employeeId,
            attendanceDate,
          },
        },
        create: {
          companyId: request.employee.companyId,
          employeeId: request.employeeId,
          userId: request.employee.userId || request.employeeId,
          attendanceDate,
          status: 'PRESENT',
        },
        update: {},
      });

      return tx.manualAttendanceRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          remarks: body.remarks?.trim() || 'Approved by HR',
        },
      });
    });
  }

  async rejectRequest(id: string, userId: string, companyId: string, body: { remarks?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user || !user.role || !user.role.code.toUpperCase().includes('HR')) {
      throw new ForbiddenException('Only HR can reject attendance requests.');
    }

    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const request = await this.prisma.manualAttendanceRequest.findFirst({
      where: { id, employee: { companyId: activeCompanyId } },
    });
    if (!request) {
      throw new NotFoundException('Attendance request not found.');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not in PENDING status.');
    }

    return this.prisma.manualAttendanceRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        remarks: body.remarks?.trim() || 'Rejected by HR'
      }
    });
  }
}
