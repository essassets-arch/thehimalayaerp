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

  async applyLeave(body: any, userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user) throw new NotFoundException('User not found');

    const employee = await this.prisma.employee.findFirst({
      where: { userId, companyId: activeCompanyId },
      include: { department: true }
    });

    const employeeId = employee?.id || userId;
    const departmentId = employee?.departmentId || body.departmentId;

    if (!departmentId) {
      throw new BadRequestException('Employee department is not configured.');
    }

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
    const deptCode = String(dept?.code || '').toUpperCase();

    // Sales, Finance -> HR approval
    // Store Dispatch, Production -> Plant Head approval
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
    const employee = await this.prisma.employee.findFirst({
      where: { userId, companyId: activeCompanyId }
    });
    const employeeId = employee?.id || userId;

    const leaves = await this.prisma.leaveRequest.findMany({
      where: { companyId: activeCompanyId, employeeId },
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
    const employee = await this.prisma.employee.findFirst({
      where: { userId, companyId: activeCompanyId }
    });
    const employeeId = employee?.id || userId;

    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        companyId: activeCompanyId,
        employeeId,
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

    const roleCode = String(user.role?.code || '').toUpperCase();
    let statusFilter: any = null;

    if (roleCode.includes('HR')) {
      statusFilter = 'PENDING_HR';
    } else if (roleCode.includes('PLANT_HEAD') || roleCode.includes('PLANT')) {
      statusFilter = 'PENDING_PLANT_HEAD';
    } else if (roleCode.includes('SUPER_ADMIN') || roleCode.includes('ADMIN')) {
      statusFilter = 'PENDING_SUPER_ADMIN';
    } else {
      throw new ForbiddenException('You do not have access to pending leave approvals.');
    }

    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        companyId: activeCompanyId,
        status: statusFilter
      },
      include: {
        employee: { select: { fullName: true, employeeCode: true, workEmail: true } },
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
