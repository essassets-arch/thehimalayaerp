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
import { LocationService } from './location.service';
import { Prisma } from '@prisma/client';
import {
  cleanAndCalculateTrack,
  detectStopsFromPoints,
  formatDurationHm,
  formatIstDayLabel,
  getIstDateListBetween,
  getIstDateString,
  getIstDayBoundsUtc,
  getLastNDaysIst,
  NormalizedTrackPoint,
} from './location-time.util';

export const MAX_TELEPORT_SPEED_KMH = 180; // Ground speed threshold for jump filter
export const STOP_SPEED_THRESHOLD_KMH = 2.5; // Stationary speed threshold
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
    @Optional()
    @Inject(forwardRef(() => LocationService))
    private readonly locationService?: LocationService,
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
    const now = punchData.punchInAt || new Date();
    const todayIst = getIstDateString(now);

    const existingActive = await this.prisma.employeeLocationSession.findFirst({
      where: {
        companyId,
        employeeId,
        status: 'ACTIVE',
      },
      orderBy: { punchInAt: 'desc' },
    });

    if (existingActive) {
      const existingDateIst = getIstDateString(new Date(existingActive.punchInAt));
      if (existingDateIst === todayIst) {
        this.logger.log(
          `Active location session already exists for employee ${employeeId} today (${todayIst}): ${existingActive.id}. Safely reusing.`,
        );
        return existingActive;
      }

      // Prior-day dangling ACTIVE session detected: force-close it cleanly before starting today's shift
      this.logger.warn(
        `Force-closing stale prior-day ACTIVE session ${existingActive.id} (from ${existingDateIst}) for employee ${employeeId} before starting ${todayIst} shift.`,
      );
      await this.forceCloseSessionById(existingActive.id);
    }

    // 3. Database Creation with Partial Unique Index Conflict Recovery
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
    let session = await this.prisma.employeeLocationSession.findFirst({
      where: {
        attendanceId,
        companyId,
      },
    });

    // Fallback: if employee's ACTIVE session was linked to a different attendanceId, close it cleanly
    if (!session) {
      session = await this.prisma.employeeLocationSession.findFirst({
        where: {
          userId,
          companyId,
          status: 'ACTIVE',
        },
        orderBy: { punchInAt: 'desc' },
      });
    }

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

    // Evaluate stationary stops before finalizing
    try {
      await this.evaluateStops(session.id, session.employeeId, companyId);
    } catch (stopErr: any) {
      this.logger.warn(`Stop evaluation on punch-out skipped: ${stopErr?.message}`);
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

    // 5. Broadcast to WebSocket Room for Live Map & sync LatestUserLocation
    if (latestAcceptedPoint && this.locationGateway) {
      try {
        const payload = {
          userId,
          employeeId: session.employeeId,
          sessionId: session.id,
          latitude: Number(latestAcceptedPoint.latitude),
          longitude: Number(latestAcceptedPoint.longitude),
          accuracy: latestAcceptedPoint.accuracy,
          speed: latestAcceptedPoint.speed,
          heading: latestAcceptedPoint.heading,
          batteryLevel: latestAcceptedPoint.batteryLevel,
          totalDistanceKm: Number(updatedDistanceKm),
          totalPointsCount,
          totalStopsCount,
          recordedAt: latestAcceptedPoint.recordedAt,
          serverReceivedAt: now,
          status: 'LIVE',
        };
        this.locationGateway.server
          ?.to(`company:${companyId}:live-users`)
          ?.emit('employee:route:update', payload);
        this.locationGateway.server
          ?.to('global:live-users')
          ?.emit('employee:route:update', payload);

        // Also emit user:location:update for all-users live map
        const userLocPayload = {
          userId,
          sessionId: session.id,
          latitude: Number(latestAcceptedPoint.latitude),
          longitude: Number(latestAcceptedPoint.longitude),
          accuracy: latestAcceptedPoint.accuracy,
          speed: latestAcceptedPoint.speed,
          heading: latestAcceptedPoint.heading,
          batteryLevel: latestAcceptedPoint.batteryLevel,
          capturedAt: latestAcceptedPoint.recordedAt,
          serverReceivedAt: now.toISOString(),
          status: 'ONLINE',
        };
        this.locationGateway.server
          ?.to(`company:${companyId}:live-users`)
          ?.emit('user:location:update', userLocPayload);
        this.locationGateway.server
          ?.to('global:live-users')
          ?.emit('user:location:update', userLocPayload);
      } catch (wsErr: any) {
        this.logger.warn(`Failed to broadcast live update: ${wsErr?.message}`);
      }

      // Sync latestUserLocation for the user's active device session
      try {
        const devSession = await this.prisma.deviceSession.findFirst({
          where: { userId },
          orderBy: { lastSeenAt: 'desc' },
        });
        if (devSession) {
          await this.prisma.latestUserLocation.upsert({
            where: { deviceSessionId: devSession.id },
            create: {
              companyId,
              userId,
              deviceSessionId: devSession.id,
              latitude: new Prisma.Decimal(latestAcceptedPoint.latitude),
              longitude: new Prisma.Decimal(latestAcceptedPoint.longitude),
              accuracy: latestAcceptedPoint.accuracy != null ? Number(latestAcceptedPoint.accuracy) : null,
              altitude: latestAcceptedPoint.altitude != null ? Number(latestAcceptedPoint.altitude) : null,
              speed: latestAcceptedPoint.speed != null ? Number(latestAcceptedPoint.speed) : null,
              heading: latestAcceptedPoint.heading != null ? Number(latestAcceptedPoint.heading) : null,
              batteryLevel: latestAcceptedPoint.batteryLevel != null ? Number(latestAcceptedPoint.batteryLevel) : null,
              capturedAt: new Date(latestAcceptedPoint.recordedAt),
              receivedAt: now,
            },
            update: {
              latitude: new Prisma.Decimal(latestAcceptedPoint.latitude),
              longitude: new Prisma.Decimal(latestAcceptedPoint.longitude),
              accuracy: latestAcceptedPoint.accuracy != null ? Number(latestAcceptedPoint.accuracy) : null,
              altitude: latestAcceptedPoint.altitude != null ? Number(latestAcceptedPoint.altitude) : null,
              speed: latestAcceptedPoint.speed != null ? Number(latestAcceptedPoint.speed) : null,
              heading: latestAcceptedPoint.heading != null ? Number(latestAcceptedPoint.heading) : null,
              batteryLevel: latestAcceptedPoint.batteryLevel != null ? Number(latestAcceptedPoint.batteryLevel) : null,
              capturedAt: new Date(latestAcceptedPoint.recordedAt),
              receivedAt: now,
            },
          });
          await this.prisma.deviceSession.update({
            where: { id: devSession.id },
            data: { lastSeenAt: now, locationPermission: 'GRANTED' },
          });
        }
      } catch (devErr: any) {
        this.logger.warn(`Failed to sync batch point to deviceSession: ${devErr?.message}`);
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
   * Stop detection algorithm: spatial + temporal clustering (<=65m radius for >=5 min)
   * Works reliably even when browser GPS speed is null/0.
   */
  async evaluateStops(sessionId: string, employeeId: string, companyId: string) {
    const rawPoints = await this.prisma.employeeLocationPoint.findMany({
      where: {
        sessionId,
        isFilteredJump: false,
      },
      orderBy: { recordedAt: 'asc' },
    });

    if (rawPoints.length < 2) return;

    const normalized: NormalizedTrackPoint[] = rawPoints.map((p) => ({
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      accuracy: p.accuracy,
      speed: p.speed,
      heading: p.heading,
      batteryLevel: p.batteryLevel,
      recordedAt: new Date(p.recordedAt).toISOString(),
      source: p.source,
    }));

    const { points: cleaned } = cleanAndCalculateTrack(normalized);
    const detected = detectStopsFromPoints(cleaned);

    for (const st of detected) {
      await this.upsertStopRecord(
        sessionId,
        employeeId,
        companyId,
        {
          latitude: new Prisma.Decimal(st.latitude),
          longitude: new Prisma.Decimal(st.longitude),
          recordedAt: st.arrivedAt,
        },
        { recordedAt: st.departedAt },
        st.durationMinutes,
      );
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
      let resolvedAddress = existing.address;
      if (!resolvedAddress && this.locationService) {
        try {
          const geo = await this.locationService.reverseGeocode(
            Number(existing.latitude),
            Number(existing.longitude),
          );
          if (geo?.formattedAddress) resolvedAddress = geo.formattedAddress;
        } catch {
          // ignore geocode failures
        }
      }
      await this.prisma.employeeRouteStop.update({
        where: { id: existing.id },
        data: {
          departedAt,
          durationMinutes,
          ...(resolvedAddress && !existing.address
            ? { address: resolvedAddress }
            : {}),
        },
      });
    } else {
      let resolvedAddress: string | null = null;
      if (this.locationService) {
        try {
          const geo = await this.locationService.reverseGeocode(
            Number(startPoint.latitude),
            Number(startPoint.longitude),
          );
          if (geo?.formattedAddress) resolvedAddress = geo.formattedAddress;
        } catch {
          // ignore geocode failures
        }
      }
      await this.prisma.employeeRouteStop.create({
        data: {
          sessionId,
          employeeId,
          companyId,
          latitude: startPoint.latitude,
          longitude: startPoint.longitude,
          address: resolvedAddress,
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
          orderBy: { recordedAt: 'desc' },
          take: 2000, // Fetch newest 2000 points so today's live route is never cut off
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
            serverReceivedAt: true,
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
      // Chronological order (oldest -> newest), regardless of DB/mock sort direction
      const chronologicalPoints = [...s.points].sort(
        (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      );
      // Find newest accepted GPS point
      const latestPoint =
        chronologicalPoints.length > 0
          ? chronologicalPoints[chronologicalPoints.length - 1]
          : null;
      let stalenessStatus: 'LIVE' | 'GPS_STALE' | 'CONNECTION_DEGRADED' | 'AWAITING_GPS' = 'AWAITING_GPS';
      let minutesSinceLastGps = 0;

      if (latestPoint) {
        const diffMs = now.getTime() - new Date(latestPoint.recordedAt).getTime();
        minutesSinceLastGps = Math.floor(diffMs / 60000);
        if (minutesSinceLastGps > 30) {
          stalenessStatus = 'CONNECTION_DEGRADED';
        } else if (minutesSinceLastGps > 2) {
          stalenessStatus = 'GPS_STALE';
        } else {
          stalenessStatus = 'LIVE';
        }
      }

      const elapsedMs = now.getTime() - new Date(s.punchInAt).getTime();
      const elapsedHours = Math.floor(elapsedMs / (1000 * 3600));
      const elapsedMins = Math.floor((elapsedMs % (1000 * 3600)) / (1000 * 60));
      const durationFormatted = `${String(elapsedHours).padStart(2, '0')}h ${String(elapsedMins).padStart(2, '0')}m`;

      const latestLocation = latestPoint
        ? {
            latitude: Number(latestPoint.latitude),
            longitude: Number(latestPoint.longitude),
            accuracy: latestPoint.accuracy,
            speed: latestPoint.speed,
            heading: latestPoint.heading,
            batteryLevel: latestPoint.batteryLevel,
            isMockLocation: latestPoint.isMockLocation,
            recordedAt: latestPoint.recordedAt,
            serverReceivedAt: latestPoint.serverReceivedAt || latestPoint.recordedAt,
          }
        : null;

      return {
        sessionId: s.id,
        userId: s.userId,
        employeeId: s.employeeId,
        employeeName: s.employee?.fullName || s.user?.name || 'Staff Member',
        employeeCode: s.employee?.employeeCode,
        role: s.user?.role?.name || s.employee?.jobTitle || 'Field Staff',
        department: s.employee?.department?.name || 'Operations',
        punchInAt: s.punchInAt,
        punchInAddress: s.punchInAddress,
        punchIn: {
          latitude: Number(s.punchInLatitude),
          longitude: Number(s.punchInLongitude),
          recordedAt: s.punchInAt,
          address: s.punchInAddress,
          accuracy: s.punchInAccuracy,
        },
        punchInCoordinates: {
          latitude: Number(s.punchInLatitude),
          longitude: Number(s.punchInLongitude),
        },
        status: stalenessStatus,
        hasGpsFix: Boolean(latestPoint),
        minutesSinceLastGps,
        durationFormatted,
        totalDistanceKm: Number(s.totalDistanceKm),
        distanceKm: Number(s.totalDistanceKm),
        totalPointsCount: s.totalPointsCount,
        totalStopsCount: s.stops.length,
        latestLocation,
        currentLocation: latestLocation, // Truthful: null if no GPS point yet. NEVER falls back to punch-in coordinates!
        routePoints: chronologicalPoints.map((p) => ({
          id: p.id,
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          accuracy: p.accuracy,
          speed: p.speed,
          heading: p.heading,
          recordedAt: p.recordedAt,
          serverReceivedAt: p.serverReceivedAt,
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
   * Query full historical shift route for an employee on a specific IST date.
   * Falls back to unified multi-source telemetry (EmployeeLocationPoint + UserLocationHistory + Attendance)
   * when no single shift session was created for that date.
   */
  async getHistoricalRoute(
    companyId: string | undefined,
    employeeId: string,
    dateStr: string,
  ) {
    const { start: startOfDay, end: endOfDay } = getIstDayBoundsUtc(dateStr);

    const session = await this.prisma.employeeLocationSession.findFirst({
      where: {
        ...(companyId ? { companyId } : {}),
        OR: [{ employeeId }, { userId: employeeId }],
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
            id: true,
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
      orderBy: { punchInAt: 'desc' },
    });

    if (session && session.points.length > 0) {
      const elapsedMs =
        (session.punchOutAt
          ? new Date(session.punchOutAt).getTime()
          : new Date().getTime()) - new Date(session.punchInAt).getTime();

      const cleaned = cleanAndCalculateTrack(
        session.points.map((p) => ({
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          accuracy: p.accuracy,
          speed: p.speed,
          heading: p.heading,
          batteryLevel: p.batteryLevel,
          recordedAt: new Date(p.recordedAt).toISOString(),
          source: 'SHIFT_GPS',
        })),
      );

      const stops =
        session.stops.length > 0
          ? session.stops.map((st, idx) => ({
              stopNumber: idx + 1,
              latitude: Number(st.latitude),
              longitude: Number(st.longitude),
              locationName: st.locationName || `Stop #${idx + 1}`,
              address: st.address,
              arrivedAt: st.arrivedAt,
              departedAt: st.departedAt,
              durationMinutes: st.durationMinutes,
            }))
          : detectStopsFromPoints(cleaned.points);

      return {
        session: {
          sessionId: session.id,
          employeeId: session.employeeId,
          employeeName:
            session.employee?.fullName || session.user?.name || 'Staff Member',
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
          totalDistanceKm:
            Number(session.totalDistanceKm) || cleaned.distanceKm,
          durationFormatted: formatDurationHm(elapsedMs),
          totalPointsCount: cleaned.points.length,
          totalStopsCount: stops.length,
        },
        points: cleaned.points,
        stops,
      };
    }

    // Unified fallback across EmployeeLocationPoint + UserLocationHistory + Attendance for that IST date
    const multiDay = await this.getUser7DayHistory(companyId, employeeId, {
      from: dateStr,
      to: dateStr,
    });
    const dayEntry = multiDay?.days?.[0];
    if (!dayEntry || (!dayEntry.hasData && dayEntry.points.length === 0)) {
      return null;
    }

    return {
      session: {
        sessionId: dayEntry.sessionId || `unified-${dateStr}`,
        employeeId: multiDay.user.employeeId || employeeId,
        employeeName: multiDay.user.name,
        employeeCode: multiDay.user.employeeCode,
        department: multiDay.user.department,
        punchInAt: dayEntry.punchIn?.at || dayEntry.firstPingAt,
        punchInAddress: dayEntry.punchIn?.address || null,
        punchInCoordinates: dayEntry.punchIn
          ? { latitude: dayEntry.punchIn.latitude, longitude: dayEntry.punchIn.longitude }
          : null,
        punchOutAt: dayEntry.punchOut?.at || dayEntry.lastPingAt,
        punchOutAddress: dayEntry.punchOut?.address || null,
        punchOutCoordinates: dayEntry.punchOut
          ? { latitude: dayEntry.punchOut.latitude, longitude: dayEntry.punchOut.longitude }
          : null,
        status: dayEntry.status || 'COMPLETED',
        totalDistanceKm: dayEntry.distanceKm,
        durationFormatted: dayEntry.durationFormatted,
        totalPointsCount: dayEntry.pointsCount,
        totalStopsCount: dayEntry.stopsCount,
      },
      points: dayEntry.points,
      stops: dayEntry.stops,
      leads: dayEntry.leads,
    };
  }

  /**
   * Authoritative 7-Day (up to 14-day) unified location history for a specific user/employee.
   * Merges EmployeeLocationPoint + UserLocationHistory (all devices) + Attendance + Stops + CRM Lead visits,
   * bucketed strictly into IST (Asia/Kolkata) calendar days.
   */
  async getUser7DayHistory(
    companyId: string | undefined,
    userIdOrEmployeeId: string,
    options: { days?: number; from?: string; to?: string } = {},
  ) {
    // 1. Resolve User + Linked Employee flexibly by userId OR employeeId
    let userRecord = await this.prisma.user.findUnique({
      where: { id: userIdOrEmployeeId },
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true,
        role: { select: { name: true, code: true } },
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            jobTitle: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!userRecord) {
      const emp = await this.prisma.employee.findUnique({
        where: { id: userIdOrEmployeeId },
        select: {
          id: true,
          userId: true,
          companyId: true,
          fullName: true,
          employeeCode: true,
          jobTitle: true,
          department: { select: { name: true } },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              companyId: true,
              role: { select: { name: true, code: true } },
            },
          },
        },
      });
      if (emp?.user) {
        userRecord = {
          ...emp.user,
          employee: {
            id: emp.id,
            fullName: emp.fullName,
            employeeCode: emp.employeeCode,
            jobTitle: emp.jobTitle,
            department: emp.department,
          },
        };
      }
    }

    if (!userRecord) {
      throw new NotFoundException('User or employee record not found.');
    }

    if (companyId && userRecord.companyId !== companyId) {
      throw new ForbiddenException('Tenant access denied.');
    }

    const targetUserId = userRecord.id;
    const targetEmployeeId = userRecord.employee?.id || null;

    // 2. Compute IST date list (default last 7 days inclusive, max 14 days)
    let dateList: string[];
    if (options.from && options.to) {
      dateList = getIstDateListBetween(options.from, options.to);
      if (dateList.length === 0) {
        throw new BadRequestException('Invalid date range: "from" must be <= "to".');
      }
      if (dateList.length > 14) {
        throw new BadRequestException('Maximum history window is 14 days.');
      }
    } else {
      const days = Math.max(1, Math.min(14, Number(options.days) || 7));
      dateList = getLastNDaysIst(days);
    }

    const fromDateStr = dateList[0];
    const toDateStr = dateList[dateList.length - 1];
    const { start: rangeStart } = getIstDayBoundsUtc(fromDateStr);
    const { end: rangeEnd } = getIstDayBoundsUtc(toDateStr);

    // 3. Query all telemetry sources in parallel across the entire IST window
    const [shiftPoints, deviceHistPoints, attendances, persistedStops, leads] =
      await Promise.all([
        this.prisma.employeeLocationPoint.findMany({
          where: {
            userId: targetUserId,
            isFilteredJump: false,
            recordedAt: { gte: rangeStart, lte: rangeEnd },
          },
          orderBy: { recordedAt: 'asc' },
          select: {
            sessionId: true,
            latitude: true,
            longitude: true,
            accuracy: true,
            speed: true,
            heading: true,
            batteryLevel: true,
            source: true,
            recordedAt: true,
          },
        }),
        this.prisma.userLocationHistory.findMany({
          where: {
            userId: targetUserId,
            capturedAt: { gte: rangeStart, lte: rangeEnd },
          },
          orderBy: { capturedAt: 'asc' },
          select: {
            latitude: true,
            longitude: true,
            accuracy: true,
            speed: true,
            heading: true,
            capturedAt: true,
          },
        }),
        this.prisma.attendance.findMany({
          where: {
            OR: [
              { userId: targetUserId },
              ...(targetEmployeeId ? [{ employeeId: targetEmployeeId }] : []),
            ],
            punchInAt: { gte: rangeStart, lte: rangeEnd },
          },
          orderBy: { punchInAt: 'asc' },
          select: {
            id: true,
            punchInAt: true,
            punchInLatitude: true,
            punchInLongitude: true,
            punchInAccuracy: true,
            punchInAddress: true,
            punchOutAt: true,
            punchOutLatitude: true,
            punchOutLongitude: true,
            punchOutAccuracy: true,
            punchOutAddress: true,
            status: true,
            locationSession: { select: { id: true, status: true } },
          },
        }),
        targetEmployeeId
          ? this.prisma.employeeRouteStop.findMany({
              where: {
                employeeId: targetEmployeeId,
                arrivedAt: { gte: rangeStart, lte: rangeEnd },
              },
              orderBy: { arrivedAt: 'asc' },
            })
          : Promise.resolve([]),
        this.prisma.lead.findMany({
          where: {
            deletedAt: null,
            OR: [
              { salesExecutiveId: targetUserId },
              { createdById: targetUserId },
            ],
            createdAt: { gte: rangeStart, lte: rangeEnd },
          },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            leadNumber: true,
            companyName: true,
            contactPerson: true,
            address: true,
            createdAt: true,
          },
        }),
      ]);

    // 4. Bucket raw records by IST YYYY-MM-DD
    const rawPointsByDay = new Map<string, NormalizedTrackPoint[]>();
    const sessionIdByDay = new Map<string, string>();
    const attendanceByDay = new Map<string, (typeof attendances)[0]>();
    const stopsByDay = new Map<string, any[]>();
    const leadsByDay = new Map<string, any[]>();

    for (const d of dateList) {
      rawPointsByDay.set(d, []);
      stopsByDay.set(d, []);
      leadsByDay.set(d, []);
    }

    for (const p of shiftPoints) {
      const dStr = getIstDateString(new Date(p.recordedAt));
      if (!rawPointsByDay.has(dStr)) continue;
      if (!sessionIdByDay.has(dStr)) sessionIdByDay.set(dStr, p.sessionId);
      rawPointsByDay.get(dStr)!.push({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        accuracy: p.accuracy,
        speed: p.speed,
        heading: p.heading,
        batteryLevel: p.batteryLevel,
        recordedAt: new Date(p.recordedAt).toISOString(),
        source: p.source || 'SHIFT_GPS',
      });
    }

    for (const h of deviceHistPoints) {
      const dStr = getIstDateString(new Date(h.capturedAt));
      if (!rawPointsByDay.has(dStr)) continue;
      rawPointsByDay.get(dStr)!.push({
        latitude: Number(h.latitude),
        longitude: Number(h.longitude),
        accuracy: h.accuracy,
        speed: h.speed,
        heading: h.heading,
        batteryLevel: null,
        recordedAt: new Date(h.capturedAt).toISOString(),
        source: 'DEVICE_HISTORY',
      });
    }

    for (const att of attendances) {
      if (!att.punchInAt) continue;
      const dStr = getIstDateString(new Date(att.punchInAt));
      if (!rawPointsByDay.has(dStr)) continue;
      attendanceByDay.set(dStr, att);
      if (att.locationSession?.id) {
        sessionIdByDay.set(dStr, att.locationSession.id);
      }
      if (att.punchInLatitude != null && att.punchInLongitude != null) {
        rawPointsByDay.get(dStr)!.push({
          latitude: Number(att.punchInLatitude),
          longitude: Number(att.punchInLongitude),
          accuracy: att.punchInAccuracy ?? null,
          speed: 0,
          heading: null,
          batteryLevel: null,
          recordedAt: new Date(att.punchInAt).toISOString(),
          source: 'PUNCH_IN_SNAPSHOT',
        });
      }
      if (
        att.punchOutAt &&
        att.punchOutLatitude != null &&
        att.punchOutLongitude != null
      ) {
        rawPointsByDay.get(dStr)!.push({
          latitude: Number(att.punchOutLatitude),
          longitude: Number(att.punchOutLongitude),
          accuracy: att.punchOutAccuracy ?? null,
          speed: 0,
          heading: null,
          batteryLevel: null,
          recordedAt: new Date(att.punchOutAt).toISOString(),
          source: 'PUNCH_OUT_SNAPSHOT',
        });
      }
    }

    for (const st of persistedStops) {
      const dStr = getIstDateString(new Date(st.arrivedAt));
      if (stopsByDay.has(dStr)) {
        stopsByDay.get(dStr)!.push(st);
      }
    }

    for (const l of leads) {
      const dStr = getIstDateString(new Date(l.createdAt));
      if (!leadsByDay.has(dStr)) continue;
      const addr: any =
        l.address && typeof l.address === 'object' ? l.address : {};
      const lat =
        addr.deliveryLatitude ?? addr.latitude ?? addr.lat ?? null;
      const lng =
        addr.deliveryLongitude ?? addr.longitude ?? addr.lng ?? null;
      const formattedAddress =
        addr.formattedAddress ||
        [addr.line1, addr.city, addr.state].filter(Boolean).join(', ') ||
        null;
      leadsByDay.get(dStr)!.push({
        id: l.id,
        leadNumber: l.leadNumber,
        companyName: l.companyName,
        contactPerson: l.contactPerson,
        createdAt: l.createdAt.toISOString(),
        latitude: lat != null && !isNaN(Number(lat)) ? Number(lat) : null,
        longitude: lng != null && !isNaN(Number(lng)) ? Number(lng) : null,
        address: formattedAddress,
      });
    }

    // 5. Build clean per-day analytics + reverse geocode up to 12 stop addresses (cached!)
    let geocodeBudget = 12;
    const daysResult: any[] = [];
    let totalDistanceKm = 0;
    let totalStops = 0;
    let totalPoints = 0;
    let daysTracked = 0;
    let daysPunchedIn = 0;
    let totalLeadsCaptured = 0;

    for (const dStr of dateList) {
      const { points: cleanedPts, distanceKm } = cleanAndCalculateTrack(
        rawPointsByDay.get(dStr) || [],
      );
      const att = attendanceByDay.get(dStr) || null;
      const dayLeads = leadsByDay.get(dStr) || [];
      const dayPersistedStops = stopsByDay.get(dStr) || [];

      let dayStops =
        dayPersistedStops.length > 0
          ? dayPersistedStops.map((st, idx) => ({
              stopNumber: idx + 1,
              latitude: Number(st.latitude),
              longitude: Number(st.longitude),
              arrivedAt: new Date(st.arrivedAt).toISOString(),
              departedAt: st.departedAt
                ? new Date(st.departedAt).toISOString()
                : new Date(st.arrivedAt).toISOString(),
              durationMinutes: st.durationMinutes,
              address: st.address || null,
              locationName: st.locationName || `Stop #${idx + 1}`,
            }))
          : detectStopsFromPoints(cleanedPts);

      // Enrich missing stop addresses via cached reverseGeocode within budget
      if (this.locationService && dayStops.length > 0) {
        dayStops = await Promise.all(
          dayStops.map(async (st) => {
            if (st.address || geocodeBudget <= 0) return st;
            geocodeBudget--;
            try {
              const geo = await this.locationService!.reverseGeocode(
                st.latitude,
                st.longitude,
              );
              return {
                ...st,
                address: geo?.formattedAddress || st.address,
              };
            } catch {
              return st;
            }
          }),
        );
      }

      // Downsample only if an extreme day exceeds 1,500 points (preserving start/end)
      let displayPoints = cleanedPts;
      let truncated = false;
      if (cleanedPts.length > 1500) {
        truncated = true;
        const sampled: NormalizedTrackPoint[] = [cleanedPts[0]];
        const step = (cleanedPts.length - 2) / 1498;
        for (let i = 1; i < 1499; i++) {
          sampled.push(cleanedPts[Math.round(i * step)]);
        }
        sampled.push(cleanedPts[cleanedPts.length - 1]);
        displayPoints = sampled;
      }

      const firstPingAt =
        cleanedPts.length > 0 ? cleanedPts[0].recordedAt : null;
      const lastPingAt =
        cleanedPts.length > 0
          ? cleanedPts[cleanedPts.length - 1].recordedAt
          : null;

      const startTimeMs = att?.punchInAt
        ? new Date(att.punchInAt).getTime()
        : firstPingAt
          ? new Date(firstPingAt).getTime()
          : 0;
      const endTimeMs = att?.punchOutAt
        ? new Date(att.punchOutAt).getTime()
        : lastPingAt
          ? new Date(lastPingAt).getTime()
          : startTimeMs;
      const durationMs =
        startTimeMs && endTimeMs > startTimeMs ? endTimeMs - startTimeMs : 0;

      const hasData = cleanedPts.length > 0 || Boolean(att);
      if (hasData) daysTracked++;
      if (att) daysPunchedIn++;
      totalDistanceKm += distanceKm;
      totalStops += dayStops.length;
      totalPoints += cleanedPts.length;
      totalLeadsCaptured += dayLeads.length;

      daysResult.push({
        date: dStr,
        dayLabel: formatIstDayLabel(dStr),
        hasData,
        sessionId: sessionIdByDay.get(dStr) || null,
        status: att?.punchOutAt
          ? 'COMPLETED'
          : dStr === getIstDateString() && att
            ? 'ACTIVE'
            : hasData
              ? 'RECORDED'
              : 'NO_DATA',
        punchIn: att?.punchInAt
          ? {
              at: att.punchInAt.toISOString(),
              latitude:
                att.punchInLatitude != null
                  ? Number(att.punchInLatitude)
                  : cleanedPts[0]?.latitude ?? null,
              longitude:
                att.punchInLongitude != null
                  ? Number(att.punchInLongitude)
                  : cleanedPts[0]?.longitude ?? null,
              address: att.punchInAddress || null,
            }
          : null,
        punchOut: att?.punchOutAt
          ? {
              at: att.punchOutAt.toISOString(),
              latitude:
                att.punchOutLatitude != null
                  ? Number(att.punchOutLatitude)
                  : null,
              longitude:
                att.punchOutLongitude != null
                  ? Number(att.punchOutLongitude)
                  : null,
              address: att.punchOutAddress || null,
            }
          : null,
        firstPingAt,
        lastPingAt,
        distanceKm: Math.round(distanceKm * 100) / 100,
        durationMinutes: Math.round(durationMs / 60000),
        durationFormatted: formatDurationHm(durationMs),
        pointsCount: cleanedPts.length,
        truncated,
        stopsCount: dayStops.length,
        leadsCount: dayLeads.length,
        points: displayPoints,
        stops: dayStops,
        leads: dayLeads,
      });
    }

    return {
      user: {
        userId: userRecord.id,
        employeeId: targetEmployeeId,
        name: userRecord.employee?.fullName || userRecord.name,
        email: userRecord.email,
        employeeCode: userRecord.employee?.employeeCode || null,
        role: userRecord.role?.name || userRecord.employee?.jobTitle || 'Staff',
        roleCode: userRecord.role?.code || 'STAFF',
        department: userRecord.employee?.department?.name || 'Operations',
      },
      range: {
        from: fromDateStr,
        to: toDateStr,
        daysCount: dateList.length,
        timezone: 'Asia/Kolkata',
      },
      totals: {
        daysTracked,
        daysPunchedIn,
        totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
        avgDailyDistanceKm:
          daysTracked > 0
            ? Math.round((totalDistanceKm / daysTracked) * 100) / 100
            : 0,
        totalStops,
        totalPoints,
        totalLeadsCaptured,
      },
      days: daysResult,
    };
  }

  /**
   * Fast 7-day telemetry overview for all active users so Super Admin UI can badge
   * each employee with their 7-day tracked days, points count, and punch-ins.
   */
  async getUsers7DayOverview(companyId?: string, days = 7) {
    const dateList = getLastNDaysIst(days);
    const { start: rangeStart } = getIstDayBoundsUtc(dateList[0]);
    const { end: rangeEnd } = getIstDayBoundsUtc(dateList[dateList.length - 1]);

    const companyFilter = companyId ? { companyId } : {};

    const [shiftPts, histPts, atts] = await Promise.all([
      this.prisma.employeeLocationPoint.findMany({
        where: {
          ...companyFilter,
          isFilteredJump: false,
          recordedAt: { gte: rangeStart, lte: rangeEnd },
        },
        select: { userId: true, recordedAt: true },
      }),
      this.prisma.userLocationHistory.findMany({
        where: {
          ...companyFilter,
          capturedAt: { gte: rangeStart, lte: rangeEnd },
        },
        select: { userId: true, capturedAt: true },
      }),
      this.prisma.attendance.findMany({
        where: {
          ...companyFilter,
          punchInAt: { gte: rangeStart, lte: rangeEnd },
        },
        select: { userId: true, punchInAt: true },
      }),
    ]);

    const byUser = new Map<
      string,
      {
        daysSet: Set<string>;
        pointsCount: number;
        punchInsCount: number;
        lastRecordedAt: string | null;
      }
    >();

    const ensure = (uid: string) => {
      let e = byUser.get(uid);
      if (!e) {
        e = {
          daysSet: new Set<string>(),
          pointsCount: 0,
          punchInsCount: 0,
          lastRecordedAt: null,
        };
        byUser.set(uid, e);
      }
      return e;
    };

    const touchTime = (e: { lastRecordedAt: string | null }, dt: Date) => {
      const iso = dt.toISOString();
      if (!e.lastRecordedAt || iso > e.lastRecordedAt) {
        e.lastRecordedAt = iso;
      }
    };

    for (const p of shiftPts) {
      const e = ensure(p.userId);
      const dt = new Date(p.recordedAt);
      e.daysSet.add(getIstDateString(dt));
      e.pointsCount++;
      touchTime(e, dt);
    }

    for (const h of histPts) {
      const e = ensure(h.userId);
      const dt = new Date(h.capturedAt);
      e.daysSet.add(getIstDateString(dt));
      e.pointsCount++;
      touchTime(e, dt);
    }

    for (const a of atts) {
      if (!a.userId || !a.punchInAt) continue;
      const e = ensure(a.userId);
      const dt = new Date(a.punchInAt);
      e.daysSet.add(getIstDateString(dt));
      e.punchInsCount++;
      touchTime(e, dt);
    }

    const overview: Record<
      string,
      {
        daysTracked: number;
        pointsCount: number;
        punchInsCount: number;
        lastRecordedAt: string | null;
      }
    > = {};

    for (const [uid, stats] of byUser.entries()) {
      overview[uid] = {
        daysTracked: stats.daysSet.size,
        pointsCount: stats.pointsCount,
        punchInsCount: stats.punchInsCount,
        lastRecordedAt: stats.lastRecordedAt,
      };
    }

    return {
      range: { from: dateList[0], to: dateList[dateList.length - 1], days: dateList.length },
      byUserId: overview,
    };
  }

  /**
   * Offline-capable batch ingestion for Web/PWA clients (works both on-shift and off-shift).
   */
  async recordWebBatchPoints(
    userId: string,
    companyId: string,
    body: { sessionId?: string; points: SingleTrackingPointDto[] },
  ) {
    if (!body?.points || body.points.length === 0) {
      return { success: true, acceptedCount: 0 };
    }

    const sorted = [...body.points]
      .filter(
        (p) =>
          p &&
          Number.isFinite(Number(p.latitude)) &&
          Number.isFinite(Number(p.longitude)),
      )
      .sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      )
      .slice(0, 200);

    if (sorted.length === 0) {
      return { success: true, acceptedCount: 0 };
    }

    let devSession = body.sessionId
      ? await this.prisma.deviceSession.findUnique({
          where: { sessionId: body.sessionId },
        })
      : null;
    if (!devSession || devSession.userId !== userId) {
      devSession = await this.prisma.deviceSession.findFirst({
        where: { userId },
        orderBy: { lastSeenAt: 'desc' },
      });
    }

    const now = new Date();
    const todayIst = getIstDateString(now);

    const activeShift = await this.prisma.employeeLocationSession.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { punchInAt: 'desc' },
    });

    let activeTodayShift = activeShift;
    if (
      activeTodayShift &&
      getIstDateString(new Date(activeTodayShift.punchInAt)) !== todayIst
    ) {
      await this.forceCloseSessionById(activeTodayShift.id);
      activeTodayShift = null;
    }

    let acceptedCount = 0;
    let newestPt: SingleTrackingPointDto | null = null;

    for (const pt of sorted) {
      const recordedDate = new Date(pt.recordedAt);
      if (isNaN(recordedDate.getTime())) continue;
      if (recordedDate.getTime() - now.getTime() > FUTURE_TIMESTAMP_TOLERANCE_MS) {
        continue;
      }

      if (devSession) {
        try {
          await this.prisma.userLocationHistory.create({
            data: {
              companyId,
              userId,
              deviceSessionId: devSession.id,
              latitude: new Prisma.Decimal(Number(pt.latitude)),
              longitude: new Prisma.Decimal(Number(pt.longitude)),
              accuracy: pt.accuracy != null ? Number(pt.accuracy) : null,
              altitude: pt.altitude != null ? Number(pt.altitude) : null,
              speed: pt.speed != null ? Number(pt.speed) : null,
              heading: pt.heading != null ? Number(pt.heading) : null,
              capturedAt: recordedDate,
              receivedAt: now,
            },
          });
        } catch {
          // ignore duplicate/constraint warnings
        }
      }

      if (
        activeTodayShift &&
        getIstDateString(recordedDate) === todayIst
      ) {
        const clientPointId =
          pt.clientPointId || `web-batch-${userId}-${recordedDate.getTime()}`;
        try {
          await this.prisma.employeeLocationPoint.upsert({
            where: {
              sessionId_clientPointId: {
                sessionId: activeTodayShift.id,
                clientPointId,
              },
            },
            create: {
              sessionId: activeTodayShift.id,
              companyId: activeTodayShift.companyId,
              employeeId: activeTodayShift.employeeId,
              userId,
              clientPointId,
              latitude: new Prisma.Decimal(Number(pt.latitude)),
              longitude: new Prisma.Decimal(Number(pt.longitude)),
              accuracy: pt.accuracy != null ? Number(pt.accuracy) : null,
              altitude: pt.altitude != null ? Number(pt.altitude) : null,
              speed: pt.speed != null ? Number(pt.speed) : null,
              heading: pt.heading != null ? Number(pt.heading) : null,
              batteryLevel:
                pt.batteryLevel != null ? Number(pt.batteryLevel) : null,
              source: pt.source || 'WEB_OFFLINE_SYNC',
              recordedAt: recordedDate,
              serverReceivedAt: now,
            },
            update: { serverReceivedAt: now },
          });
        } catch {
          // ignore conflict
        }
      }

      acceptedCount++;
      newestPt = pt;
    }

    if (newestPt && devSession) {
      const newestDate = new Date(newestPt.recordedAt);
      const existingLatest = await this.prisma.latestUserLocation.findUnique({
        where: { deviceSessionId: devSession.id },
      });
      if (!existingLatest || newestDate > new Date(existingLatest.capturedAt)) {
        await this.prisma.latestUserLocation.upsert({
          where: { deviceSessionId: devSession.id },
          create: {
            companyId,
            userId,
            deviceSessionId: devSession.id,
            latitude: new Prisma.Decimal(Number(newestPt.latitude)),
            longitude: new Prisma.Decimal(Number(newestPt.longitude)),
            accuracy: newestPt.accuracy != null ? Number(newestPt.accuracy) : null,
            altitude: newestPt.altitude != null ? Number(newestPt.altitude) : null,
            speed: newestPt.speed != null ? Number(newestPt.speed) : null,
            heading: newestPt.heading != null ? Number(newestPt.heading) : null,
            batteryLevel:
              newestPt.batteryLevel != null ? Number(newestPt.batteryLevel) : null,
            capturedAt: newestDate,
            receivedAt: now,
          },
          update: {
            latitude: new Prisma.Decimal(Number(newestPt.latitude)),
            longitude: new Prisma.Decimal(Number(newestPt.longitude)),
            accuracy: newestPt.accuracy != null ? Number(newestPt.accuracy) : null,
            altitude: newestPt.altitude != null ? Number(newestPt.altitude) : null,
            speed: newestPt.speed != null ? Number(newestPt.speed) : null,
            heading: newestPt.heading != null ? Number(newestPt.heading) : null,
            batteryLevel:
              newestPt.batteryLevel != null ? Number(newestPt.batteryLevel) : null,
            capturedAt: newestDate,
            receivedAt: now,
          },
        });
      }
      await this.prisma.deviceSession.update({
        where: { id: devSession.id },
        data: { lastSeenAt: now, locationPermission: 'GRANTED' },
      });
    }

    if (activeTodayShift && acceptedCount > 0) {
      const distKm = await this.recalculateSessionDistanceKm(activeTodayShift.id);
      const ptsCount = await this.prisma.employeeLocationPoint.count({
        where: { sessionId: activeTodayShift.id },
      });
      await this.evaluateStops(
        activeTodayShift.id,
        activeTodayShift.employeeId,
        activeTodayShift.companyId,
      );
      const stopsCount = await this.prisma.employeeRouteStop.count({
        where: { sessionId: activeTodayShift.id },
      });
      await this.prisma.employeeLocationSession.update({
        where: { id: activeTodayShift.id },
        data: {
          totalDistanceKm: new Prisma.Decimal(distKm),
          totalPointsCount: ptsCount,
          totalStopsCount: stopsCount,
        },
      });
    }

    return { success: true, acceptedCount };
  }

  /**
   * Force-close a single ACTIVE session cleanly (caps punchOutAt to the session's punchIn IST date).
   */
  async forceCloseSessionById(sessionId: string): Promise<void> {
    const session = await this.prisma.employeeLocationSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.status !== 'ACTIVE') return;

    const punchInDateIst = getIstDateString(new Date(session.punchInAt));
    const { start: dayStart, end: dayEnd } = getIstDayBoundsUtc(punchInDateIst);

    // Compute accurate metrics strictly for the session's original IST shift date
    const sameDayPoints = await this.prisma.employeeLocationPoint.findMany({
      where: {
        sessionId: session.id,
        isFilteredJump: false,
        recordedAt: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { recordedAt: 'asc' },
    });

    const normalized: NormalizedTrackPoint[] = sameDayPoints.map((p) => ({
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      accuracy: p.accuracy,
      speed: p.speed,
      heading: p.heading,
      batteryLevel: p.batteryLevel,
      recordedAt: new Date(p.recordedAt).toISOString(),
      source: p.source,
    }));

    const { points: cleaned, distanceKm } = cleanAndCalculateTrack(normalized);
    const detectedStops = detectStopsFromPoints(cleaned);

    for (const st of detectedStops) {
      await this.upsertStopRecord(
        session.id,
        session.employeeId,
        session.companyId,
        {
          latitude: new Prisma.Decimal(st.latitude),
          longitude: new Prisma.Decimal(st.longitude),
          recordedAt: st.arrivedAt,
        },
        { recordedAt: st.departedAt },
        st.durationMinutes,
      );
    }

    const lastSameDayPt =
      cleaned.length > 0 ? cleaned[cleaned.length - 1] : null;
    const closedAt = lastSameDayPt
      ? new Date(lastSameDayPt.recordedAt)
      : dayEnd;

    await this.prisma.employeeLocationSession.update({
      where: { id: session.id },
      data: {
        status: 'FORCE_CLOSED',
        punchOutAt: closedAt,
        punchOutLatitude: lastSameDayPt
          ? new Prisma.Decimal(lastSameDayPt.latitude)
          : null,
        punchOutLongitude: lastSameDayPt
          ? new Prisma.Decimal(lastSameDayPt.longitude)
          : null,
        totalDistanceKm: new Prisma.Decimal(distanceKm),
        totalPointsCount: cleaned.length,
        totalStopsCount: detectedStops.length,
      },
    });
  }

  /**
   * Close all dangling ACTIVE sessions from prior IST days (or including today at 23:55 IST).
   */
  async forceCloseStaleActiveSessions(includeToday = false): Promise<number> {
    const todayIst = getIstDateString(new Date());
    const activeSessions = await this.prisma.employeeLocationSession.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, punchInAt: true, userId: true, companyId: true },
    });

    let closedCount = 0;
    for (const s of activeSessions) {
      const sessionDateIst = getIstDateString(new Date(s.punchInAt));
      if (includeToday || sessionDateIst < todayIst) {
        await this.forceCloseSessionById(s.id);
        closedCount++;
      }
    }
    return closedCount;
  }

  /**
   * Prune raw shift GPS points older than retention window (default 30 days)
   * while preserving daily summary rollups & stops.
   */
  async cleanupExpiredShiftPoints(): Promise<number> {
    const retentionDays =
      Number(process.env.LOCATION_HISTORY_RETENTION_DAYS) || 30;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const result = await this.prisma.employeeLocationPoint.deleteMany({
      where: {
        recordedAt: { lt: cutoff },
      },
    });
    return result.count;
  }

  /**
   * List tracking sessions for a given IST date (defaults to today IST) or employee.
   */
  async getSessions(
    companyId?: string,
    dateStr?: string,
    employeeId?: string,
  ) {
    const targetDate = dateStr || getIstDateString(new Date());
    const { start: startOfDay, end: endOfDay } = getIstDayBoundsUtc(targetDate);

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

