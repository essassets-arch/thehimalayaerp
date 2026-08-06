import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
      where: { userId, companyId: activeCompanyId }
    });
    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user.');
    }
    return employee;
  }

  async createRequest(userId: string, companyId: string, body: { date: string; reason: string }) {
    const employee = await this.getEmployee(userId, companyId);
    
    // Create the manual request
    const request = await this.prisma.manualAttendanceRequest.create({
      data: {
        employeeId: employee.id,
        date: new Date(body.date),
        reason: body.reason,
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

    const request = await this.prisma.manualAttendanceRequest.findUnique({
      where: { id }
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
        status: 'APPROVED',
        remarks: body.remarks || 'Approved by HR'
      }
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

    const request = await this.prisma.manualAttendanceRequest.findUnique({
      where: { id }
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
        remarks: body.remarks || 'Rejected by HR'
      }
    });
  }
}
