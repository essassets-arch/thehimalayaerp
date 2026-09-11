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
    const uploadRoot = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    const uploadDir = join(uploadRoot, folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `selfie-${uniqueSuffix}.${ext}`;
    const filePath = join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    // Also mirror to frontend/public/uploads if running locally
    try {
      const frontendDir = join(process.cwd(), '..', 'frontend', 'public', 'uploads', folder);
      if (fs.existsSync(join(process.cwd(), '..', 'frontend', 'public'))) {
        if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir, { recursive: true });
        fs.writeFileSync(join(frontendDir, filename), buffer);
      }
    } catch {
      // Non-fatal if frontend directory not writable
    }

    return `/uploads/${folder}/${filename}`;
  } catch (err) {
    console.error('Failed to save base64 image:', err);
    return null;
  }
}

// Helper to get Kolkata timezone date
export function getKolkataDate(date: Date = new Date()): {
  dateStr: string;
  startOfDay: Date;
  endOfDay: Date;
} {
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
  const getVal = (type: string) =>
    parts.find((p) => p.type === type)?.value || '';

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

  // Cache for Google Maps reverse geocoding to prevent repetitive API calls: grid of ~100m (3 decimal places)
  private geocodeCache = new Map<string, string>();

  async reverseGeocode(
    latitude: number,
    longitude: number,
    accuracy?: number | null,
  ): Promise<string> {
    if (
      latitude === undefined ||
      longitude === undefined ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return '—';
    }

    const latFixed = Number(latitude).toFixed(4);
    const lngFixed = Number(longitude).toFixed(4);
    const cacheKey = `${Number(latitude).toFixed(3)},${Number(longitude).toFixed(3)}`;

    if (this.geocodeCache.has(cacheKey)) {
      return this.geocodeCache.get(cacheKey)!;
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      '';

    const honestCoordFallback =
      accuracy != null && accuracy > 0
        ? `${latFixed}, ${lngFixed} (Accuracy: ±${Math.round(accuracy)}m)`
        : `${latFixed}, ${lngFixed}`;

    if (!apiKey) {
      this.geocodeCache.set(cacheKey, honestCoordFallback);
      return honestCoordFallback;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const formatted = data.results[0].formatted_address;
          if (formatted && formatted.trim()) {
            this.geocodeCache.set(cacheKey, formatted.trim());
            return formatted.trim();
          }
        }
      }
    } catch (err: any) {
      console.warn(
        '[AttendanceService] Google Maps Geocoding error:',
        err?.message || err,
      );
    }

    this.geocodeCache.set(cacheKey, honestCoordFallback);
    return honestCoordFallback;
  }

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

    const { latitude, longitude, accuracy, address } = body;
    const selfie = body.selfie || body.selfieUrl;

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('Valid GPS coordinates are required');
    }
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new BadRequestException('Invalid GPS coordinates values.');
    }
    if (!selfie) {
      throw new BadRequestException('Camera selfie verification is required');
    }

    const isTestMode =
      process.env.ATTENDANCE_TEST_MODE === 'true' ||
      body.isTestMode === true ||
      body.testMode === true;

    if (!isTestMode && body.isBiometricCard) {
      throw new BadRequestException(
        'Biometric security card fallback is not permitted in production. Live camera selfie is mandatory.',
      );
    }

    if (!isTestMode && body.isGpsFallback === true) {
      throw new BadRequestException(
        'GPS Fallback / Default coordinates are not permitted in production. Live GPS lock is required.',
      );
    }

    const savedSelfieUrl = saveBase64Image(selfie, 'attendance');
    if (!savedSelfieUrl) {
      throw new BadRequestException('Invalid selfie format');
    }

    if (accuracy !== undefined && accuracy !== null) {
      const accuracyVal = Number(accuracy);
      if (isNaN(accuracyVal) || accuracyVal <= 0) {
        throw new BadRequestException(
          'GPS accuracy must be a positive number.',
        );
      }
      if (!isTestMode && accuracyVal > 500) {
        throw new BadRequestException(
          'GPS accuracy too low (> 500m). Please move to an open area with clear GPS reception.',
        );
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
        throw new ConflictException(
          'ALREADY_PUNCHED_IN: Employee is already punched in today.',
        );
      }
      throw new ConflictException(
        "ALREADY_PUNCHED_IN: Employee has already completed today's attendance.",
      );
    }

    // Evaluate Late Minutes based on shift policy
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: { include: { department: true } } },
    });
    const deptName = user?.employee?.department?.name || 'Default';
    const lateMinutes = await this.calculateLateMinutes(now, deptName);

    // Resolve real device address via Google Maps Geocoding integration
    const resolvedAddress =
      address &&
      address.trim() &&
      !address.includes('Factory Campus') &&
      !address.includes('Network Location') &&
      !address.includes('GPS Fallback')
        ? address.trim()
        : await this.reverseGeocode(latitude, longitude, accuracy);

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
        punchInAddress: resolvedAddress,
        punchInSelfieUrl: savedSelfieUrl,
        lateMinutes,
      },
    });

    return this.mapTodayAttendance(attendance);
  }

  // Centralized punch-out (Atomic)
  async punchOut(userId: string, companyId: string, body: any) {
    const employeeId = await this.getLinkedEmployeeId(userId);

    const { latitude, longitude, accuracy, address } = body;
    const selfie = body.selfie || body.selfieUrl;

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('Valid GPS coordinates are required');
    }
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new BadRequestException('Invalid GPS coordinates values.');
    }
    if (!selfie) {
      throw new BadRequestException('Camera selfie verification is required');
    }

    const isTestMode =
      process.env.ATTENDANCE_TEST_MODE === 'true' ||
      body.isTestMode === true ||
      body.testMode === true;

    if (!isTestMode && body.isBiometricCard) {
      throw new BadRequestException(
        'Biometric security card fallback is not permitted in production. Live camera selfie is mandatory.',
      );
    }

    if (!isTestMode && body.isGpsFallback === true) {
      throw new BadRequestException(
        'GPS Fallback / Default coordinates are not permitted in production. Live GPS lock is required.',
      );
    }

    const savedSelfieUrl = saveBase64Image(selfie, 'attendance');
    if (!savedSelfieUrl) {
      throw new BadRequestException('Invalid selfie format');
    }

    if (accuracy !== undefined && accuracy !== null) {
      const accuracyVal = Number(accuracy);
      if (isNaN(accuracyVal) || accuracyVal <= 0) {
        throw new BadRequestException(
          'GPS accuracy must be a positive number.',
        );
      }
      if (!isTestMode && accuracyVal > 500) {
        throw new BadRequestException(
          'GPS accuracy too low (> 500m). Please move to an open area with clear GPS reception.',
        );
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
      throw new ConflictException(
        'NOT_PUNCHED_IN: No active punch-in found for today.',
      );
    }

    if (existing.punchOutAt !== null) {
      throw new ConflictException(
        "ALREADY_PUNCHED_OUT: Today's punch out has already been completed.",
      );
    }

    const punchOutAt = now;
    const elapsedMs =
      punchOutAt.getTime() - new Date(existing.punchInAt).getTime();
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
    const earlyExitMinutes = this.calculateEarlyExitMinutes(
      now,
      policy.checkOut,
    );
    const overtimeMinutes = workedMinutes > 540 ? workedMinutes - 540 : 0; // Overtime after 9 hours (540 mins)

    // Primary Status: PRESENT if worked >= 8h (480m), HALF_DAY if worked >= 4h (240m)
    let status: 'PRESENT' | 'HALF_DAY' = 'PRESENT';
    if (workedMinutes < 480) {
      status = 'HALF_DAY';
    }

    // Fresh independent Google Maps Geocoding for punch out location
    const resolvedAddress =
      address &&
      address.trim() &&
      !address.includes('Factory Campus') &&
      !address.includes('Network Location') &&
      !address.includes('GPS Fallback')
        ? address.trim()
        : await this.reverseGeocode(latitude, longitude, accuracy);

    const updated = await this.prisma.attendance.update({
      where: { id: existing.id },
      data: {
        punchOutAt,
        punchOutLatitude: latitude,
        punchOutLongitude: longitude,
        punchOutAccuracy: accuracy ? Number(accuracy) : null,
        punchOutAddress: resolvedAddress,
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

      const user = userId
        ? await this.prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true },
          })
        : null;

      const targetCompanyId = companyId || user?.companyId;

      const whereConditions: any[] = [];
      if (userId) whereConditions.push({ userId });
      if (user?.employee?.id)
        whereConditions.push({ employeeId: user.employee.id });

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

    const formatDate = (d: Date | null) => {
      if (!d) return null;
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(d));
    };

    const formatDurationHms = (totalSecs: number) => {
      if (!totalSecs || totalSecs <= 0) return '00h 00m 00s';
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    };

    const formatElapsedHm = (d: Date) => {
      const elapsedSecs = Math.max(
        0,
        Math.floor((Date.now() - new Date(d).getTime()) / 1000),
      );
      const h = Math.floor(elapsedSecs / 3600);
      const m = Math.floor((elapsedSecs % 3600) / 60);
      return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
    };

    let runningSeconds = record.workedSeconds || 0;
    if (isPunchedIn && record.punchInAt) {
      runningSeconds = Math.max(
        0,
        Math.floor(
          (new Date().getTime() - new Date(record.punchInAt).getTime()) / 1000,
        ),
      );
    }

    const inCoords =
      record.punchInLatitude != null && record.punchInLongitude != null
        ? `${Number(record.punchInLatitude).toFixed(4)}, ${Number(record.punchInLongitude).toFixed(4)}`
        : null;
    const outCoords =
      record.punchOutLatitude != null && record.punchOutLongitude != null
        ? `${Number(record.punchOutLatitude).toFixed(4)}, ${Number(record.punchOutLongitude).toFixed(4)}`
        : null;

    let workedDuration = '—';
    if (isPunchedOut && record.workedSeconds > 0) {
      workedDuration = formatDurationHms(record.workedSeconds);
    } else if (isPunchedIn && record.punchInAt) {
      workedDuration = formatElapsedHm(record.punchInAt);
    }

    return {
      id: record.id,
      status: record.status,
      punchInAt: record.punchInAt,
      punchOutAt: record.punchOutAt,
      workedSeconds: record.workedSeconds || runningSeconds,
      totalWorkingSeconds: record.workedSeconds || runningSeconds,
      workedMinutes: record.workedMinutes || Math.floor(runningSeconds / 60),
      workedDuration,
      lateMinutes: record.lateMinutes || 0,
      earlyExitMinutes: record.earlyExitMinutes || 0,
      overtimeMinutes: record.overtimeMinutes || 0,
      isPunchedIn,
      isPunchedOut,
      punchInTime: formatTime(record.punchInAt),
      punchInDate: formatDate(record.punchInAt),
      punchInAddress: record.punchInAddress || inCoords || null,
      punchInLatitude: record.punchInLatitude ? Number(record.punchInLatitude) : null,
      punchInLongitude: record.punchInLongitude ? Number(record.punchInLongitude) : null,
      punchInCoords: inCoords,
      punchInAccuracy: record.punchInAccuracy != null ? Math.round(record.punchInAccuracy) : null,
      punchInSelfieUrl: record.punchInSelfieUrl || null,
      punchOutTime: formatTime(record.punchOutAt),
      punchOutDate: formatDate(record.punchOutAt),
      punchOutAddress: record.punchOutAddress || outCoords || null,
      punchOutLatitude: record.punchOutLatitude ? Number(record.punchOutLatitude) : null,
      punchOutLongitude: record.punchOutLongitude ? Number(record.punchOutLongitude) : null,
      punchOutCoords: outCoords,
      punchOutAccuracy: record.punchOutAccuracy != null ? Math.round(record.punchOutAccuracy) : null,
      punchOutSelfieUrl: record.punchOutSelfieUrl || null,
      lastPhoto: record.punchOutSelfieUrl || record.punchInSelfieUrl || null,
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
      if (query.from)
        where.attendanceDate.gte = getKolkataDate(
          new Date(query.from),
        ).startOfDay;
      if (query.to)
        where.attendanceDate.lte = getKolkataDate(new Date(query.to)).endOfDay;
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

    const mapped = items.map((item) => {
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

      const formatEventDate = (d: Date | null) => {
        if (!d) return null;
        return new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Kolkata',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(d));
      };

      const formatDurationHms = (totalSecs: number) => {
        if (!totalSecs || totalSecs <= 0) return '—';
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
      };

      const formatElapsedHm = (d: Date) => {
        const elapsedSecs = Math.max(
          0,
          Math.floor((Date.now() - new Date(d).getTime()) / 1000),
        );
        const h = Math.floor(elapsedSecs / 3600);
        const m = Math.floor((elapsedSecs % 3600) / 60);
        return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
      };

      const inCoords =
        item.punchInLatitude != null && item.punchInLongitude != null
          ? `${Number(item.punchInLatitude).toFixed(4)}, ${Number(item.punchInLongitude).toFixed(4)}`
          : null;
      const outCoords =
        item.punchOutLatitude != null && item.punchOutLongitude != null
          ? `${Number(item.punchOutLatitude).toFixed(4)}, ${Number(item.punchOutLongitude).toFixed(4)}`
          : null;

      const isOut = !!item.punchOutAt;
      const isIn = !!item.punchInAt && !isOut;

      let workedDuration = '—';
      if (isOut && item.workedSeconds > 0) {
        workedDuration = formatDurationHms(item.workedSeconds);
      } else if (isIn && item.punchInAt) {
        workedDuration = formatElapsedHm(item.punchInAt);
      }

      return {
        id: item.id,
        date: formatDate(item.attendanceDate),
        punchInAt: item.punchInAt,
        punchOutAt: item.punchOutAt,
        punchInTime: formatTime(item.punchInAt),
        punchInDate: formatEventDate(item.punchInAt),
        punchOutTime: formatTime(item.punchOutAt),
        punchOutDate: formatEventDate(item.punchOutAt),
        workedDuration,
        workedSeconds: item.workedSeconds,
        totalWorkingSeconds: item.workedSeconds,
        workedMinutes: item.workedMinutes,
        lateMinutes: item.lateMinutes,
        earlyExitMinutes: item.earlyExitMinutes,
        overtimeMinutes: item.overtimeMinutes,
        punchInAddress: item.punchInAddress || inCoords || '—',
        punchOutAddress: item.punchOutAddress || outCoords || '—',
        punchInCoords: inCoords || '—',
        punchOutCoords: outCoords || '—',
        location: item.punchOutAddress || item.punchInAddress || outCoords || inCoords || '—',
        coords: outCoords || inCoords || '—',
        accuracy: item.punchOutAccuracy || item.punchInAccuracy,
        punchInAccuracy: item.punchInAccuracy != null ? Math.round(item.punchInAccuracy) : null,
        punchOutAccuracy: item.punchOutAccuracy != null ? Math.round(item.punchOutAccuracy) : null,
        selfieUrl: item.punchOutSelfieUrl || item.punchInSelfieUrl || null,
        punchInSelfieUrl: item.punchInSelfieUrl || null,
        punchOutSelfieUrl: item.punchOutSelfieUrl || null,
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
          if (d === 'yesterday') return new Date(Date.now() - 24 * 60 * 60 * 1000);
          const parsed = new Date(d);
          return isNaN(parsed.getTime()) ? null : parsed;
        };
        const fromDate = parseDate(query.from) || parseDate(query.date);
        const toDate = parseDate(query.to) || parseDate(query.date);

        const where: any = { companyId };
        if (fromDate || toDate) {
          where.attendanceDate = {};
          if (fromDate)
            where.attendanceDate.gte = getKolkataDate(fromDate).startOfDay;
          if (toDate)
            where.attendanceDate.lte = getKolkataDate(toDate).endOfDay;
        }

        let records = await this.prisma.attendance.findMany({
          where,
          include: {
            employee: {
              include: {
                department: true,
                workLocation: true,
              },
            },
            user: {
              include: {
                role: true,
              },
            },
          },
          orderBy: { punchInAt: 'desc' },
        });

        if (records.length === 0 && companyId) {
          const fallbackWhere = { ...where };
          delete fallbackWhere.companyId;
          records = await this.prisma.attendance.findMany({
            where: fallbackWhere,
            include: {
              employee: {
                include: {
                  department: true,
                  workLocation: true,
                },
              },
              user: {
                include: {
                  role: true,
                },
              },
            },
            orderBy: { punchInAt: 'desc' },
          });
        }

        return records.map((att) => {
          const emp = att.employee;
          const usr = att.user;
          const empName = emp?.fullName || usr?.name || 'Staff Member';
          const empCode =
            emp?.employeeCode ||
            (usr ? `EMP-${usr.id.slice(0, 5).toUpperCase()}` : '—');
          const deptName = emp?.department?.name || 'Operations';
          const roleName =
            emp?.jobTitle ||
            usr?.role?.name ||
            (typeof usr?.role === 'string' ? usr.role : 'Staff Member');
          const locationName = emp?.workLocation?.name || 'Main Office';

          const formatTime = (d: Date | null | undefined) => {
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
            return getKolkataDate(d).dateStr;
          };

          const formatEventDate = (d: Date | null | undefined) => {
            if (!d) return null;
            return new Intl.DateTimeFormat('en-GB', {
              timeZone: 'Asia/Kolkata',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(new Date(d));
          };

          const formatDurationHms = (totalSecs: number) => {
            if (!totalSecs || totalSecs <= 0) return '—';
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            const s = totalSecs % 60;
            return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
          };

          const formatElapsedHm = (d: Date) => {
            const elapsedSecs = Math.max(
              0,
              Math.floor((Date.now() - new Date(d).getTime()) / 1000),
            );
            const h = Math.floor(elapsedSecs / 3600);
            const m = Math.floor((elapsedSecs % 3600) / 60);
            return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
          };

          const inCoords =
            att.punchInLatitude != null && att.punchInLongitude != null
              ? `${Number(att.punchInLatitude).toFixed(4)}, ${Number(att.punchInLongitude).toFixed(4)}`
              : null;
          const outCoords =
            att.punchOutLatitude != null && att.punchOutLongitude != null
              ? `${Number(att.punchOutLatitude).toFixed(4)}, ${Number(att.punchOutLongitude).toFixed(4)}`
              : null;

          const isOut = !!att.punchOutAt;
          const isIn = !!att.punchInAt && !isOut;

          let workedDuration = '—';
          if (isOut && att.workedSeconds > 0) {
            workedDuration = formatDurationHms(att.workedSeconds);
          } else if (isIn && att.punchInAt) {
            workedDuration = formatElapsedHm(att.punchInAt);
          }

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
            punchInAt: att.punchInAt?.toISOString() || null,
            punchInTime: formatTime(att.punchInAt),
            punchInDate: formatEventDate(att.punchInAt) || formatDate(att.attendanceDate),
            punchInAddress: att.punchInAddress || inCoords || '—',
            punchInLocation: att.punchInAddress || inCoords || '—',
            punchInCoords: inCoords || '—',
            punchInLatitude: att.punchInLatitude ? Number(att.punchInLatitude) : null,
            punchInLongitude: att.punchInLongitude ? Number(att.punchInLongitude) : null,
            punchInAccuracy: att.punchInAccuracy != null ? Math.round(att.punchInAccuracy) : null,
            punchInSelfieUrl: att.punchInSelfieUrl || null,
            punchOutAt: att.punchOutAt?.toISOString() || null,
            punchOutTime: formatTime(att.punchOutAt),
            punchOutDate: formatEventDate(att.punchOutAt),
            punchOutAddress: att.punchOutAddress || outCoords || '—',
            punchOutLocation: att.punchOutAddress || outCoords || '—',
            punchOutCoords: outCoords || '—',
            punchOutLatitude: att.punchOutLatitude ? Number(att.punchOutLatitude) : null,
            punchOutLongitude: att.punchOutLongitude ? Number(att.punchOutLongitude) : null,
            punchOutAccuracy: att.punchOutAccuracy != null ? Math.round(att.punchOutAccuracy) : null,
            punchOutSelfieUrl: att.punchOutSelfieUrl || null,
            workedDuration,
            workedSeconds: att.workedSeconds || 0,
            totalWorkingSeconds: att.workedSeconds || 0,
            workedMinutes: att.workedMinutes || 0,
            lateMinutes: att.lateMinutes || 0,
            earlyExitMinutes: att.earlyExitMinutes || 0,
            overtimeMinutes: att.overtimeMinutes || 0,
            status: att.status,
            location: att.punchOutAddress || att.punchInAddress || outCoords || inCoords || '—',
            coords: outCoords || inCoords || '—',
            accuracy: att.punchOutAccuracy || att.punchInAccuracy || null,
            selfieUrl: att.punchOutSelfieUrl || att.punchInSelfieUrl || null,
            timestamp:
              att.punchInAt?.toISOString() || att.createdAt.toISOString(),
          };
        });
      }

      const targetDate = query.date ? new Date(query.date) : new Date();
      const { startOfDay, endOfDay } = getKolkataDate(targetDate);
      const now = new Date();
      const isToday =
        getKolkataDate(now).dateStr === getKolkataDate(targetDate).dateStr;

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
      const attendanceMap = new Map(
        attendanceRecords.map((a) => [a.employeeId || a.userId, a]),
      );

      // 3. Fetch Approved Leave Requests covering target date
      const approvedLeaves = await this.prisma.leaveRequest.findMany({
        where: {
          companyId,
          status: 'APPROVED',
          fromDate: { lte: endOfDay },
          toDate: { gte: startOfDay },
        },
      });
      const leaveMap = new Map(approvedLeaves.map((l) => [l.employeeId, l]));

      // 4. Derive Status for each employee (Roster-First)
      let roster = activeEmployees.map((emp) => {
        const att =
          attendanceMap.get(emp.id) ||
          (emp.user ? attendanceMap.get(emp.user.id) : null);
        const leave = leaveMap.get(emp.id);

        const deptName = emp.department?.name || 'Operations';
        const roleName = emp.jobTitle || emp.user?.role?.name || 'Staff Member';
        const locationName = emp.workLocation?.name || 'Main Office';

        const formatTime = (d: Date | null | undefined) => {
          if (!d) return '—';
          return new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }).format(new Date(d));
        };

        const formatEventDate = (d: Date | null | undefined) => {
          if (!d) return null;
          return new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }).format(new Date(d));
        };

        const formatDurationHms = (totalSecs: number) => {
          if (!totalSecs || totalSecs <= 0) return '—';
          const h = Math.floor(totalSecs / 3600);
          const m = Math.floor((totalSecs % 3600) / 60);
          const s = totalSecs % 60;
          return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
        };

        const formatElapsedHm = (d: Date) => {
          const elapsedSecs = Math.max(
            0,
            Math.floor((Date.now() - new Date(d).getTime()) / 1000),
          );
          const h = Math.floor(elapsedSecs / 3600);
          const m = Math.floor((elapsedSecs % 3600) / 60);
          return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
        };

        // Precedence Order evaluation
        let status = 'NOT_PUNCHED_IN';
        let punchIn = '—';
        let punchOut = '—';
        let workedDuration = '—';
        let workedMinutes = 0;
        let workedSeconds = 0;
        let lateMinutes = 0;
        let earlyExitMinutes = 0;
        let overtimeMinutes = 0;
        let selfieUrl: string | null = null;
        let punchInAddress = '—';
        let punchOutAddress = '—';
        let inCoords: string | null = null;
        let outCoords: string | null = null;
        let coords = '—';
        let accuracy: number | null = null;

        if (emp.joiningDate && new Date(emp.joiningDate) > endOfDay) {
          status = 'NOT_APPLICABLE';
        } else if (targetDate.getDay() === 0) {
          // Sunday Weekly Off
          status = 'WEEKLY_OFF';
        } else if (leave) {
          status = leave.leaveType === 'UNPAID' ? 'UNPAID_LEAVE' : 'PAID_LEAVE';
        } else if (att) {
          status = att.status;
          punchIn = formatTime(att.punchInAt);
          punchOut = formatTime(att.punchOutAt);
          workedMinutes = att.workedMinutes;
          workedSeconds = att.workedSeconds || 0;

          const isOut = !!att.punchOutAt;
          const isIn = !!att.punchInAt && !isOut;
          if (isOut && att.workedSeconds > 0) {
            workedDuration = formatDurationHms(att.workedSeconds);
          } else if (isIn && att.punchInAt) {
            workedDuration = formatElapsedHm(att.punchInAt);
          }

          lateMinutes = att.lateMinutes;
          earlyExitMinutes = att.earlyExitMinutes;
          overtimeMinutes = att.overtimeMinutes;
          selfieUrl = att.punchOutSelfieUrl || att.punchInSelfieUrl || null;

          inCoords =
            att.punchInLatitude != null && att.punchInLongitude != null
              ? `${Number(att.punchInLatitude).toFixed(4)}, ${Number(att.punchInLongitude).toFixed(4)}`
              : null;
          outCoords =
            att.punchOutLatitude != null && att.punchOutLongitude != null
              ? `${Number(att.punchOutLatitude).toFixed(4)}, ${Number(att.punchOutLongitude).toFixed(4)}`
              : null;

          punchInAddress = att.punchInAddress || inCoords || '—';
          punchOutAddress = att.punchOutAddress || outCoords || '—';
          coords = outCoords || inCoords || '—';
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
          punchInAt: att?.punchInAt?.toISOString() || null,
          punchInTime: att ? formatTime(att.punchInAt) : '—',
          punchInDate: att ? (formatEventDate(att.punchInAt) || getKolkataDate(targetDate).dateStr) : null,
          punchInAddress,
          punchInCoords: inCoords || '—',
          punchInAccuracy: att?.punchInAccuracy != null ? Math.round(att.punchInAccuracy) : null,
          punchInSelfieUrl: att?.punchInSelfieUrl || null,
          punchOutAt: att?.punchOutAt?.toISOString() || null,
          punchOutTime: att ? formatTime(att.punchOutAt) : '—',
          punchOutDate: att ? formatEventDate(att.punchOutAt) : null,
          punchOutAddress,
          punchOutCoords: outCoords || '—',
          punchOutAccuracy: att?.punchOutAccuracy != null ? Math.round(att.punchOutAccuracy) : null,
          punchOutSelfieUrl: att?.punchOutSelfieUrl || null,
          workedDuration,
          workedMinutes,
          workedSeconds,
          totalWorkingSeconds: workedSeconds,
          lateMinutes,
          earlyExitMinutes,
          overtimeMinutes,
          status,
          punchInLocation: punchInAddress,
          punchOutLocation: punchOutAddress,
          location: punchOutAddress !== '—' ? punchOutAddress : punchInAddress !== '—' ? punchInAddress : locationName,
          coords,
          accuracy,
          selfieUrl,
          timestamp:
            att?.punchInAt?.toISOString() ||
            att?.createdAt?.toISOString() ||
            new Date(targetDate).toISOString(),
        };
      });

      // Filtering
      if (query.department && query.department !== 'all') {
        roster = roster.filter(
          (r) => r.department.toLowerCase() === query.department.toLowerCase(),
        );
      }
      if (query.status && query.status !== 'all') {
        roster = roster.filter(
          (r) => r.status.toUpperCase() === query.status.toUpperCase(),
        );
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        roster = roster.filter(
          (r) =>
            r.employeeName.toLowerCase().includes(s) ||
            r.employeeCode.toLowerCase().includes(s) ||
            r.department.toLowerCase().includes(s) ||
            r.role.toLowerCase().includes(s),
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
    const roster = await this.listCompanyAttendance(companyId, {
      date: targetDate.toISOString(),
    });

    const totalEmployees = roster.filter(
      (r) => r.status !== 'NOT_APPLICABLE',
    ).length;
    const present = roster.filter(
      (r) =>
        r.status === 'PRESENT' ||
        r.status === 'HALF_DAY' ||
        r.status === 'PUNCHED_IN',
    ).length;
    const currentlyPunchedIn = roster.filter(
      (r) => r.status === 'PUNCHED_IN',
    ).length;
    const punchedOut = roster.filter(
      (r) =>
        (r.status === 'PRESENT' || r.status === 'HALF_DAY') &&
        r.punchOut !== '—',
    ).length;
    const absent = roster.filter((r) => r.status === 'ABSENT').length;
    const onLeave = roster.filter(
      (r) => r.status === 'PAID_LEAVE' || r.status === 'UNPAID_LEAVE',
    ).length;
    const halfDay = roster.filter((r) => r.status === 'HALF_DAY').length;
    const late = roster.filter((r) => r.lateMinutes > 0).length;
    const missingPunchOut = roster.filter(
      (r) => r.status === 'MISSING_PUNCH_OUT',
    ).length;

    const attendancePercentage =
      totalEmployees > 0
        ? Number(((present / totalEmployees) * 100).toFixed(1))
        : 0;

    return {
      totalEmployees,
      presentToday: present,
      presentCount: present,
      currentlyPunchedIn,
      punchedOut,
      absent,
      absentCount: absent,
      onLeave,
      halfDay,
      halfDayCount: halfDay,
      late,
      lateCount: late,
      missingPunchOut,
      attendancePercentage,
    };
  }

  // Complete Monthly Attendance Breakdown for /hr/employees/:employeeId
  async getEmployeeMonthlyAttendance(
    employeeId: string,
    companyIdOrMonthStr?: string,
    monthStrInput?: string,
  ) {
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
      throw new NotFoundException(
        `Employee record not found for ID: ${employeeId}`,
      );
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
    const attMap = new Map(
      attendances.map((a) => [getKolkataDate(a.attendanceDate).dateStr, a]),
    );

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
      return approvedLeaves.some(
        (l) => new Date(l.fromDate) <= d && d <= new Date(l.toDate),
      );
    };

    const joiningDate = emp.joiningDate
      ? new Date(emp.joiningDate)
      : firstDayOfMonth;

    let scheduledWorkingDays = 0;
    let elapsedWorkingDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    let paidLeaveDays = 0;
    const unpaidLeaveDays = 0;
    let halfDays = 0;
    let weeklyOffDays = 0;
    const holidayDays = 0;
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

      const dayName = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
      }).format(curDate);
      const att = attMap.get(dateStr);
      const hasLeave = isLeaveOnDate(curDate);

      let status = 'NOT_PUNCHED_IN';
      let inTime = '—';
      let outTime = '—';
      let hoursStr = '—';

      // Evaluation
      if (curDate < getKolkataDate(joiningDate).startOfDay) {
        status = 'NOT_APPLICABLE';
      } else if (curDate.getDay() === 0) {
        // Sunday
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
        month: new Intl.DateTimeFormat('en-US', {
          month: 'long',
          year: 'numeric',
        }).format(firstDayOfMonth),
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
    let policy = await this.prisma.shiftPolicy.findUnique({
      where: { deptName },
    });
    if (!policy) {
      policy = await this.prisma.shiftPolicy.findUnique({
        where: { deptName: 'Default' },
      });
    }
    return policy || { checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 };
  }

  // Late Minutes calculation helper
  private async calculateLateMinutes(
    checkInTime: Date,
    deptName: string,
  ): Promise<number> {
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
  private calculateEarlyExitMinutes(
    checkOutTime: Date,
    policyCheckOut: string,
  ): number {
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
        {
          deptName: 'HR',
          checkIn: '09:00 AM',
          checkOut: '06:00 PM',
          grace: 15,
        },
        {
          deptName: 'Sales',
          checkIn: '09:30 AM',
          checkOut: '06:30 PM',
          grace: 30,
        },
        {
          deptName: 'Production',
          checkIn: '08:00 AM',
          checkOut: '05:00 PM',
          grace: 10,
        },
        {
          deptName: 'Finance',
          checkIn: '09:00 AM',
          checkOut: '06:00 PM',
          grace: 15,
        },
        {
          deptName: 'Default',
          checkIn: '09:00 AM',
          checkOut: '06:00 PM',
          grace: 15,
        },
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
