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
    
    // 1. Try direct find
    let employee = await this.prisma.employee.findFirst({
      where: { userId }
    });
    if (employee && employee.companyId === activeCompanyId) return employee;

    // 2. Try linking by user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true, role: true }
    });
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.employee?.id) {
      if (user.employee.companyId !== activeCompanyId) {
        employee = await this.prisma.employee.update({
          where: { id: user.employee.id },
          data: { companyId: activeCompanyId }
        });
      } else {
        employee = user.employee;
      }
      return employee;
    }

    // Check if an employee with the same email already exists and link it
    const existingEmployeeByEmail = await this.prisma.employee.findUnique({
      where: { workEmail: user.email },
    });
    if (existingEmployeeByEmail) {
      const updatedEmployee = await this.prisma.employee.update({
        where: { id: existingEmployeeByEmail.id },
        data: { userId: user.id, companyId: activeCompanyId },
      });
      return updatedEmployee;
    }

    // Auto-create profile on-the-fly to support requesting exception before first punch-in
    let dept = await this.prisma.department.findFirst({
      where: { companyId: activeCompanyId, isActive: true },
    });
    if (!dept) {
      dept = await this.prisma.department.create({
        data: {
          code: `DEPT-AUTO-${Date.now()}`,
          name: 'Operations',
          companyId: activeCompanyId,
          isActive: true,
        },
      });
    }

    let loc = await this.prisma.workLocation.findFirst({
      where: { companyId: activeCompanyId, isActive: true },
    });
    if (!loc) {
      loc = await this.prisma.workLocation.create({
        data: {
          code: `LOC-AUTO-${Date.now()}`,
          name: 'Ahmedabad Head Office',
          companyId: activeCompanyId,
          isActive: true,
        },
      });
    }

    const names = (user.name || 'Staff Member').trim().split(/\s+/);
    const firstName = names[0] || 'Staff';
    const lastName = names.slice(1).join(' ') || 'Member';
    const codeSuffix = Math.floor(1000 + Math.random() * 9000);
    const employeeCode = `EMP-AUTO-${codeSuffix}`;

    const createdEmployee = await this.prisma.employee.create({
      data: {
        publicId: `EMP-${employeeCode}`,
        companyId: activeCompanyId,
        userId: user.id,
        employeeCode,
        firstName,
        lastName,
        fullName: user.name || 'Staff Member',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'OTHER',
        jobTitle: user.role?.name || 'Staff Member',
        departmentId: dept.id,
        workLocationId: loc.id,
        employmentType: 'PERMANENT',
        joiningDate: new Date(),
        status: 'ACTIVE',
        workEmail: user.email,
        phoneNumber: '9876543210',
        residentialAddress: 'Default Residential Address',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '9876543210',
        emergencyRelationship: 'Friend',
        panNumber: `PANAUTO${codeSuffix}`,
        aadhaarNumberEncrypted: 'enc-auto',
        aadhaarLastFour: '1234',
        aadhaarHash: `hash-auto-${user.id}`,
        bankName: 'State Bank of India',
        accountHolderName: user.name || 'Staff Member',
        bankAccountType: 'SAVINGS',
        bankAccountEncrypted: 'enc-auto',
        bankAccountLastFour: '1234',
        bankAccountHash: `bhash-auto-${user.id}`,
        ifscCode: 'SBIN0001234',
      },
    });

    return createdEmployee;
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
