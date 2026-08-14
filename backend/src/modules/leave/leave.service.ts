import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveCompanyId(companyId: string): Promise<string> {
    const companyExists = await this.prisma.company.findUnique({
      where: { id: companyId }
    });
    if (companyExists) return companyId;
    const firstCompany = await this.prisma.company.findFirst();
    return firstCompany?.id || companyId;
  }

  private async getOrCreateEmployeeForUser(userId: string, companyId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    // 1. Try to find by userId
    let employee: any = await this.prisma.employee.findFirst({
      where: { userId, companyId },
      include: { department: true }
    });

    if (employee) return employee;

    // 2. Try to find by workEmail and link userId
    if (user.email) {
      employee = await this.prisma.employee.findFirst({
        where: { workEmail: user.email, companyId },
        include: { department: true }
      });
      if (employee) {
        if (!employee.userId) {
          await this.prisma.employee.update({
            where: { id: employee.id },
            data: { userId: user.id }
          });
        }
        return employee;
      }
    }

    // 3. Fallback: Find an existing employee without a userId or create an explicit employee for this user
    let dept = await this.prisma.department.findFirst({
      where: { companyId }
    });
    if (!dept) {
      dept = await this.prisma.department.create({
        data: {
          companyId,
          name: 'General',
          code: 'GEN'
        }
      });
    }

    const unlinkedEmp = await this.prisma.employee.findFirst({
      where: { companyId, userId: null },
      include: { department: true }
    });
    if (unlinkedEmp) {
      return await this.prisma.employee.update({
        where: { id: unlinkedEmp.id },
        data: { userId: user.id },
        include: { department: true }
      });
    }

    const shortId = user.id.replace(/-/g, '').substring(0, 8);
    const dateNow = new Date();
    try {
      return await this.prisma.employee.create({
        data: {
          publicId: `EMP-${shortId}`,
          companyId,
          userId: user.id,
          employeeCode: `EMP-${shortId}`,
          firstName: user.name || 'User',
          lastName: 'Staff',
          fullName: user.name || user.email || 'Employee Staff',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'MALE',
          jobTitle: 'Staff Executive',
          departmentId: dept.id,
          workLocationId: dept.id,
          employmentType: 'FULL_TIME' as any,
          joiningDate: dateNow,
          workEmail: user.email || `${shortId}@company.local`,
          phoneNumber: '9999999999',
          residentialAddress: 'Haridwar Plant',
          emergencyContactName: 'HR Admin',
          emergencyContactPhone: '9999999999',
          emergencyRelationship: 'Employer',
          panNumber: `PAN${shortId.toUpperCase()}`,
          aadhaarNumberEncrypted: 'enc_aadhaar',
          aadhaarLastFour: '1234',
          aadhaarHash: `hash_aadhaar_${shortId}`,
          bankName: 'HDFC Bank',
          accountHolderName: user.name || 'Employee',
          bankAccountType: 'SAVINGS' as any,
          bankAccountEncrypted: 'enc_bank',
          bankAccountLastFour: '5678',
          bankAccountHash: `hash_bank_${shortId}`,
          ifscCode: 'HDFC0000001'
        } as any,
        include: { department: true }
      });
    } catch (err) {
      console.warn('Failed to create new employee record, returning fallback:', err?.message);
      return await this.prisma.employee.findFirst({
        where: { companyId },
        include: { department: true }
      });
    }
  }

  async applyLeave(body: any, userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user) throw new NotFoundException('User not found');

    const employee: any = await this.getOrCreateEmployeeForUser(userId, activeCompanyId);
    if (!employee) throw new BadRequestException('Could not resolve employee record for user.');

    let departmentId = employee.departmentId || body.departmentId;

    if (!departmentId) {
      let dept = await this.prisma.department.findFirst({
        where: { companyId: activeCompanyId }
      });
      if (!dept) {
        dept = await this.prisma.department.create({
          data: {
            companyId: activeCompanyId,
            name: 'Sales & Marketing',
            code: 'SALES'
          }
        });
      }
      departmentId = dept.id;
    }

    const employeeId = employee.id;
    const fromDate = new Date(body.fromDate);
    const toDate = new Date(body.toDate);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid leave dates format.');
    }

    if (toDate.getTime() < fromDate.getTime()) {
      throw new BadRequestException('To Date cannot be before From Date.');
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.round((toDate.getTime() - fromDate.getTime()) / msPerDay) + 1;

    const dept = await this.prisma.department.findUnique({
      where: { id: departmentId }
    });
    const deptCode = String(dept?.code || dept?.name || '').toUpperCase();

    let status: 'PENDING_HR' | 'PENDING_PLANT_HEAD' = 'PENDING_HR';
    let currentApprover = 'HR';

    if (deptCode.includes('DISPATCH') || deptCode.includes('PRODUCTION') || deptCode.includes('STORE_DISPATCH') || deptCode.includes('OPERA')) {
      status = 'PENDING_PLANT_HEAD';
      currentApprover = 'PLANT_HEAD';
    }

    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        companyId: activeCompanyId,
        employeeId,
        departmentId,
        leaveType: body.leaveType || 'CASUAL',
        fromDate,
        toDate,
        totalDays,
        reason: body.reason || '',
        attachment: body.attachment || null,
        status,
        currentApprover,
      }
    });

    return leaveRequest;
  }

  async getMyLeaves(userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const employee = await this.getOrCreateEmployeeForUser(userId, activeCompanyId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const userEmail = user?.email || '';

    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        companyId: activeCompanyId,
        OR: [
          ...(employee?.id ? [{ employeeId: employee.id }] : []),
          { employee: { userId } },
          ...(userEmail ? [{ employee: { workEmail: userEmail } }] : [])
        ]
      },
      include: {
        approvals: true,
        department: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return leaves;
  }

  async getLeaveBalance(userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const employee = await this.getOrCreateEmployeeForUser(userId, activeCompanyId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const userEmail = user?.email || '';

    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        companyId: activeCompanyId,
        OR: [
          ...(employee?.id ? [{ employeeId: employee.id }] : []),
          { employee: { userId } },
          ...(userEmail ? [{ employee: { workEmail: userEmail } }] : [])
        ],
        status: 'APPROVED'
      }
    });

    const used = approvedLeaves.reduce((acc, curr) => acc + curr.totalDays, 0);
    const total = 24;
    const remaining = Math.max(0, total - used);

    return { total, used, remaining };
  }

  async getPendingLeaves(userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user) throw new NotFoundException('User not found');

    const roleCode = String(user.role?.code || user.role?.name || '').toUpperCase();
    let statusFilter: any = 'PENDING_HR';

    if (roleCode.includes('HR')) {
      statusFilter = 'PENDING_HR';
    } else if (roleCode.includes('PLANT_HEAD') || roleCode.includes('PLANT')) {
      statusFilter = 'PENDING_PLANT_HEAD';
    } else if (roleCode.includes('SUPER_ADMIN') || roleCode.includes('ADMIN')) {
      statusFilter = ['PENDING_HR', 'PENDING_PLANT_HEAD', 'PENDING_SUPER_ADMIN'];
    } else {
      statusFilter = 'PENDING_HR';
    }

    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        companyId: activeCompanyId,
        ...(Array.isArray(statusFilter) ? { status: { in: statusFilter } } : { status: statusFilter })
      },
      include: {
        employee: { select: { fullName: true, employeeCode: true, workEmail: true, user: { select: { name: true, email: true } } } },
        department: { select: { name: true, code: true } },
        approvals: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return leaves;
  }

  async approveLeave(id: string, body: any, userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user) throw new NotFoundException('User not found');

    const roleCode = String(user.role?.code || '').toUpperCase();
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true }
    });
    if (!leave) throw new NotFoundException('Leave request not found');

    let nextStatus: 'PENDING_SUPER_ADMIN' | 'APPROVED' = 'PENDING_SUPER_ADMIN';
    let nextApprover: string | null = 'SUPER_ADMIN';

    if (roleCode.includes('HR')) {
      if (leave.status !== 'PENDING_HR') {
        throw new BadRequestException('Request is not pending HR approval.');
      }
    } else if (roleCode.includes('PLANT')) {
      if (leave.status !== 'PENDING_PLANT_HEAD') {
        throw new BadRequestException('Request is not pending Plant Head approval.');
      }
    } else if (roleCode.includes('SUPER_ADMIN') || roleCode.includes('ADMIN')) {
      if (leave.status !== 'PENDING_SUPER_ADMIN') {
        throw new BadRequestException('Request is not pending Super Admin approval.');
      }
      nextStatus = 'APPROVED';
      nextApprover = null;
    } else {
      throw new ForbiddenException('You do not have permission to approve leaves.');
    }

    // Save approval entry
    await this.prisma.leaveApproval.create({
      data: {
        leaveRequestId: id,
        approverId: userId,
        approverRole: roleCode,
        action: 'APPROVED',
        remarks: body.remarks || 'Approved'
      }
    });

    // Update request
    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: nextStatus,
        currentApprover: nextApprover,
        approvedBy: nextStatus === 'APPROVED' ? user.name : leave.approvedBy,
        approvedAt: nextStatus === 'APPROVED' ? new Date() : leave.approvedAt,
        remarks: body.remarks || leave.remarks
      }
    });

    return updated;
  }

  async rejectLeave(id: string, body: any, userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user) throw new NotFoundException('User not found');

    const roleCode = String(user.role?.code || '').toUpperCase();
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id }
    });
    if (!leave) throw new NotFoundException('Leave request not found');

    // Create reject approval log
    await this.prisma.leaveApproval.create({
      data: {
        leaveRequestId: id,
        approverId: userId,
        approverRole: roleCode,
        action: 'REJECTED',
        remarks: body.remarks || 'Rejected'
      }
    });

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        currentApprover: null,
        remarks: body.remarks || 'Rejected'
      }
    });

    return updated;
  }

  async getAllLeaves(userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const leaves = await this.prisma.leaveRequest.findMany({
      where: { companyId: activeCompanyId },
      include: {
        employee: { select: { fullName: true, employeeCode: true, workEmail: true } },
        department: { select: { name: true, code: true } },
        approvals: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return leaves;
  }
}
