import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

  // Centralized punch-in
  async punchIn(userId: string, companyId: string, body: any) {
    const { latitude, longitude, accuracy, address, selfie } = body;

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('Valid GPS coordinates are required');
    }
    if (!selfie) {
      throw new BadRequestException('Camera selfie verification is required');
    }

    const savedSelfieUrl = saveBase64Image(selfie, 'attendance');
    if (!savedSelfieUrl) {
      throw new BadRequestException('Invalid selfie format');
    }

    // Get today's local date boundaries in Asia/Kolkata
    const now = new Date();
    const { startOfDay } = getKolkataDate(now);

    // Enforce atomic check: look up today's record
    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        companyId,
        attendanceDate: startOfDay,
      },
    });

    if (existing) {
      if (existing.status === 'PUNCHED_IN' || existing.status === 'LATE') {
        throw new BadRequestException('Employee is already punched in');
      }
      throw new BadRequestException('Employee has already completed today\'s attendance');
    }

    // Fetch user's department to evaluate late policy
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: { include: { department: true } } },
    });
    const deptName = user?.employee?.department?.name || 'Default';
    const status = await this.getPunchStatus(now, deptName);

    // Create daily attendance record
    const attendance = await this.prisma.attendance.create({
      data: {
        companyId,
        userId,
        attendanceDate: startOfDay,
        punchInAt: now,
        punchInLatitude: latitude,
        punchInLongitude: longitude,
        punchInAccuracy: accuracy,
        punchInAddress: address,
        punchInSelfieUrl: savedSelfieUrl,
        status,
      },
    });

    return this.mapTodayAttendance(attendance);
  }

  // Centralized punch-out
  async punchOut(userId: string, companyId: string, body: any) {
    const { latitude, longitude, accuracy, address, selfie } = body;

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('Valid GPS coordinates are required');
    }
    if (!selfie) {
      throw new BadRequestException('Camera selfie verification is required');
    }

    const savedSelfieUrl = saveBase64Image(selfie, 'attendance');
    if (!savedSelfieUrl) {
      throw new BadRequestException('Invalid selfie format');
    }

    const now = new Date();
    const { startOfDay } = getKolkataDate(now);

    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        companyId,
        attendanceDate: startOfDay,
      },
    });

    if (!existing || (existing.status !== 'PUNCHED_IN' && existing.status !== 'LATE')) {
      throw new BadRequestException('No active punch-in found for today');
    }

    const punchOutAt = now;
    const workedSeconds = Math.round((punchOutAt.getTime() - new Date(existing.punchInAt!).getTime()) / 1000);

    // If worked less than 4 hours, mark as HALF_DAY, else PUNCHED_OUT
    let status: 'PUNCHED_OUT' | 'HALF_DAY' = 'PUNCHED_OUT';
    if (workedSeconds < 4 * 3600) {
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
        status,
      },
    });

    return this.mapTodayAttendance(updated);
  }

  // Get current day's punch status for header/modal
  async getTodayAttendance(userId: string, companyId: string) {
    const now = new Date();
    const { startOfDay } = getKolkataDate(now);

    const record = await this.prisma.attendance.findFirst({
      where: {
        userId,
        companyId,
        attendanceDate: startOfDay,
      },
    });

    if (!record) {
      return {
        status: 'NOT_PUNCHED',
        punchInAt: null,
        punchOutAt: null,
        workedSeconds: 0,
        isPunchedIn: false,
        punchInTime: null,
        punchOutTime: null,
        lastPhoto: null,
      };
    }

    return this.mapTodayAttendance(record);
  }

  // Helper to map record into header-friendly format
  mapTodayAttendance(record: any) {
    const isPunchedIn = record.status === 'PUNCHED_IN' || record.status === 'LATE';
    const isPunchedOut = record.status === 'PUNCHED_OUT' || record.status === 'HALF_DAY';

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

    return {
      id: record.id,
      status: record.status,
      punchInAt: record.punchInAt,
      punchOutAt: record.punchOutAt,
      workedSeconds: record.workedSeconds,
      isPunchedIn,
      punchInTime: formatTime(record.punchInAt),
      punchOutTime: formatTime(record.punchOutAt),
      lastPhoto: record.punchOutSelfieUrl || record.punchInSelfieUrl || null,
    };
  }

  // Get punch status for shift policy
  async getPunchStatus(checkInTime: Date, deptName: string = 'Default'): Promise<'PUNCHED_IN' | 'LATE'> {
    try {
      let policy = await this.prisma.shiftPolicy.findUnique({
        where: { deptName },
      });
      if (!policy) {
        policy = await this.prisma.shiftPolicy.findUnique({
          where: { deptName: 'Default' },
        });
      }
      if (!policy) {
        return 'PUNCHED_IN';
      }

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
      if (!pMatch) return 'PUNCHED_IN';
      let pHours = parseInt(pMatch[1], 10);
      const pMins = parseInt(pMatch[2], 10);
      const pAmpm = pMatch[3].toUpperCase();
      if (pAmpm === 'PM' && pHours !== 12) pHours += 12;
      if (pAmpm === 'AM' && pHours === 12) pHours = 0;
      const shiftStartMinutes = pHours * 60 + pMins;
      const graceLimitMinutes = shiftStartMinutes + policy.grace;

      if (checkMinutes > graceLimitMinutes) {
        return 'LATE';
      }
      return 'PUNCHED_IN';
    } catch (e) {
      return 'PUNCHED_IN';
    }
  }

  // Personal history
  async getMyAttendanceHistory(userId: string, companyId: string, query: any) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = { companyId, userId };

    if (query.from || query.to) {
      where.attendanceDate = {};
      if (query.from) where.attendanceDate.gte = new Date(query.from);
      if (query.to) where.attendanceDate.lte = new Date(query.to);
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

    // Format fields for frontend display
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

      const formatDuration = (secs: number) => {
        if (!secs) return '—';
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h}h ${m}m ${s}s`;
      };

      return {
        id: item.id,
        date: formatDate(item.attendanceDate),
        punchInTime: formatTime(item.punchInAt),
        punchOutTime: formatTime(item.punchOutAt),
        workedDuration: formatDuration(item.workedSeconds),
        location: item.punchOutAddress || item.punchInAddress || '—',
        coords: item.punchOutLatitude ? `${item.punchOutLatitude}, ${item.punchOutLongitude}` : `${item.punchInLatitude}, ${item.punchInLongitude}`,
        selfieUrl: item.punchOutSelfieUrl || item.punchInSelfieUrl || null,
        status: item.status === 'LATE' ? 'Late' : item.status === 'HALF_DAY' ? 'Half Day' : item.status === 'PUNCHED_IN' ? 'Punched In' : item.status === 'PRESENT' ? 'Present' : item.status === 'PUNCHED_OUT' ? 'Verified' : item.status,
        timestamp: item.createdAt,
      };
    });

    return { data: mapped, meta: { total, page, limit } };
  }

  // Company management (HR/Super Admin)
  async listCompanyAttendance(companyId: string, query: any) {
    const where: any = { companyId };

    if (query.datePeriod) {
      const now = new Date();
      const { startOfDay, endOfDay } = getKolkataDate(now);

      if (query.datePeriod === 'today') {
        where.attendanceDate = { gte: startOfDay, lte: endOfDay };
      } else if (query.datePeriod === 'yesterday') {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const yCal = getKolkataDate(yesterday);
        where.attendanceDate = { gte: yCal.startOfDay, lte: yCal.endOfDay };
      } else if (query.datePeriod === 'this_week') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        const monCal = getKolkataDate(monday);
        where.attendanceDate = { gte: monCal.startOfDay, lte: endOfDay };
      } else if (query.datePeriod === 'this_month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const fCal = getKolkataDate(firstDay);
        where.attendanceDate = { gte: fCal.startOfDay, lte: endOfDay };
      } else if (query.datePeriod === 'custom' && query.from && query.to) {
        const fromCal = getKolkataDate(new Date(query.from));
        const toCal = getKolkataDate(new Date(query.to));
        where.attendanceDate = { gte: fromCal.startOfDay, lte: toCal.endOfDay };
      }
    }

    if (query.status && query.status !== 'all') {
      where.status = query.status.toUpperCase();
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: {
        user: {
          include: {
            role: true,
            employee: {
              include: {
                department: true,
              },
            },
          },
        },
      },
      orderBy: { attendanceDate: 'desc' },
    });

    let mapped = attendances.map(a => {
      const u = a.user;
      const emp = u.employee;
      const deptName = emp?.department?.name || 'Operations';
      const roleName = emp?.jobTitle || u.role?.name || 'Staff Member';
      const fullName = emp?.fullName || u.name;
      const email = emp?.workEmail || u.email;
      const empCode = emp?.employeeCode || 'EMP-MOCK-001';

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

      const formatDuration = (secs: number) => {
        if (!secs) return '—';
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        return `${h}h ${m}m`;
      };

      return {
        id: a.id,
        employeeCode: empCode,
        employeeName: fullName,
        email: email,
        department: deptName,
        role: roleName,
        date: formatDate(a.attendanceDate),
        punchIn: formatTime(a.punchInAt),
        punchOut: formatTime(a.punchOutAt),
        workedDuration: formatDuration(a.workedSeconds),
        status: a.status === 'LATE' ? 'Late' : a.status === 'HALF_DAY' ? 'Half Day' : a.status === 'PUNCHED_IN' ? 'Punched In' : a.status === 'PRESENT' ? 'Present' : a.status === 'PUNCHED_OUT' ? 'Verified' : a.status,
        punchInLocation: a.punchInAddress || '—',
        punchOutLocation: a.punchOutAddress || '—',
        coords: a.punchOutLatitude ? `${a.punchOutLatitude}, ${a.punchOutLongitude}` : `${a.punchInLatitude}, ${a.punchInLongitude}`,
        selfieUrl: a.punchOutSelfieUrl || a.punchInSelfieUrl || null,
        timestamp: a.createdAt,
      };
    });

    if (query.department && query.department !== 'all') {
      mapped = mapped.filter(a => a.department.toLowerCase() === query.department.toLowerCase());
    }

    if (query.search) {
      const s = query.search.toLowerCase();
      mapped = mapped.filter(
        a =>
          a.employeeName.toLowerCase().includes(s) ||
          a.email.toLowerCase().includes(s) ||
          a.employeeCode.toLowerCase().includes(s) ||
          a.department.toLowerCase().includes(s) ||
          a.role.toLowerCase().includes(s)
      );
    }

    return mapped;
  }

  // Dynamic dashboard summary
  async getAttendanceSummary(companyId: string) {
    const now = new Date();
    const { startOfDay, endOfDay } = getKolkataDate(now);

    const totalEmployees = await this.prisma.user.count({
      where: { companyId, isActive: true },
    });

    const todayAttendances = await this.prisma.attendance.findMany({
      where: {
        companyId,
        attendanceDate: { gte: startOfDay, lte: endOfDay },
      },
    });

    const presentToday = todayAttendances.filter(a => a.status !== 'NOT_PUNCHED' && a.status !== 'ABSENT').length;
    const currentlyPunchedIn = todayAttendances.filter(a => a.status === 'PUNCHED_IN' || a.status === 'LATE').length;
    const punchedOut = todayAttendances.filter(a => a.status === 'PUNCHED_OUT' || a.status === 'HALF_DAY').length;
    const late = todayAttendances.filter(a => a.status === 'LATE').length;
    const absent = Math.max(0, totalEmployees - presentToday);

    return {
      totalEmployees,
      presentToday,
      currentlyPunchedIn,
      punchedOut,
      absent,
      late,
    };
  }

  // Get specific attendance by id
  async getAttendanceById(companyId: string, id: string) {
    const a = await this.prisma.attendance.findFirst({
      where: { id, companyId },
      include: {
        user: {
          include: {
            role: true,
            employee: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    });

    if (!a) {
      throw new NotFoundException('Attendance record not found');
    }

    const u = a.user;
    const emp = u.employee;
    const deptName = emp?.department?.name || 'Operations';
    const roleName = emp?.jobTitle || u.role?.name || 'Staff Member';
    const fullName = emp?.fullName || u.name;
    const email = emp?.workEmail || u.email;
    const empCode = emp?.employeeCode || 'EMP-MOCK-001';

    const formatTime = (d: Date | null) => {
      if (!d) return '—';
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
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

    const formatDuration = (secs: number) => {
      if (!secs) return '—';
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return `${h}h ${m}m ${s}s`;
    };

    return {
      id: a.id,
      employeeCode: empCode,
      employeeName: fullName,
      email: email,
      department: deptName,
      role: roleName,
      date: formatDate(a.attendanceDate),
      punchInTime: formatTime(a.punchInAt),
      punchOutTime: formatTime(a.punchOutAt),
      workedDuration: formatDuration(a.workedSeconds),
      status: a.status === 'LATE' ? 'Late' : a.status === 'HALF_DAY' ? 'Half Day' : a.status === 'PUNCHED_IN' ? 'Punched In' : a.status === 'PRESENT' ? 'Present' : a.status === 'PUNCHED_OUT' ? 'Verified' : a.status,
      punchInEvidence: {
        selfie: a.punchInSelfieUrl || null,
        location: a.punchInAddress || '—',
        coords: a.punchInLatitude ? `${a.punchInLatitude}, ${a.punchInLongitude}` : '—',
        accuracy: a.punchInAccuracy || 0,
        timestamp: a.punchInAt ? a.punchInAt.toISOString() : '—',
      },
      punchOutEvidence: {
        selfie: a.punchOutSelfieUrl || null,
        location: a.punchOutAddress || '—',
        coords: a.punchOutLatitude ? `${a.punchOutLatitude}, ${a.punchOutLongitude}` : '—',
        accuracy: a.punchOutAccuracy || 0,
        timestamp: a.punchOutAt ? a.punchOutAt.toISOString() : '—',
      },
    };
  }

  // Legacy compatibility policies
  async getAllShiftPolicies() {
    const policies = await this.prisma.shiftPolicy.findMany();
    if (policies.length === 0) {
      const defaults = [
        { deptName: 'HR', checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 },
        { deptName: 'Sales', checkIn: '09:30 AM', checkOut: '06:30 PM', grace: 30 },
        { deptName: 'Production', checkIn: '08:00 AM', checkOut: '05:00 PM', grace: 10 },
        { deptName: 'Finance', checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 },
        { deptName: 'Default', checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 }
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
}
