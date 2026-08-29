import { Injectable, UnauthorizedException, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDeviceSessionDto } from './dto/device-session.dto';
import { UpdateLocationDto } from './dto/location-update.dto';
import { LocationPermissionState, ClientType } from '@prisma/client';

export const ONLINE_THRESHOLD_SECONDS = 90; // 90 seconds window for active heartbeat
export const RECENT_THRESHOLD_SECONDS = 300; // 5 minutes window for recently active

export interface LiveUserResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
  sessions: {
    sessionId: string;
    deviceId: string;
    deviceType: string;
    deviceModel: string | null;
    operatingSystem: string | null;
    browser: string | null;
    clientType: ClientType;
    locationPermission: LocationPermissionState;
    lastSeenAt: Date;
    status: 'ONLINE' | 'RECENTLY_ACTIVE' | 'OFFLINE';
    location: {
      latitude: number;
      longitude: number;
      accuracy: number | null;
      speed: number | null;
      heading: number | null;
      batteryLevel: number | null;
      capturedAt: Date;
    } | null;
  }[];
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Upsert an authenticated device session for a user.
   */
  async registerSession(
    userId: string,
    companyId: string,
    dto: CreateDeviceSessionDto,
  ): Promise<{ sessionId: string }> {
    const existing = await this.prisma.deviceSession.findFirst({
      where: {
        userId,
        deviceId: dto.deviceId,
      },
    });

    const now = new Date();

    if (existing) {
      const updated = await this.prisma.deviceSession.update({
        where: { id: existing.id },
        data: {
          deviceType: dto.deviceType,
          deviceModel: dto.deviceModel,
          operatingSystem: dto.operatingSystem,
          browser: dto.browser,
          clientType: dto.clientType || 'WEB',
          locationPermission: dto.locationPermission || existing.locationPermission,
          lastSeenAt: now,
          connectedAt: now,
        },
      });
      return { sessionId: updated.sessionId };
    }

    const created = await this.prisma.deviceSession.create({
      data: {
        companyId,
        userId,
        deviceId: dto.deviceId,
        deviceType: dto.deviceType,
        deviceModel: dto.deviceModel,
        operatingSystem: dto.operatingSystem,
        browser: dto.browser,
        clientType: dto.clientType || 'WEB',
        locationPermission: dto.locationPermission || 'PROMPT',
        lastSeenAt: now,
        connectedAt: now,
      },
    });

    return { sessionId: created.sessionId };
  }

  /**
   * Record client presence heartbeat, updating lastSeenAt
   */
  async heartbeat(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.deviceSession.findUnique({
      where: { sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Session not owned by user');
    }

    await this.prisma.deviceSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });
  }

  /**
   * Close/terminate a session on explicit logout
   */
  async logoutSession(userId: string, deviceId: string): Promise<void> {
    const session = await this.prisma.deviceSession.findFirst({
      where: { userId, deviceId },
    });

    if (session) {
      await this.prisma.deviceSession.update({
        where: { id: session.id },
        data: {
          disconnectedAt: new Date(),
          lastSeenAt: new Date(0), // force offline status
        },
      });
    }
  }

  /**
   * Save coordinates, updating LatestUserLocation and lastSeenAt
   */
  // Helper for computing coordinate distance
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius of Earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Save coordinates, updating LatestUserLocation and lastSeenAt with validation and sanity filtering
   */
  async updateLocation(
    userId: string,
    companyId: string,
    dto: UpdateLocationDto,
  ): Promise<any> {
    // 1. Strict Coordinate Bounds & Accuracy Validation
    if (dto.latitude < -90 || dto.latitude > 90) {
      throw new BadRequestException('Invalid latitude coordinate: must be between -90 and 90');
    }
    if (dto.longitude < -180 || dto.longitude > 180) {
      throw new BadRequestException('Invalid longitude coordinate: must be between -180 and 180');
    }
    if (dto.accuracy !== null && dto.accuracy !== undefined && dto.accuracy <= 0) {
      throw new BadRequestException('GPS accuracy must be a positive number');
    }

    const session = await this.prisma.deviceSession.findUnique({
      where: { sessionId: dto.sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Session access denied');
    }

    const now = new Date();
    const captured = new Date(dto.capturedAt || now);

    // Reject timestamps far in future or past
    const timeDiffMs = captured.getTime() - now.getTime();
    if (timeDiffMs > 10 * 60 * 1000) {
      throw new BadRequestException('GPS timestamp cannot be in the future');
    }

    const existingLocation = await this.prisma.latestUserLocation.findUnique({
      where: { deviceSessionId: session.id },
    });

    if (existingLocation && captured <= existingLocation.capturedAt) {
      // Stale coordinate update: keep presence active without writing older coordinates
      await this.prisma.deviceSession.update({
        where: { id: session.id },
        data: {
          lastSeenAt: now,
          locationPermission: 'GRANTED',
        },
      });
      return existingLocation;
    }

    // 2. Impossible GPS Jump / Teleportation Filter
    const maxSpeedMps = Number(process.env.MAX_GPS_SPEED_MPS) || 55.5; // ~200 km/h max realistic ground speed
    if (existingLocation && existingLocation.latitude && existingLocation.longitude) {
      const distance = this.calculateDistance(
        Number(existingLocation.latitude),
        Number(existingLocation.longitude),
        dto.latitude,
        dto.longitude,
      );
      const elapsedSeconds = Math.max(1, (captured.getTime() - new Date(existingLocation.capturedAt).getTime()) / 1000);
      const calculatedSpeed = distance / elapsedSeconds;

      // If speed exceeds 200 km/h over more than 500 meters in a short interval, filter as suspicious jump
      if (distance > 500 && elapsedSeconds < 300 && calculatedSpeed > maxSpeedMps) {
        this.logger.warn(
          `[GPS Jump Filtered] Suspicious GPS jump for user ${userId}: moved ${Math.round(distance)}m in ${elapsedSeconds}s (${Math.round(calculatedSpeed * 3.6)} km/h). Rejecting coordinate warping.`,
        );

        // Keep session heartbeat alive without jumping the marker
        await this.prisma.deviceSession.update({
          where: { id: session.id },
          data: {
            lastSeenAt: now,
            locationPermission: 'GRANTED',
          },
        });

        return {
          ...existingLocation,
          isSuspiciousJump: true,
          jumpDistanceMeters: Math.round(distance),
        };
      }
    }

    // 3. Persist Validated Coordinates to Database
    const location = await this.prisma.latestUserLocation.upsert({
      where: { deviceSessionId: session.id },
      create: {
        companyId,
        userId,
        deviceSessionId: session.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        altitude: dto.altitude,
        speed: dto.speed,
        heading: dto.heading,
        batteryLevel: dto.batteryLevel,
        capturedAt: captured,
        receivedAt: now,
      },
      update: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        altitude: dto.altitude,
        speed: dto.speed,
        heading: dto.heading,
        batteryLevel: dto.batteryLevel,
        capturedAt: captured,
        receivedAt: now,
      },
    });

    // 4. Sampling location history: protect against poor GPS accuracy
    const maxAccuracyThreshold = Number(process.env.LOCATION_HISTORY_MAX_ACCURACY_METERS) || 100;
    const samplingDistanceMeters = Number(process.env.LOCATION_HISTORY_SAMPLING_DISTANCE_METERS) || 20;
    const samplingTimeSeconds = Number(process.env.LOCATION_HISTORY_SAMPLING_TIME_SECONDS) || 60;

    const isAccurate = dto.accuracy === null || dto.accuracy === undefined || dto.accuracy <= maxAccuracyThreshold;

    if (isAccurate) {
      const prevHistory = await this.prisma.userLocationHistory.findFirst({
        where: { deviceSessionId: session.id },
        orderBy: { capturedAt: 'desc' },
      });

      let shouldInsertHistory = false;
      if (!prevHistory) {
        shouldInsertHistory = true;
      } else {
        const dist = this.calculateDistance(
          Number(prevHistory.latitude),
          Number(prevHistory.longitude),
          dto.latitude,
          dto.longitude,
        );
        const elapsed = (captured.getTime() - new Date(prevHistory.capturedAt).getTime()) / 1000;
        if (dist >= samplingDistanceMeters || elapsed >= samplingTimeSeconds) {
          shouldInsertHistory = true;
        }
      }

      if (shouldInsertHistory) {
        await this.prisma.userLocationHistory.create({
          data: {
            companyId,
            userId,
            deviceSessionId: session.id,
            latitude: dto.latitude,
            longitude: dto.longitude,
            accuracy: dto.accuracy,
            altitude: dto.altitude,
            speed: dto.speed,
            heading: dto.heading,
            capturedAt: captured,
            receivedAt: now,
          },
        });
      }
    }

    // Keep session seen timestamp updated with the GPS report
    await this.prisma.deviceSession.update({
      where: { id: session.id },
      data: {
        lastSeenAt: now,
        locationPermission: 'GRANTED',
      },
    });

    return location;
  }

  /**
   * Update location permission state for session
   */
  async updatePermission(
    userId: string,
    sessionId: string,
    permission: LocationPermissionState,
  ): Promise<void> {
    const session = await this.prisma.deviceSession.findUnique({
      where: { sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Session access denied');
    }

    await this.prisma.deviceSession.update({
      where: { id: session.id },
      data: {
        locationPermission: permission,
        lastSeenAt: new Date(),
      },
    });
  }

  /**
   * Fetch all user sessions and their locations for the company, or all companies if companyId is omitted.
   */
  async getLiveUsers(companyId?: string): Promise<LiveUserResponse[]> {
    const now = new Date();
    const onlineCutoff = new Date(now.getTime() - ONLINE_THRESHOLD_SECONDS * 1000);
    const recentCutoff = new Date(now.getTime() - RECENT_THRESHOLD_SECONDS * 1000);

    const whereClause: any = { isActive: true };
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
            code: true,
          },
        },
        deviceSessions: {
          orderBy: {
            lastSeenAt: 'desc',
          },
          include: {
            latestLocation: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return users.map((u) => {
      const sessions = (u.deviceSessions || []).map((ds) => {
        let status: 'ONLINE' | 'RECENTLY_ACTIVE' | 'OFFLINE' = 'OFFLINE';
        if (ds.lastSeenAt >= onlineCutoff) {
          status = 'ONLINE';
        } else if (ds.lastSeenAt >= recentCutoff) {
          status = 'RECENTLY_ACTIVE';
        }

        const heartbeatAgeSeconds = Math.max(0, Math.round((now.getTime() - new Date(ds.lastSeenAt).getTime()) / 1000));
        let gpsStatus: 'ACTIVE' | 'STALE' | 'UNAVAILABLE' = 'UNAVAILABLE';
        let gpsAgeSeconds: number | null = null;

        let locationData: any = null;
        if (ds.latestLocation) {
          gpsAgeSeconds = Math.max(0, Math.round((now.getTime() - new Date(ds.latestLocation.capturedAt).getTime()) / 1000));
          gpsStatus = gpsAgeSeconds <= 120 ? 'ACTIVE' : 'STALE';

          locationData = {
            latitude: Number(ds.latestLocation.latitude),
            longitude: Number(ds.latestLocation.longitude),
            accuracy: ds.latestLocation.accuracy,
            speed: ds.latestLocation.speed,
            heading: ds.latestLocation.heading,
            batteryLevel: ds.latestLocation.batteryLevel,
            capturedAt: ds.latestLocation.capturedAt,
            gpsAgeSeconds,
            gpsStatus,
          };
        }

        return {
          sessionId: ds.sessionId,
          deviceId: ds.deviceId,
          userId: u.id,
          deviceType: ds.deviceType,
          deviceModel: ds.deviceModel,
          operatingSystem: ds.operatingSystem,
          browser: ds.browser,
          clientType: ds.clientType,
          locationPermission: ds.locationPermission,
          lastSeenAt: ds.lastSeenAt,
          heartbeatAgeSeconds,
          gpsStatus,
          gpsAgeSeconds,
          status,
          location: locationData,
        };
      });

      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        role: u.role?.name || 'User',
        sessions,
      };
    });
  }

  /**
   * Cleanup method to wipe device sessions older than 30 days
   */
  async cleanupOldSessions(): Promise<number> {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const result = await this.prisma.deviceSession.deleteMany({
      where: {
        lastSeenAt: {
          lt: cutoff,
        },
      },
    });
    this.logger.log(`Cleaned up ${result.count} stale device sessions.`);
    return result.count;
  }

  /**
   * Dynamic DB permission verification helper
   */
  async hasMapPermission(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user || !user.role) return false;

    const normalizedRole = String(user.role.code || user.role.name || '').toUpperCase().replace(/[\s-]+/g, '_');
    if (
      normalizedRole === 'SUPER_ADMIN' ||
      normalizedRole === 'ADMIN' ||
      normalizedRole.includes('ADMIN') ||
      normalizedRole.includes('PLANT_HEAD') ||
      normalizedRole.includes('HR') ||
      normalizedRole.includes('SALES') ||
      normalizedRole.includes('MANAGER') ||
      normalizedRole.includes('DIRECTOR')
    ) return true;

    const perms = user.role.rolePermissions.map((rp) => rp.permission.code);
    return perms.includes('LIVE_USER_MAP_VIEW') || perms.includes('SUPER_ADMIN') || perms.includes('ADMIN');
  }

  /**
   * Dynamic DB history permission verification helper
   */
  async hasHistoryPermission(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user || !user.role) return false;

    const normalizedRole = String(user.role.code || user.role.name || '').toUpperCase().replace(/[\s-]+/g, '_');
    if (
      normalizedRole === 'SUPER_ADMIN' ||
      normalizedRole === 'ADMIN' ||
      normalizedRole.includes('ADMIN') ||
      normalizedRole.includes('PLANT_HEAD') ||
      normalizedRole.includes('HR') ||
      normalizedRole.includes('SALES') ||
      normalizedRole.includes('MANAGER') ||
      normalizedRole.includes('DIRECTOR')
    ) return true;

    const perms = user.role.rolePermissions.map((rp) => rp.permission.code);
    return perms.includes('USER_LOCATION_HISTORY_VIEW') || perms.includes('LIVE_USER_MAP_VIEW') || perms.includes('SUPER_ADMIN') || perms.includes('ADMIN');
  }

  /**
   * Cleanup expired UserLocationHistory entries older than 30 days
   */
  async cleanupExpiredLocationHistory(): Promise<number> {
    const retentionDays = Number(process.env.LOCATION_HISTORY_RETENTION_DAYS) || 30;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const result = await this.prisma.userLocationHistory.deleteMany({
      where: {
        capturedAt: {
          lt: cutoff,
        },
      },
    });
    this.logger.log(`Cleaned up ${result.count} expired user location history records.`);
    return result.count;
  }

  // Local helper for dynamic timezone calculations to UTC
  private getUtcRangeForLocalDate(dateStr: string, timezone: string): { start: Date; end: Date } {
    const [year, month, day] = dateStr.split('-').map(Number);
    const testDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(testDate);
    const getPart = (type: string) => Number(parts.find(p => p.type === type)?.value);
    const formattedUtc = Date.UTC(
      getPart('year'),
      getPart('month') - 1,
      getPart('day'),
      getPart('hour'),
      getPart('minute'),
      getPart('second')
    );
    const offsetMs = formattedUtc - testDate.getTime();
    const startUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - offsetMs);
    const endUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - offsetMs);
    return { start: startUtc, end: endUtc };
  }

  async getLocationHistory(
    companyId?: string,
    userId?: string,
    deviceSessionId?: string,
    dateQuery?: string,
    fromQuery?: string,
    toQuery?: string,
  ): Promise<any> {
    const cleanUserId = userId && userId !== 'undefined' && userId !== 'null' ? userId : undefined;

    let session = deviceSessionId
      ? await this.prisma.deviceSession.findUnique({
          where: { sessionId: deviceSessionId },
        })
      : null;

    if (!session && deviceSessionId) {
      session = await this.prisma.deviceSession.findFirst({
        where: { id: deviceSessionId },
      });
    }

    if (!session && cleanUserId) {
      session = await this.prisma.deviceSession.findFirst({
        where: { userId: cleanUserId },
        orderBy: { lastSeenAt: 'desc' },
      });
    }

    if (!session) {
      throw new ForbiddenException('Session access denied or invalid association.');
    }

    if (cleanUserId && session.userId !== cleanUserId) {
      throw new ForbiddenException('Session access denied or invalid association.');
    }

    if (companyId && session.companyId !== companyId) {
      throw new ForbiddenException('Session access denied or invalid association.');
    }

    const sessionCompanyId = session.companyId || companyId;
    const company = sessionCompanyId
      ? await this.prisma.company.findUnique({
          where: { id: sessionCompanyId },
        })
      : null;
    const tz = (company as any)?.timezone || 'Asia/Kolkata';

    let start: Date;
    let end: Date;

    if (dateQuery) {
      const range = this.getUtcRangeForLocalDate(dateQuery, tz);
      start = range.start;
      end = range.end;
    } else if (fromQuery && toQuery) {
      const startRange = this.getUtcRangeForLocalDate(fromQuery, tz);
      const endRange = this.getUtcRangeForLocalDate(toQuery, tz);
      start = startRange.start;
      end = endRange.end;
    } else {
      throw new BadRequestException('Provide either "date" OR ("from" and "to") parameters.');
    }

    const maxRangeMs = 7 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > maxRangeMs) {
      throw new BadRequestException('Maximum date range is limited to 7 days.');
    }

    const rawPoints = await this.prisma.userLocationHistory.findMany({
      where: {
        deviceSessionId: session.id,
        capturedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { capturedAt: 'asc' },
    });

    const pointCount = rawPoints.length;
    const limit = 1000;
    const truncated = pointCount > limit;

    let points = rawPoints;
    if (truncated) {
      points = [];
      points.push(rawPoints[0]);
      const step = (pointCount - 2) / (limit - 2);
      for (let i = 1; i < limit - 1; i++) {
        const index = Math.round(i * step);
        points.push(rawPoints[index]);
      }
      points.push(rawPoints[pointCount - 1]);
    }

    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: { select: { name: true } },
      },
    });

    return {
      user: {
        id: userRecord?.id,
        name: userRecord?.name,
        role: userRecord?.role?.name || 'User',
      },
      device: {
        sessionId: session.sessionId,
        browser: session.browser,
        operatingSystem: session.operatingSystem,
      },
      range: {
        from: start.toISOString(),
        to: end.toISOString(),
        timezone: tz,
      },
      summary: {
        pointCount,
        truncated,
      },
      points: points.map((p) => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        accuracy: p.accuracy,
        speed: p.speed,
        heading: p.heading,
        capturedAt: p.capturedAt.toISOString(),
      })),
    };
  }
}
