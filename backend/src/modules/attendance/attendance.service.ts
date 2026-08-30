import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import { join } from 'path';

// Helper to save base64 image to server disk
function saveBase64Image(base64Str: string, folder: string): string | null {
  if (!base64Str) return null;
  if (!base64Str.startsWith('data:image/')) return base64Str; // already a URL/path

  try {
    const uploadDir = join(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `selfie-${uniqueSuffix}.${ext}`;
    const filePath = join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${folder}/${filename}`;
  } catch (err) {
    console.error('Failed to save base64 image:', err);
    return null;
  }
}

// Helper to get Kolkata timezone date
export function getKolkataDate(date: Date = new Date()): { dateStr: string; startOfDay: Date; endOfDay: Date } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getVal = (type: string) => parts.find(p => p.type === type)?.value || '';

  const year = parseInt(getVal('year'), 10);
  const month = parseInt(getVal('month'), 10) - 1;
  const day = parseInt(getVal('day'), 10);

  const monthStr = (month + 1).toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  const dateStr = `${year}-${monthStr}-${dayStr}`;

  const startOfDay = new Date(`${dateStr}T00:00:00.000+05:30`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999+05:30`);

  return { dateStr, startOfDay, endOfDay };
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to ensure authenticated User has a linked Employee profile
  private async getLinkedEmployeeId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true, role: true },
    });
    if (!user) {
      throw new ForbiddenException('User not found.');
    }
    if (user.employee?.id) {
      return user.employee.id;
    }

    // 1. Check if an employee with the same email already exists and link it
    const existingEmployeeByEmail = await this.prisma.employee.findUnique({
      where: { workEmail: user.email },
    });
    if (existingEmployeeByEmail) {
      const updatedEmployee = await this.prisma.employee.update({
        where: { id: existingEmployeeByEmail.id },
        data: { userId: user.id },
      });
      return updatedEmployee.id;
    }

    // 2. Otherwise auto-create and link Employee profile on-the-fly
    let dept = await this.prisma.department.findFirst({
      where: { companyId: user.companyId, isActive: true },
    });
    if (!dept) {
      dept = await this.prisma.department.create({
        data: {
          code: `DEPT-AUTO-${Date.now()}`,
          name: 'Operations',
          companyId: user.companyId,
          isActive: true,
        },
      });
    }

    let loc = await this.prisma.workLocation.findFirst({
      where: { companyId: user.companyId, isActive: true },
    });
    if (!loc) {
      loc = await this.prisma.workLocation.create({
        data: {
          code: `LOC-AUTO-${Date.now()}`,
          name: 'Ahmedabad Head Office',
          companyId: user.companyId,
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
        companyId: user.companyId,
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

    return createdEmployee.id;
  }

  // Centralized punch-in (Atomic, single source of truth)
  async punchIn(userId: string, companyId: string, body: any) {
    const employeeId = await this.getLinkedEmployeeId(userId);

    const { latitude, longitude, accuracy, address, selfie } = body;

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('Valid GPS coordinates are required');
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid GPS coordinates values.');
    }
    if (!selfie) {
      throw new BadRequestException('Camera selfie verification is required');
    }

    const savedSelfieUrl = saveBase64Image(selfie, 'attendance');
    if (!savedSelfieUrl) {
      throw new BadRequestException('Invalid selfie format');
    }

    if (accuracy !== undefined && accuracy !== null) {
      const accuracyVal = Number(accuracy);
      if (accuracyVal <= 0) {
        throw new BadRequestException('GPS accuracy must be a positive number.');
      }
    }

    const now = new Date();
    const { startOfDay } = getKolkataDate(now);

    // Atomic check: enforce 1 attendance record per employee per day
    const existing = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        attendanceDate: startOfDay,
      },
    });

    if (existing) {
      if (existing.status === 'PUNCHED_IN') {
        throw new ConflictException('ALREADY_PUNCHED_IN: Employee is already punched in today.');
      }
      throw new ConflictException('ALREADY_PUNCHED_IN: Employee has already completed today\'s attendance.');
    }

    // Evaluate Late Minutes based on shift policy
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: { include: { department: true } } },
    });
    const deptName = user?.employee?.department?.name || 'Default';
    const lateMinutes = await this.calculateLateMinutes(now, deptName);

    // Create single daily attendance record
    const attendance = await this.prisma.attendance.create({
      data: {
        companyId,
        userId,
        employeeId,
        attendanceDate: startOfDay,
        status: 'PUNCHED_IN',
        punchInAt: now,
        punchInLatitude: latitude,
        punchInLongitude: longitude,
        punchInAccuracy: accuracy ? Number(accuracy) : null,
        punchInAddress: address || 'Recorded Attendance Location',
        punchInSelfieUrl: savedSelfieUrl,
        lateMinutes,
      },
    });

    return this.mapTodayAttendance(attendance);
  }

  // Centralized punch-out (Atomic)
  async punchOut(userId: string, companyId: string, body: any) {
    const employeeId = await this.getLinkedEmployeeId(userId);

    const { latitude, longitude, accuracy, address, selfie } = body;

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('Valid GPS coordinates are required');
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid GPS coordinates values.');
    }
    if (!selfie) {
      throw new BadRequestException('Camera selfie verification is required');
    }

    const savedSelfieUrl = saveBase64Image(selfie, 'attendance');
    if (!savedSelfieUrl) {
      throw new BadRequestException('Invalid selfie format');
    }

    if (accuracy !== undefined && accuracy !== null) {
      const accuracyVal = Number(accuracy);
      if (accuracyVal <= 0) {
        throw new BadRequestException('GPS accuracy must be a positive number.');
      }
    }

    const now = new Date();
    const { startOfDay } = getKolkataDate(now);

    const existing = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        attendanceDate: startOfDay,
      },
    });

    if (!existing || !existing.punchInAt) {
      throw new ConflictException('NOT_PUNCHED_IN: No active punch-in found for today.');
    }

    if (existing.punchOutAt !== null) {
      throw new ConflictException('ALREADY_PUNCHED_OUT: Today\'s punch out has already been completed.');
    }

    const punchOutAt = now;
    const elapsedMs = punchOutAt.getTime() - new Date(existing.punchInAt).getTime();
    const workedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    const workedMinutes = Math.floor(workedSeconds / 60);

    // Shift Policy Evaluation
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: { include: { department: true } } },
    });
    const deptName = user?.employee?.department?.name || 'Default';
    const policy = await this.getPolicyForDept(deptName);

    // Calculate early exit & overtime
    const earlyExitMinutes = this.calculateEarlyExitMinutes(now, policy.checkOut);
    const overtimeMinutes = workedMinutes > 540 ? workedMinutes - 540 : 0; // Overtime after 9 hours (540 mins)

    // Primary Status: PRESENT if worked >= 8h (480m), HALF_DAY if worked >= 4h (240m)
    let status: 'PRESENT' | 'HALF_DAY' = 'PRESENT';
    if (workedMinutes < 480) {
      status = 'HALF_DAY';
    }

    const updated = await this.prisma.attendance.update({
      where: { id: existing.id },
      data: {
        punchOutAt,
        punchOutLatitude: latitude,
        punchOutLongitude: longitude,
        punchOutAccuracy: accuracy,
        punchOutAddress: address,
        punchOutSelfieUrl: savedSelfieUrl,
        workedSeconds,
        workedMinutes,
        earlyExitMinutes,
        overtimeMinutes,
        status,
      },
    });

    return this.mapTodayAttendance(updated);
  }

  // Get current day's punch status for header/modal
  async getTodayAttendance(userId: string, companyId?: string) {
    try {
      const now = new Date();
      const { startOfDay } = getKolkataDate(now);

      const user = userId ? await this.prisma.user.findUnique({
        where: { id: userId },
        include: { employee: true },
      }) : null;

      const targetCompanyId = companyId || user?.companyId;

      const whereConditions: any[] = [];
      if (userId) whereConditions.push({ userId });
      if (user?.employee?.id) whereConditions.push({ employeeId: user.employee.id });

      if (whereConditions.length === 0) {
        return {
          status: 'NOT_PUNCHED_IN',
          punchInAt: null,
          punchOutAt: null,
          workedSeconds: 0,
          workedMinutes: 0,
          lateMinutes: 0,
          earlyExitMinutes: 0,
          overtimeMinutes: 0,
          isPunchedIn: false,
          isPunchedOut: false,
          punchInTime: null,
          punchOutTime: null,
          lastPhoto: null,
        };
      }

      const record = await this.prisma.attendance.findFirst({
        where: {
          OR: whereConditions,
          ...(targetCompanyId && { companyId: targetCompanyId }),
          attendanceDate: startOfDay,
        },
      });

      if (!record) {
        return {
          status: 'NOT_PUNCHED_IN',
          punchInAt: null,
          punchOutAt: null,
          workedSeconds: 0,
          workedMinutes: 0,
          lateMinutes: 0,
          earlyExitMinutes: 0,
          overtimeMinutes: 0,
          isPunchedIn: false,
          isPunchedOut: false,
          punchInTime: null,
          punchOutTime: null,
          lastPhoto: null,
        };
      }

      return this.mapTodayAttendance(record);
    } catch (err) {
      console.warn('[AttendanceService] getTodayAttendance fallback:', err);
      return {
        status: 'NOT_PUNCHED_IN',
        punchInAt: null,
        punchOutAt: null,
        workedSeconds: 0,
        workedMinutes: 0,
        lateMinutes: 0,
        earlyExitMinutes: 0,
        overtimeMinutes: 0,
        isPunchedIn: false,
        isPunchedOut: false,
        punchInTime: null,
        punchOutTime: null,
        lastPhoto: null,
      };
    }
  }

  // Helper to map record into UI-friendly format
  mapTodayAttendance(record: any) {
    const isPunchedIn = record.status === 'PUNCHED_IN';
    const isPunchedOut = record.punchOutAt !== null;

    const formatTime = (d: Date | null) => {
      if (!d) return null;
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(d));
    };

    let runningSeconds = record.workedSeconds;
    if (isPunchedIn && record.punchInAt) {
      runningSeconds = Math.max(0, Math.floor((new Date().getTime() - new Date(record.punchInAt).getTime()) / 1000));
    }

    return {
      id: record.id,
      status: record.status,
      punchInAt: record.punchInAt,
      punchOutAt: record.punchOutAt,
      workedSeconds: record.workedSeconds || runningSeconds,
      workedMinutes: record.workedMinutes || Math.floor(runningSeconds / 60),
      lateMinutes: record.lateMinutes || 0,
      earlyExitMinutes: record.earlyExitMinutes || 0,
      overtimeMinutes: record.overtimeMinutes || 0,
      isPunchedIn,
      isPunchedOut,
      punchInTime: formatTime(record.punchInAt),
      punchOutTime: formatTime(record.punchOutAt),
      lastPhoto: record.punchOutSelfieUrl || record.punchInSelfieUrl || null,
      punchInAccuracy: record.punchInAccuracy || null,
      punchOutAccuracy: record.punchOutAccuracy || null,
    };
  }

  // Personal history for logged-in user
  async getMyAttendanceHistory(userId: string, companyId: string, query: any) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = { companyId, userId };

    if (query.from || query.to) {
      where.attendanceDate = {};
      if (query.from) where.attendanceDate.gte = getKolkataDate(new Date(query.from)).startOfDay;
      if (query.to) where.attendanceDate.lte = getKolkataDate(new Date(query.to)).endOfDay;
    }

    const [items, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        orderBy: { attendanceDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.attendance.count({ where }),
    ]);

    const mapped = items.map(item => {
      const formatTime = (d: Date | null) => {
        if (!d) return '—';
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(new Date(d));
      };

      const formatDate = (d: Date) => {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(new Date(d));
      };

      const formatDuration = (mins: number, secs: number) => {
        const totalMins = mins || Math.floor(secs / 60);
        if (!totalMins) return '—';
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return `${h}h ${m}m`;
      };

      return {
        id: item.id,
        date: formatDate(item.attendanceDate),
        punchInTime: formatTime(item.punchInAt),
        punchOutTime: formatTime(item.punchOutAt),
        workedDuration: formatDuration(item.workedMinutes, item.workedSeconds),
        workedMinutes: item.workedMinutes,
        lateMinutes: item.lateMinutes,
        earlyExitMinutes: item.earlyExitMinutes,
        overtimeMinutes: item.overtimeMinutes,
        location: item.punchOutAddress || item.punchInAddress || '—',
        coords: item.punchOutLatitude ? `${item.punchOutLatitude}, ${item.punchOutLongitude}` : `${item.punchInLatitude}, ${item.punchInLongitude}`,
        punchInAccuracy: item.punchInAccuracy,
        punchOutAccuracy: item.punchOutAccuracy,
        selfieUrl: item.punchOutSelfieUrl || item.punchInSelfieUrl || null,
        status: item.status,
        timestamp: item.createdAt,
      };
    });

    return { data: mapped, meta: { total, page, limit } };
  }

  // ROSTER-FIRST Company Attendance (HR Roster Dashboard)
  async listCompanyAttendance(companyId: string, query: any) {
    try {
      if (query.mode === 'logs') {
        const parseDate = (d: any) => {
          if (!d) return null;
          if (d === 'today') return new Date();
          const parsed = new Date(d);
          return isNaN(parsed.getTime()) ? null : parsed;
        };
        const fromDate = parseDate(query.from) || parseDate(query.date);
        const toDate = parseDate(query.to) || parseDate(query.date);

        const where: any = { companyId };
        if (fromDate || toDate) {
          where.attendanceDate = {};
          if (fromDate) where.attendanceDate.gte = getKolkataDate(fromDate).startOfDay;
          if (toDate) where.attendanceDate.lte = getKolkataDate(toDate).endOfDay;
        }

        const records = await this.prisma.attendance.findMany({
          where,
          include: {
            employee: {
              include: {
                department: true,
                workLocation: true
              }
            },
            user: {
              include: {
                role: true
              }
            }
          },
          orderBy: { punchInAt: 'desc' }
        });

        return records.map(att => {
          const emp = att.employee;
          const usr = att.user;
          const empName = emp?.fullName || usr?.name || 'Staff Member';
          const empCode = emp?.employeeCode || (usr ? `EMP-${usr.id.slice(0, 5).toUpperCase()}` : '—');
          const deptName = emp?.department?.name || 'Operations';
          const roleName = emp?.jobTitle || usr?.role?.name || (typeof usr?.role === 'string' ? usr.role : 'Staff Member');
          const locationName = emp?.workLocation?.name || 'Ahmedabad Plant';

          const formatTime = (d: Date | null | undefined) => {
            if (!d) return '—';
            return new Intl.DateTimeFormat('en-US', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(new Date(d));
          };

          const formatDate = (d: Date) => {
            return getKolkataDate(d).dateStr;
          };

          const formatDuration = (mins: number) => {
            if (!mins) return '—';
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h}h ${m}m`;
          };

          return {
            id: att.id,
            attendanceId: att.id,
            employeeId: emp?.id || att.employeeId || att.userId,
            employeeCode: empCode,
            employeeName: empName,
            name: empName,
            email: emp?.workEmail || usr?.email || '—',
            department: deptName,
            role: roleName,
            workLocation: locationName,
            date: formatDate(att.attendanceDate),
            punchIn: formatTime(att.punchInAt),
            punchOut: formatTime(att.punchOutAt),
            workedDuration: att.workedMinutes ? formatDuration(att.workedMinutes) : (att.status === 'PUNCHED_IN' ? 'Running' : '—'),
            workedMinutes: att.workedMinutes || 0,
            lateMinutes: att.lateMinutes || 0,
            earlyExitMinutes: att.earlyExitMinutes || 0,
            overtimeMinutes: att.overtimeMinutes || 0,
            status: att.status,
            punchInLocation: att.punchInAddress || locationName,
            location: att.punchInAddress || locationName,
            coords: att.punchOutLatitude ? `${att.punchOutLatitude}, ${att.punchOutLongitude}` : (att.punchInLatitude ? `${att.punchInLatitude}, ${att.punchInLongitude}` : '—'),
            accuracy: att.punchOutAccuracy || att.punchInAccuracy || null,
            selfieUrl: att.punchOutSelfieUrl || att.punchInSelfieUrl || null,
            punchInSelfieUrl: att.punchInSelfieUrl || null,
            punchOutSelfieUrl: att.punchOutSelfieUrl || null,
            timestamp: att.punchInAt?.toISOString() || att.createdAt.toISOString(),
          };
        });
      }

      const targetDate = query.date ? new Date(query.date) : new Date();
      const { startOfDay, endOfDay } = getKolkataDate(targetDate);
      const now = new Date();
      const isToday = getKolkataDate(now).dateStr === getKolkataDate(targetDate).dateStr;

    // 1. Fetch all ACTIVE employees
    const activeEmployees = await this.prisma.employee.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
      },
      include: {
        department: true,
        workLocation: true,
        user: { include: { role: true } },
      },
      orderBy: { fullName: 'asc' },
    });

    // 2. Fetch Attendance DB records for target date
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        companyId,
        attendanceDate: { gte: startOfDay, lte: endOfDay },
      },
    });
    const attendanceMap = new Map(attendanceRecords.map(a => [a.employeeId || a.userId, a]));

    // 3. Fetch Approved Leave Requests covering target date
    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        companyId,
        status: 'APPROVED',
        fromDate: { lte: endOfDay },
        toDate: { gte: startOfDay },
      },
    });
    const leaveMap = new Map(approvedLeaves.map(l => [l.employeeId, l]));

    // 4. Derive Status for each employee (Roster-First)
    let roster = activeEmployees.map(emp => {
      const att = attendanceMap.get(emp.id) || (emp.user ? attendanceMap.get(emp.user.id) : null);
      const leave = leaveMap.get(emp.id);

      const deptName = emp.department?.name || 'Operations';
      const roleName = emp.jobTitle || emp.user?.role?.name || 'Staff Member';
      const locationName = emp.workLocation?.name || 'Ahmedabad Plant';

      const formatTime = (d: Date | null | undefined) => {
        if (!d) return '—';
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(new Date(d));
      };

      const formatDuration = (mins: number) => {
        if (!mins) return '—';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
      };

      // Precedence Order evaluation
      let status = 'NOT_PUNCHED_IN';
      let punchIn = '—';
      let punchOut = '—';
      let workedDuration = '—';
      let workedMinutes = 0;
      let lateMinutes = 0;
      let earlyExitMinutes = 0;
      let overtimeMinutes = 0;
      let selfieUrl: string | null = null;
      let location = locationName;
      let coords = '—';
      let accuracy: number | null = null;

      if (emp.joiningDate && new Date(emp.joiningDate) > endOfDay) {
        status = 'NOT_APPLICABLE';
      } else if (targetDate.getDay() === 0) { // Sunday Weekly Off
        status = 'WEEKLY_OFF';
      } else if (leave) {
        status = leave.leaveType === 'UNPAID' ? 'UNPAID_LEAVE' : 'PAID_LEAVE';
      } else if (att) {
        status = att.status;
        punchIn = formatTime(att.punchInAt);
        punchOut = formatTime(att.punchOutAt);
        workedMinutes = att.workedMinutes;
        workedDuration = att.workedMinutes ? formatDuration(att.workedMinutes) : (att.status === 'PUNCHED_IN' ? 'Running' : '—');
        lateMinutes = att.lateMinutes;
        earlyExitMinutes = att.earlyExitMinutes;
        overtimeMinutes = att.overtimeMinutes;
        selfieUrl = att.punchOutSelfieUrl || att.punchInSelfieUrl || null;
        location = att.punchOutAddress || att.punchInAddress || locationName;
        coords = att.punchOutLatitude ? `${att.punchOutLatitude}, ${att.punchOutLongitude}` : (att.punchInLatitude ? `${att.punchInLatitude}, ${att.punchInLongitude}` : '—');
        accuracy = att.punchOutAccuracy || att.punchInAccuracy || null;
      } else if (isToday) {
        status = 'NOT_PUNCHED_IN';
      } else {
        status = 'ABSENT';
      }

      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        email: emp.workEmail,
        department: deptName,
        role: roleName,
        workLocation: locationName,
        date: getKolkataDate(targetDate).dateStr,
        punchIn,
        punchOut,
        workedDuration,
        workedMinutes,
        lateMinutes,
        earlyExitMinutes,
        overtimeMinutes,
        status,
        punchInLocation: location,
        coords,
        accuracy,
        selfieUrl,
        punchInSelfieUrl: att?.punchInSelfieUrl || null,
        punchOutSelfieUrl: att?.punchOutSelfieUrl || null,
        timestamp: att?.punchInAt?.toISOString() || att?.createdAt?.toISOString() || new Date(targetDate).toISOString(),
      };
    });

    // Filtering
    if (query.department && query.department !== 'all') {
      roster = roster.filter(r => r.department.toLowerCase() === query.department.toLowerCase());
    }
    if (query.status && query.status !== 'all') {
      roster = roster.filter(r => r.status.toUpperCase() === query.status.toUpperCase());
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      roster = roster.filter(
        r =>
          r.employeeName.toLowerCase().includes(s) ||
          r.employeeCode.toLowerCase().includes(s) ||
          r.department.toLowerCase().includes(s) ||
          r.role.toLowerCase().includes(s)
      );
    }

    return roster;
    } catch (err) {
      console.warn('[AttendanceService] listCompanyAttendance fallback:', err);
      return [];
    }
  }

  // Dynamic Attendance Summary for HR Dashboard Top Cards
  async getAttendanceSummary(companyId: string, dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const roster = await this.listCompanyAttendance(companyId, { date: targetDate.toISOString() });

    const totalEmployees = roster.filter(r => r.status !== 'NOT_APPLICABLE').length;
    const present = roster.filter(r => r.status === 'PRESENT' || r.status === 'HALF_DAY').length;
    const currentlyPunchedIn = roster.filter(r => r.status === 'PUNCHED_IN').length;
    const punchedOut = roster.filter(r => (r.status === 'PRESENT' || r.status === 'HALF_DAY') && r.punchOut !== '—').length;
    const absent = roster.filter(r => r.status === 'ABSENT').length;
    const onLeave = roster.filter(r => r.status === 'PAID_LEAVE' || r.status === 'UNPAID_LEAVE').length;
    const halfDay = roster.filter(r => r.status === 'HALF_DAY').length;
    const late = roster.filter(r => r.lateMinutes > 0).length;
    const missingPunchOut = roster.filter(r => r.status === 'MISSING_PUNCH_OUT').length;

    return {
      totalEmployees,
      presentToday: present,
      currentlyPunchedIn,
      punchedOut,
      absent,
      onLeave,
      halfDay,
      late,
      missingPunchOut,
    };
  }

  // Complete Monthly Attendance Breakdown for /hr/employees/:employeeId
  async getEmployeeMonthlyAttendance(employeeId: string, companyIdOrMonthStr?: string, monthStrInput?: string) {
    let companyId: string | undefined;
    let monthStr = monthStrInput;

    if (companyIdOrMonthStr) {
      if (companyIdOrMonthStr.match(/^\d{4}-\d{2}$/)) {
        monthStr = companyIdOrMonthStr;
      } else {
        companyId = companyIdOrMonthStr;
      }
    }

    const emp = await this.prisma.employee.findFirst({
      where: { id: employeeId, ...(companyId ? { companyId } : {}) },
      include: { department: true, workLocation: true },
    });

    if (!emp) {
      throw new NotFoundException(`Employee record not found for ID: ${employeeId}`);
    }

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-indexed

    if (monthStr) {
      const [y, m] = monthStr.split('-').map(Number);
      if (y && m) {
        year = y;
        month = m - 1;
      }
    }

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalCalendarDays = lastDayOfMonth.getDate();

    // Fetch DB attendance records for employee in this month
    const attendances = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        ...(companyId ? { companyId } : {}),
        attendanceDate: {
          gte: getKolkataDate(firstDayOfMonth).startOfDay,
          lte: getKolkataDate(lastDayOfMonth).endOfDay,
        },
      },
    });
    const attMap = new Map(attendances.map(a => [getKolkataDate(a.attendanceDate).dateStr, a]));

    // Fetch Approved Leave Requests in this month
    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId,
        companyId,
        status: 'APPROVED',
        fromDate: { lte: getKolkataDate(lastDayOfMonth).endOfDay },
        toDate: { gte: getKolkataDate(firstDayOfMonth).startOfDay },
      },
    });

    const isLeaveOnDate = (d: Date) => {
      return approvedLeaves.some(l => new Date(l.fromDate) <= d && d <= new Date(l.toDate));
    };

    const joiningDate = emp.joiningDate ? new Date(emp.joiningDate) : firstDayOfMonth;

    let scheduledWorkingDays = 0;
    let elapsedWorkingDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;
    let halfDays = 0;
    let weeklyOffDays = 0;
    let holidayDays = 0;
    let lateArrivals = 0;
    let earlyExits = 0;
    let missingPunchOuts = 0;
    let totalWorkingMinutes = 0;
    let totalOvertimeMinutes = 0;

    const dailyLogs: any[] = [];

    const todayStr = getKolkataDate(now).dateStr;

    for (let day = 1; day <= totalCalendarDays; day++) {
      const curDate = new Date(year, month, day);
      const curCal = getKolkataDate(curDate);
      const dateStr = curCal.dateStr;

      const formatTime = (d: Date | null | undefined) => {
        if (!d) return '—';
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(new Date(d));
      };

      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(curDate);
      const att = attMap.get(dateStr);
      const hasLeave = isLeaveOnDate(curDate);

      let status = 'NOT_PUNCHED_IN';
      let inTime = '—';
      let outTime = '—';
      let hoursStr = '—';

      // Evaluation
      if (curDate < getKolkataDate(joiningDate).startOfDay) {
        status = 'NOT_APPLICABLE';
      } else if (curDate.getDay() === 0) { // Sunday
        status = 'WEEKLY_OFF';
        weeklyOffDays++;
      } else if (hasLeave) {
        status = 'PAID_LEAVE';
        paidLeaveDays++;
        scheduledWorkingDays++;
        if (curDate <= now) elapsedWorkingDays++;
      } else {
        scheduledWorkingDays++;
        if (curDate <= now) elapsedWorkingDays++;

        if (att) {
          status = att.status;
          inTime = formatTime(att.punchInAt);
          outTime = formatTime(att.punchOutAt);
          totalWorkingMinutes += att.workedMinutes || 0;
          totalOvertimeMinutes += att.overtimeMinutes || 0;

          if (att.workedMinutes) {
            const h = Math.floor(att.workedMinutes / 60);
            const m = att.workedMinutes % 60;
            hoursStr = `${h}h ${m}m`;
          }

          if (att.lateMinutes > 0) lateArrivals++;
          if (att.earlyExitMinutes > 0) earlyExits++;

          if (att.status === 'PRESENT') presentDays++;
          else if (att.status === 'HALF_DAY') halfDays++;
          else if (att.status === 'PUNCHED_IN') presentDays++;
          else if (att.status === 'MISSING_PUNCH_OUT') {
            missingPunchOuts++;
            presentDays++;
          }
        } else if (dateStr === todayStr) {
          status = 'NOT_PUNCHED_IN';
        } else if (curDate < now) {
          status = 'ABSENT';
          absentDays++;
        }
      }

      dailyLogs.push({
        date: `${day.toString().padStart(2, '0')} ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(curDate)}`,
        day: dayName,
        in: inTime,
        out: outTime,
        hours: hoursStr,
        status,
        lateMinutes: att?.lateMinutes || 0,
        overtimeMinutes: att?.overtimeMinutes || 0,
      });
    }

    const formatTotalHours = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    };

    return {
      employee: {
        id: emp.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        jobTitle: emp.jobTitle,
        department: emp.department?.name || 'Operations',
        workLocation: emp.workLocation?.name || 'Ahmedabad Plant',
        status: emp.status,
        joiningDate: emp.joiningDate,
      },
      summary: {
        month: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(firstDayOfMonth),
        totalCalendarDays,
        scheduledWorkingDays,
        elapsedWorkingDays,
        presentDays,
        absentDays,
        paidLeaveDays,
        unpaidLeaveDays,
        halfDays,
        weeklyOffDays,
        holidayDays,
        lateArrivals,
        earlyExits,
        missingPunchOuts,
        totalWorkingHours: formatTotalHours(totalWorkingMinutes),
        overtimeHours: formatTotalHours(totalOvertimeMinutes),
      },
      dailyLogs: dailyLogs.reverse(), // most recent first
    };
  }

  // Internal policy helper
  private async getPolicyForDept(deptName: string) {
    let policy = await this.prisma.shiftPolicy.findUnique({ where: { deptName } });
    if (!policy) {
      policy = await this.prisma.shiftPolicy.findUnique({ where: { deptName: 'Default' } });
    }
    return policy || { checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 };
  }

  // Late Minutes calculation helper
  private async calculateLateMinutes(checkInTime: Date, deptName: string): Promise<number> {
    try {
      const policy = await this.getPolicyForDept(deptName);
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });
      const timeStr = formatter.format(checkInTime);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const checkMinutes = hours * 60 + minutes;

      const pMatch = policy.checkIn.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!pMatch) return 0;
      let pHours = parseInt(pMatch[1], 10);
      const pMins = parseInt(pMatch[2], 10);
      const pAmpm = pMatch[3].toUpperCase();
      if (pAmpm === 'PM' && pHours !== 12) pHours += 12;
      if (pAmpm === 'AM' && pHours === 12) pHours = 0;
      const shiftStartMinutes = pHours * 60 + pMins;
      const graceLimitMinutes = shiftStartMinutes + (policy.grace || 15);

      if (checkMinutes > graceLimitMinutes) {
        return checkMinutes - shiftStartMinutes;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  // Early Exit calculation helper
  private calculateEarlyExitMinutes(checkOutTime: Date, policyCheckOut: string): number {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });
      const timeStr = formatter.format(checkOutTime);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const checkMinutes = hours * 60 + minutes;

      const pMatch = policyCheckOut.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!pMatch) return 0;
      let pHours = parseInt(pMatch[1], 10);
      const pMins = parseInt(pMatch[2], 10);
      const pAmpm = pMatch[3].toUpperCase();
      if (pAmpm === 'PM' && pHours !== 12) pHours += 12;
      if (pAmpm === 'AM' && pHours === 12) pHours = 0;
      const shiftEndMinutes = pHours * 60 + pMins;

      if (checkMinutes < shiftEndMinutes) {
        return shiftEndMinutes - checkMinutes;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  // Policy management
  async getAllShiftPolicies() {
    const policies = await this.prisma.shiftPolicy.findMany();
    if (policies.length === 0) {
      const defaults = [
        { deptName: 'HR', checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 },
        { deptName: 'Sales', checkIn: '09:30 AM', checkOut: '06:30 PM', grace: 30 },
        { deptName: 'Production', checkIn: '08:00 AM', checkOut: '05:00 PM', grace: 10 },
        { deptName: 'Finance', checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 },
        { deptName: 'Default', checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 },
      ];
      for (const d of defaults) {
        await this.prisma.shiftPolicy.create({ data: d });
      }
      return this.prisma.shiftPolicy.findMany();
    }
    return policies;
  }

  async saveShiftPolicy(deptName: string, data: any) {
    return this.prisma.shiftPolicy.upsert({
      where: { deptName },
      update: {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        grace: data.grace,
      },
      create: {
        deptName,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        grace: data.grace,
      },
    });
  }

  async clearAll() {
    return this.prisma.attendance.deleteMany();
  }
}

