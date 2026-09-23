import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Inject,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BatchTrackingPointsDto, SingleTrackingPointDto } from './dto/tracking-point.dto';
import { LocationGateway } from './location.gateway';
import { Prisma } from '@prisma/client';

export const MAX_TELEPORT_SPEED_KMH = 180; // Ground speed threshold for jump filter
export const STOP_SPEED_THRESHOLD_KMH = 2.0; // Stationary speed threshold
export const STOP_DURATION_THRESHOLD_SECONDS = 300; // 5 minutes stationary threshold
export const FUTURE_TIMESTAMP_TOLERANCE_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(forwardRef(() => LocationGateway))
    private readonly locationGateway?: LocationGateway,
  ) {}

  /**
   * Calculate distance between two coordinates in kilometers using Haversine formula
   */
  calculateHaversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Start a dedicated route tracking session on Punch In.
   * Strictly enforces 4-way identity consistency and PostgreSQL partial unique index race protection.
   */
  async startSession(
    userId: string,
    companyId: string,
    employeeId: string,
    attendanceId: string,
    punchData: {
      latitude: number;
      longitude: number;
      accuracy?: number | null;
      address?: string | null;
      punchInAt?: Date;
    },
  ) {
    // 1. 4-Way Consistency Check with Attendance
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new BadRequestException('Authoritative Attendance record not found.');
    }

    if (
      attendance.companyId !== companyId ||
      attendance.employeeId !== employeeId ||
      attendance.userId !== userId
    ) {
      this.logger.error(
        `[Security Violation] Identity mismatch for Attendance ${attendanceId}: expected company=${attendance.companyId}, emp=${attendance.employeeId}, user=${attendance.userId} but got company=${companyId}, emp=${employeeId}, user=${userId}`,
      );
      throw new ForbiddenException(
        'Security violation: Attendance identity does not match session context.',
      );
    }

    // 2. Application-Level Guard: Check if an ACTIVE session already exists
    const existingActive = await this.prisma.employeeLocationSession.findFirst({
      where: {
        companyId,
        employeeId,
        status: 'ACTIVE',
      },
    });

    if (existingActive) {
      this.logger.log(
        `Active location session already exists for employee ${employeeId}: ${existingActive.id}. Safely reusing.`,
      );
      return existingActive;
    }

    // 3. Database Creation with Partial Unique Index Conflict Recovery
    const now = punchData.punchInAt || new Date();
    try {
      const session = await this.prisma.employeeLocationSession.create({
        data: {
          companyId,
          employeeId,
          userId,
          attendanceId,
          punchInAt: now,
          punchInLatitude: new Prisma.Decimal(punchData.latitude),
          punchInLongitude: new Prisma.Decimal(punchData.longitude),
          punchInAccuracy: punchData.accuracy != null ? Number(punchData.accuracy) : null,
          punchInAddress: punchData.address || null,
          status: 'ACTIVE',
          totalDistanceKm: new Prisma.Decimal(0),
          totalPointsCount: 0,
          totalStopsCount: 0,
        },
      });

      this.logger.log(
        `Started new EmployeeLocationSession ${session.id} for employee ${employeeId} on punch in.`,
      );

      // Record first initial GPS tracking point if valid coordinates exist
      const initialClientPointId = `punch-in-${attendanceId}`;
      try {
        await this.prisma.employeeLocationPoint.create({
          data: {
            sessionId: session.id,
            companyId,
            employeeId,
            userId,
            clientPointId: initialClientPointId,
            latitude: new Prisma.Decimal(punchData.latitude),
            longitude: new Prisma.Decimal(punchData.longitude),
            accuracy: punchData.accuracy != null ? Number(punchData.accuracy) : null,
            recordedAt: now,
            source: 'PUNCH_IN_SNAPSHOT',
          },
        });
        await this.prisma.employeeLocationSession.update({
          where: { id: session.id },
          data: { totalPointsCount: 1 },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to record initial snapshot point: ${err?.message}`);
      }

      return session;
    } catch (err: any) {
      // Catch PostgreSQL unique conflict (P2002 or partial index collision)
      if (
        err?.code === 'P2002' ||
        err?.message?.includes('idx_active_employee_location_session') ||
        err?.message?.includes('attendanceId')
      ) {
        this.logger.warn(
          `Concurrent ACTIVE session race detected for employee ${employeeId}. Reusing existing session.`,
        );
        const existing = await this.prisma.employeeLocationSession.findFirst({
          where: { companyId, employeeId, status: 'ACTIVE' },
        });
        if (existing) return existing;
      }
      throw err;
    }
  }

  /**
   * Conclude an active route tracking session on Punch Out.
   * Authoritative Attendance record is primary; failure here will not fail Attendance.
   */
  async endSession(
    userId: string,
    companyId: string,
    attendanceId: string,
    punchOutData: {
      latitude?: number | null;
      longitude?: number | null;
      accuracy?: number | null;
      address?: string | null;
      punchOutAt?: Date;
    },
  ) {
    const session = await this.prisma.employeeLocationSession.findFirst({
      where: {
        attendanceId,
        companyId,
      },
    });

    if (!session) {
      this.logger.warn(
        `No location session found to end for attendance ${attendanceId}.`,
      );
      return null;
    }

    if (session.status !== 'ACTIVE') {
      this.logger.log(
        `Location session ${session.id} is already in state ${session.status}. Skipping duplicate end.`,
      );
      return session;
    }

    const now = punchOutData.punchOutAt || new Date();
    const hasGps =
      punchOutData.latitude != null && punchOutData.longitude != null;

    // If final GPS provided, record final point
    if (hasGps) {
      const finalClientPointId = `punch-out-${attendanceId}`;
      try {
        await this.prisma.employeeLocationPoint.upsert({
          where: {
            sessionId_clientPointId: {
              sessionId: session.id,
              clientPointId: finalClientPointId,
            },
          },
          create: {
            sessionId: session.id,
            companyId,
            employeeId: session.employeeId,
            userId,
            clientPointId: finalClientPointId,
            latitude: new Prisma.Decimal(punchOutData.latitude!),
            longitude: new Prisma.Decimal(punchOutData.longitude!),
            accuracy:
              punchOutData.accuracy != null
                ? Number(punchOutData.accuracy)
                : null,
            recordedAt: now,
            source: 'PUNCH_OUT_SNAPSHOT',
          },
          update: {},
        });
      } catch (err: any) {
        this.logger.warn(`Failed to append final snapshot point: ${err?.message}`);
      }
    }

    // Recompute total distance strictly from unique, non-jump points
    const finalDistanceKm = await this.recalculateSessionDistanceKm(session.id);
    const pointsCount = await this.prisma.employeeLocationPoint.count({
      where: { sessionId: session.id },
    });
    const stopsCount = await this.prisma.employeeRouteStop.count({
      where: { sessionId: session.id },
    });

    const updated = await this.prisma.employeeLocationSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        punchOutAt: now,
        punchOutLatitude: hasGps
          ? new Prisma.Decimal(punchOutData.latitude!)
          : null,
        punchOutLongitude: hasGps
          ? new Prisma.Decimal(punchOutData.longitude!)
          : null,
        punchOutAccuracy:
          punchOutData.accuracy != null ? Number(punchOutData.accuracy) : null,
        punchOutAddress: punchOutData.address || null,
        totalDistanceKm: new Prisma.Decimal(finalDistanceKm),
        totalPointsCount: pointsCount,
        totalStopsCount: stopsCount,
      },
    });

    this.logger.log(
      `Concluded EmployeeLocationSession ${session.id}: totalDistance=${finalDistanceKm.toFixed(3)} km, points=${pointsCount}, stops=${stopsCount}.`,
    );

    return updated;
  }

  /**
   * Recalculates distance strictly across chronological, unique, non-filtered GPS points.
   */
  async recalculateSessionDistanceKm(sessionId: string): Promise<number> {
    const points = await this.prisma.employeeLocationPoint.findMany({
      where: {
        sessionId,
        isFilteredJump: false,
      },
      orderBy: { recordedAt: 'asc' },
      select: {
        latitude: true,
        longitude: true,
      },
    });

    if (points.length < 2) return 0;

    let totalKm = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const dist = this.calculateHaversineDistanceKm(
        Number(prev.latitude),
        Number(prev.longitude),
        Number(curr.latitude),
        Number(curr.longitude),
      );
      totalKm += dist;
    }

    return Math.round(totalKm * 1000) / 1000;
  }

  /**
   * Ingest a batch of tracking points from mobile background service.
   * Strictly enforces idempotency via clientPointId, jump filtering, and stop clustering.
   */
  async recordBatchPoints(
    userId: string,
    companyId: string,
    dto: BatchTrackingPointsDto,
  ) {
    if (!dto.points || dto.points.length === 0) {
      return { success: true, acceptedCount: 0 };
    }

    // 1. Verify session exists and is ACTIVE
    const session = await this.prisma.employeeLocationSession.findUnique({
      where: { id: dto.sessionId },
      include: { employee: true },
    });

    if (!session) {
      throw new NotFoundException(`Tracking session ${dto.sessionId} not found.`);
    }

    if (session.companyId !== companyId) {
      throw new ForbiddenException('Tenant access denied.');
    }

    if (session.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Session is ${session.status}. Further location points are not accepted for concluded shifts.`,
      );
    }

    // 2. Query the last recorded point for consecutive jump evaluation
    let lastValidPoint = await this.prisma.employeeLocationPoint.findFirst({
      where: {
        sessionId: session.id,
        isFilteredJump: false,
      },
      orderBy: { recordedAt: 'desc' },
    });

    const now = new Date();
    let acceptedCount = 0;
    let latestAcceptedPoint: SingleTrackingPointDto | null = null;

    // Sort incoming points chronologically
    const sortedPoints = [...dto.points].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );

    for (const pt of sortedPoints) {
      const recordedDate = new Date(pt.recordedAt);

      // Check future timestamp
      const timeDiff = recordedDate.getTime() - now.getTime();
      if (timeDiff > FUTURE_TIMESTAMP_TOLERANCE_MS) {
        this.logger.warn(
          `[GPS Timestamp Rejected] Point for session ${session.id} rejected: future timestamp ${recordedDate.toISOString()}`,
        );
        continue;
      }

      // Check teleport jump against last known valid point
      let isFilteredJump = false;
      if (lastValidPoint) {
        const distanceKm = this.calculateHaversineDistanceKm(
          Number(lastValidPoint.latitude),
          Number(lastValidPoint.longitude),
          pt.latitude,
          pt.longitude,
        );
        const elapsedHours = Math.max(
          1 / 3600,
          (recordedDate.getTime() - new Date(lastValidPoint.recordedAt).getTime()) /
            (1000 * 3600),
        );
        const calculatedSpeedKmh = distanceKm / elapsedHours;

        if (distanceKm > 0.5 && calculatedSpeedKmh > MAX_TELEPORT_SPEED_KMH) {
          isFilteredJump = true;
          this.logger.warn(
            `[Impossible Teleport Jump Flagged] User ${userId} moved ${distanceKm.toFixed(2)} km in ${(elapsedHours * 3600).toFixed(0)}s (${calculatedSpeedKmh.toFixed(0)} km/h). Flagged as isFilteredJump=true.`,
          );
        }
      }

      // Idempotent point insertion using unique compound constraint (sessionId, clientPointId)
      try {
        const createdPoint = await this.prisma.employeeLocationPoint.upsert({
          where: {
            sessionId_clientPointId: {
              sessionId: session.id,
              clientPointId: pt.clientPointId,
            },
          },
          create: {
            sessionId: session.id,
            companyId,
            employeeId: session.employeeId,
            userId,
            clientPointId: pt.clientPointId,
            latitude: new Prisma.Decimal(pt.latitude),
            longitude: new Prisma.Decimal(pt.longitude),
            accuracy: pt.accuracy != null ? Number(pt.accuracy) : null,
            altitude: pt.altitude != null ? Number(pt.altitude) : null,
            speed: pt.speed != null ? Number(pt.speed) : null,
            heading: pt.heading != null ? Number(pt.heading) : null,
            batteryLevel: pt.batteryLevel != null ? Number(pt.batteryLevel) : null,
            isMockLocation: pt.isMockLocation === true,
            isFilteredJump,
            source: pt.source || 'FLUTTER_BACKGROUND',
            recordedAt: recordedDate,
            serverReceivedAt: now,
          },
          update: {
            // Never overwrite existing coordinates; update server receipt timestamp if needed
            serverReceivedAt: now,
          },
        });

        acceptedCount++;
        if (!isFilteredJump) {
          lastValidPoint = createdPoint;
          latestAcceptedPoint = pt;
        }
      } catch (err: any) {
        this.logger.warn(`Point upsert conflict/error for ${pt.clientPointId}: ${err?.message}`);
      }
    }

    // 3. Recalculate distance and update session
    const updatedDistanceKm = await this.recalculateSessionDistanceKm(session.id);
    const totalPointsCount = await this.prisma.employeeLocationPoint.count({
      where: { sessionId: session.id },
    });

    // 4. Evaluate Stationary Stop Detection
    await this.evaluateStops(session.id, session.employeeId, companyId);
    const totalStopsCount = await this.prisma.employeeRouteStop.count({
      where: { sessionId: session.id },
    });

    await this.prisma.employeeLocationSession.update({
      where: { id: session.id },
      data: {
        totalDistanceKm: new Prisma.Decimal(updatedDistanceKm),
        totalPointsCount,
        totalStopsCount,
      },
    });

    // 5. Broadcast to WebSocket Room for Live Map
    if (latestAcceptedPoint && this.locationGateway) {
      try {
        const payload = {
          userId,
          employeeId: session.employeeId,
          sessionId: session.id,
          latitude: latestAcceptedPoint.latitude,
          longitude: latestAcceptedPoint.longitude,
          speed: latestAcceptedPoint.speed,
          heading: latestAcceptedPoint.heading,
          batteryLevel: latestAcceptedPoint.batteryLevel,
          totalDistanceKm: updatedDistanceKm,
          recordedAt: latestAcceptedPoint.recordedAt,
          status: 'LIVE',
        };
        this.locationGateway.server
          ?.to(`company:${companyId}:live-users`)
          ?.emit('employee:route:update', payload);
        this.locationGateway.server
          ?.to('global:live-users')
          ?.emit('employee:route:update', payload);
      } catch (wsErr: any) {
        this.logger.warn(`Failed to broadcast live update: ${wsErr?.message}`);
      }
    }

    return {
      success: true,
      acceptedCount,
      totalDistanceKm: updatedDistanceKm,
      totalPointsCount,
      totalStopsCount,
    };
  }

  /**
   * Stop detection algorithm: clusters stationary points (speed < 2 km/h for >= 5 min)
   */
  async evaluateStops(sessionId: string, employeeId: string, companyId: string) {
    const points = await this.prisma.employeeLocationPoint.findMany({
      where: {
        sessionId,
        isFilteredJump: false,
      },
      orderBy: { recordedAt: 'asc' },
    });

    if (points.length < 2) return;

    let clusterStart: (typeof points)[0] | null = null;
    let clusterEnd: (typeof points)[0] | null = null;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const isStationary =
        p.speed != null ? p.speed <= STOP_SPEED_THRESHOLD_KMH : true;

      if (isStationary) {
        if (!clusterStart) {
          clusterStart = p;
        }
        clusterEnd = p;
      } else {
        if (clusterStart && clusterEnd) {
          const durationSec =
            (new Date(clusterEnd.recordedAt).getTime() -
              new Date(clusterStart.recordedAt).getTime()) /
            1000;
          if (durationSec >= STOP_DURATION_THRESHOLD_SECONDS) {
            await this.upsertStopRecord(
              sessionId,
              employeeId,
              companyId,
              clusterStart,
              clusterEnd,
              Math.round(durationSec / 60),
            );
          }
        }
        clusterStart = null;
        clusterEnd = null;
      }
    }

    // Check trailing cluster
    if (clusterStart && clusterEnd) {
      const durationSec =
        (new Date(clusterEnd.recordedAt).getTime() -
          new Date(clusterStart.recordedAt).getTime()) /
        1000;
      if (durationSec >= STOP_DURATION_THRESHOLD_SECONDS) {
        await this.upsertStopRecord(
          sessionId,
          employeeId,
          companyId,
          clusterStart,
          clusterEnd,
          Math.round(durationSec / 60),
        );
      }
    }
  }

  private async upsertStopRecord(
    sessionId: string,
    employeeId: string,
    companyId: string,
    startPoint: any,
    endPoint: any,
    durationMinutes: number,
  ) {
    const arrivedAt = new Date(startPoint.recordedAt);
    const departedAt = new Date(endPoint.recordedAt);

    const existing = await this.prisma.employeeRouteStop.findFirst({
      where: {
        sessionId,
        arrivedAt,
      },
    });

    if (existing) {
      await this.prisma.employeeRouteStop.update({
        where: { id: existing.id },
        data: {
          departedAt,
          durationMinutes,
        },
      });
    } else {
      await this.prisma.employeeRouteStop.create({
        data: {
          sessionId,
          employeeId,
          companyId,
          latitude: startPoint.latitude,
          longitude: startPoint.longitude,
          arrivedAt,
          departedAt,
          durationMinutes,
        },
      });
    }
  }

  /**
   * Query all currently punched-in employees with ACTIVE tracking sessions
   */
  async getLiveRoutes(companyId?: string) {
    const whereClause: Prisma.EmployeeLocationSessionWhereInput = {
      status: 'ACTIVE',
      ...(companyId ? { companyId } : {}),
    };

    const activeSessions = await this.prisma.employeeLocationSession.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            jobTitle: true,
            department: { select: { name: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true } },
          },
        },
        points: {
          where: { isFilteredJump: false },
          orderBy: { recordedAt: 'asc' },
          take: 500, // Return latest 500 points for live path rendering
          select: {
            id: true,
            latitude: true,
            longitude: true,
            accuracy: true,
            speed: true,
            heading: true,
            batteryLevel: true,
            isMockLocation: true,
            recordedAt: true,
          },
        },
        stops: {
          orderBy: { arrivedAt: 'asc' },
        },
      },
      orderBy: { punchInAt: 'desc' },
    });

    const now = new Date();

    return activeSessions.map((s) => {
      const latestPoint = s.points[s.points.length - 1] || null;
      let stalenessStatus: 'LIVE' | 'GPS_STALE' | 'CONNECTION_DEGRADED' = 'LIVE';
      let minutesSinceLastGps = 0;

      if (latestPoint) {
        const diffMs = now.getTime() - new Date(latestPoint.recordedAt).getTime();
        minutesSinceLastGps = Math.floor(diffMs / 60000);
        if (minutesSinceLastGps > 30) {
          stalenessStatus = 'CONNECTION_DEGRADED';
        } else if (minutesSinceLastGps > 5) {
          stalenessStatus = 'GPS_STALE';
        }
      }

      const elapsedMs = now.getTime() - new Date(s.punchInAt).getTime();
      const elapsedHours = Math.floor(elapsedMs / (1000 * 3600));
      const elapsedMins = Math.floor((elapsedMs % (1000 * 3600)) / (1000 * 60));
      const durationFormatted = `${String(elapsedHours).padStart(2, '0')}h ${String(elapsedMins).padStart(2, '0')}m`;

      return {
        sessionId: s.id,
        employeeId: s.employeeId,
        employeeName: s.employee?.fullName || s.user?.name || 'Staff Member',
        employeeCode: s.employee?.employeeCode,
        role: s.user?.role?.name || s.employee?.jobTitle || 'Field Staff',
        department: s.employee?.department?.name || 'Operations',
        punchInAt: s.punchInAt,
        punchInAddress: s.punchInAddress,
        punchInCoordinates: {
          latitude: Number(s.punchInLatitude),
          longitude: Number(s.punchInLongitude),
        },
        status: stalenessStatus,
        minutesSinceLastGps,
        durationFormatted,
        totalDistanceKm: Number(s.totalDistanceKm),
        totalPointsCount: s.totalPointsCount,
        totalStopsCount: s.stops.length,
        currentLocation: latestPoint
          ? {
              latitude: Number(latestPoint.latitude),
              longitude: Number(latestPoint.longitude),
              accuracy: latestPoint.accuracy,
              speed: latestPoint.speed,
              heading: latestPoint.heading,
              batteryLevel: latestPoint.batteryLevel,
              isMockLocation: latestPoint.isMockLocation,
              recordedAt: latestPoint.recordedAt,
            }
          : {
              latitude: Number(s.punchInLatitude),
              longitude: Number(s.punchInLongitude),
              recordedAt: s.punchInAt,
            },
        routePoints: s.points.map((p) => ({
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          speed: p.speed,
          heading: p.heading,
          recordedAt: p.recordedAt,
        })),
        stops: s.stops.map((st, idx) => ({
          stopNumber: idx + 1,
          latitude: Number(st.latitude),
          longitude: Number(st.longitude),
          locationName: st.locationName || `Stop #${idx + 1}`,
          address: st.address,
          arrivedAt: st.arrivedAt,
          departedAt: st.departedAt,
          durationMinutes: st.durationMinutes,
        })),
      };
    });
  }

  /**
   * Query full historical shift route for an employee on a specific date.
   */
  async getHistoricalRoute(
    companyId: string | undefined,
    employeeId: string,
    dateStr: string,
  ) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const session = await this.prisma.employeeLocationSession.findFirst({
      where: {
        ...(companyId ? { companyId } : {}),
        employeeId,
        punchInAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        employee: {
          select: {
            fullName: true,
            employeeCode: true,
            jobTitle: true,
            department: { select: { name: true } },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            role: { select: { name: true } },
          },
        },
        points: {
          where: { isFilteredJump: false },
          orderBy: { recordedAt: 'asc' },
          select: {
            id: true,
            latitude: true,
            longitude: true,
            accuracy: true,
            speed: true,
            heading: true,
            batteryLevel: true,
            isMockLocation: true,
            recordedAt: true,
          },
        },
        stops: {
          orderBy: { arrivedAt: 'asc' },
        },
      },
    });

    if (!session) {
      return null;
    }

    const elapsedMs =
      (session.punchOutAt ? new Date(session.punchOutAt).getTime() : new Date().getTime()) -
      new Date(session.punchInAt).getTime();
    const hours = Math.floor(elapsedMs / (1000 * 3600));
    const mins = Math.floor((elapsedMs % (1000 * 3600)) / (1000 * 60));
    const durationFormatted = `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;

    return {
      session: {
        sessionId: session.id,
        employeeId: session.employeeId,
        employeeName: session.employee?.fullName || session.user?.name || 'Staff Member',
        employeeCode: session.employee?.employeeCode,
        department: session.employee?.department?.name || 'Operations',
        punchInAt: session.punchInAt,
        punchInAddress: session.punchInAddress,
        punchInCoordinates: {
          latitude: Number(session.punchInLatitude),
          longitude: Number(session.punchInLongitude),
        },
        punchOutAt: session.punchOutAt,
        punchOutAddress: session.punchOutAddress,
        punchOutCoordinates: session.punchOutLatitude
          ? {
              latitude: Number(session.punchOutLatitude),
              longitude: Number(session.punchOutLongitude),
            }
          : null,
        status: session.status,
        totalDistanceKm: Number(session.totalDistanceKm),
        durationFormatted,
        totalPointsCount: session.totalPointsCount,
        totalStopsCount: session.stops.length,
      },
      points: session.points.map((p) => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        accuracy: p.accuracy,
        speed: p.speed,
        heading: p.heading,
        batteryLevel: p.batteryLevel,
        isMockLocation: p.isMockLocation,
        recordedAt: p.recordedAt,
      })),
      stops: session.stops.map((st, idx) => ({
        stopNumber: idx + 1,
        latitude: Number(st.latitude),
        longitude: Number(st.longitude),
        locationName: st.locationName || `Stop #${idx + 1}`,
        address: st.address,
        arrivedAt: st.arrivedAt,
        departedAt: st.departedAt,
        durationMinutes: st.durationMinutes,
      })),
    };
  }

  /**
   * List tracking sessions for a given date (defaults to today) or employee.
   */
  async getSessions(
    companyId?: string,
    dateStr?: string,
    employeeId?: string,
  ) {
    const targetDate = dateStr || new Date().toISOString().slice(0, 10);
    const [year, month, day] = targetDate.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const sessions = await this.prisma.employeeLocationSession.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        ...(employeeId ? { employeeId } : {}),
        punchInAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            jobTitle: true,
            department: { select: { name: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true } },
          },
        },
        stops: {
          select: { id: true },
        },
      },
      orderBy: { punchInAt: 'desc' },
    });

    return sessions.map((s) => ({
      sessionId: s.id,
      employeeId: s.employeeId,
      employeeName: s.employee?.fullName || s.user?.name || 'Staff Member',
      employeeCode: s.employee?.employeeCode,
      jobTitle: s.employee?.jobTitle || s.user?.role?.name || 'Field Staff',
      department: s.employee?.department?.name || 'Operations',
      punchInAt: s.punchInAt,
      punchInAddress: s.punchInAddress,
      punchOutAt: s.punchOutAt,
      punchOutAddress: s.punchOutAddress,
      status: s.status,
      totalDistanceKm: Number(s.totalDistanceKm),
      totalPointsCount: s.totalPointsCount,
      totalStopsCount: s.stops.length,
    }));
  }
}

