import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { LocationService } from './location.service';
import { getIstHourMinute } from './location-time.util';

/**
 * Lightweight, zero-dependency scheduler for daily IST location session hygiene:
 *  - Startup sweep (15s after boot): closes any stale ACTIVE sessions from prior IST days.
 *  - 23:55 IST daily: auto-closes remaining active shift sessions as FORCE_CLOSED,
 *    detects stationary stops, and updates EmployeeDailyLocationSummary rollups.
 *  - 03:00 IST daily: prunes raw location points & stale device sessions older than retention window (default 30d).
 */
@Injectable()
export class LocationSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LocationSchedulerService.name);
  private intervalHandle: NodeJS.Timeout | null = null;
  private startupTimeoutHandle: NodeJS.Timeout | null = null;
  private lastCloseDateIst: string | null = null;
  private lastCleanupDateIst: string | null = null;

  constructor(
    @Inject(forwardRef(() => LocationTrackingService))
    private readonly locationTrackingService: LocationTrackingService,
    @Inject(forwardRef(() => LocationService))
    private readonly locationService: LocationService,
  ) {}

  onModuleInit() {
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.DISABLE_LOCATION_SCHEDULER === 'true'
    ) {
      return;
    }

    // 1. Safe startup sweep after boot to close any prior-day zombie ACTIVE sessions
    this.startupTimeoutHandle = setTimeout(() => {
      void this.runStartupSweep();
    }, 15000);
    if (this.startupTimeoutHandle.unref) {
      this.startupTimeoutHandle.unref();
    }

    // 2. Check IST clock every 5 minutes
    this.intervalHandle = setInterval(() => {
      void this.tick();
    }, 5 * 60 * 1000);
    if (this.intervalHandle.unref) {
      this.intervalHandle.unref();
    }

    this.logger.log(
      'LocationSchedulerService initialized (IST nightly auto-close @ 23:55, retention cleanup @ 03:00).',
    );
  }

  onModuleDestroy() {
    if (this.startupTimeoutHandle) {
      clearTimeout(this.startupTimeoutHandle);
      this.startupTimeoutHandle = null;
    }
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private async runStartupSweep() {
    try {
      const closed =
        await this.locationTrackingService.forceCloseStaleActiveSessions(false);
      if (closed > 0) {
        this.logger.log(
          `[Startup Sweep] Auto-closed ${closed} prior-day stale ACTIVE shift location sessions.`,
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `[Startup Sweep] Location session sweep skipped/warning: ${err?.message}`,
      );
    }
  }

  private async tick() {
    const { dateIst, hour, minute } = getIstHourMinute(new Date());

    // 23:55 - 23:59 IST: close all remaining active shifts for the day & persist summaries
    if (hour === 23 && minute >= 54 && this.lastCloseDateIst !== dateIst) {
      this.lastCloseDateIst = dateIst;
      try {
        const closed =
          await this.locationTrackingService.forceCloseStaleActiveSessions(true);
        this.logger.log(
          `[Nightly IST Auto-Close ${dateIst}] Force-closed ${closed} active shift sessions.`,
        );
      } catch (err: any) {
        this.logger.error(
          `[Nightly IST Auto-Close] Failed: ${err?.message}`,
        );
      }
    }

    // 03:00 - 03:10 IST: prune raw points > retentionDays (default 30d) & stale sessions
    if (hour === 3 && minute <= 10 && this.lastCleanupDateIst !== dateIst) {
      this.lastCleanupDateIst = dateIst;
      try {
        const [histPruned, shiftPtsPruned, sessionsPruned] = await Promise.all([
          this.locationService.cleanupExpiredLocationHistory(),
          this.locationTrackingService.cleanupExpiredShiftPoints(),
          this.locationService.cleanupOldSessions(),
        ]);
        this.logger.log(
          `[Nightly Retention ${dateIst}] Pruned userLocationHistory=${histPruned}, shiftPoints=${shiftPtsPruned}, staleDeviceSessions=${sessionsPruned}.`,
        );
      } catch (err: any) {
        this.logger.error(`[Nightly Retention] Failed: ${err?.message}`);
      }
    }
  }
}
