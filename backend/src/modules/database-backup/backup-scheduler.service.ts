import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DatabaseBackupService } from './database-backup.service';
import { BackupLockService } from './backup-lock.service';
import { PrismaService } from '../../database/prisma.service';

/**
 * Returns current IST date string (YYYY-MM-DD), hour (0-23), and minute (0-59).
 */
export function getIstCurrentTime(): { dateIst: string; hour: number; minute: number } {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = istFormatter.formatToParts(now);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = parseInt(getPart('hour'), 10);
  const minute = parseInt(getPart('minute'), 10);

  return {
    dateIst: `${year}-${month}-${day}`,
    hour,
    minute,
  };
}

@Injectable()
export class BackupSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BackupSchedulerService.name);
  private intervalHandle: NodeJS.Timeout | null = null;
  private startupTimeoutHandle: NodeJS.Timeout | null = null;
  private lastTriggeredDateIst: string | null = null;

  constructor(
    @Inject(forwardRef(() => DatabaseBackupService))
    private readonly backupService: DatabaseBackupService,
    private readonly lockService: BackupLockService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test' || process.env.DISABLE_BACKUP_SCHEDULER === 'true') {
      this.logger.log('[BackupScheduler] Scheduler disabled for test/flag environment.');
      return;
    }

    // 1. Startup check for missed scheduled backup (30s after boot)
    this.startupTimeoutHandle = setTimeout(() => {
      void this.checkMissedScheduledRun();
    }, 30000);
    if (this.startupTimeoutHandle.unref) {
      this.startupTimeoutHandle.unref();
    }

    // 2. Clock tick every 60 seconds
    this.intervalHandle = setInterval(() => {
      void this.tick();
    }, 60 * 1000);
    if (this.intervalHandle.unref) {
      this.intervalHandle.unref();
    }

    this.logger.log(
      '[BackupScheduler] Initialized. Daily automated backup scheduled for 23:00 IST (Asia/Kolkata).',
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

  /**
   * Evaluates the clock every minute against configured schedule time (default 23:00 IST).
   */
  private async tick() {
    const config = await this.lockService.getOrCreateConfig();
    if (!config.isEnabled) {
      return;
    }

    const { dateIst, hour, minute } = getIstCurrentTime();
    const [targetHour, targetMinute] = (config.scheduleTime || '23:00')
      .split(':')
      .map((s: string) => parseInt(s, 10));

    // Match scheduled hour and minute (with 3-minute window)
    if (
      hour === targetHour &&
      minute >= targetMinute &&
      minute <= targetMinute + 3 &&
      this.lastTriggeredDateIst !== dateIst
    ) {
      this.lastTriggeredDateIst = dateIst;
      this.logger.log(`[BackupScheduler] Triggering scheduled daily backup for IST date: ${dateIst}...`);

      try {
        await this.backupService.executeBackup('SCHEDULED', dateIst);
      } catch (err: any) {
        this.logger.error(`[BackupScheduler] Scheduled backup execution failed: ${err?.message}`);
      }
    }
  }

  /**
   * Missed-run policy: if server was down at 23:00 IST, detects and triggers single recovery run.
   */
  private async checkMissedScheduledRun() {
    try {
      const config = await this.lockService.getOrCreateConfig();
      if (!config.isEnabled) return;

      const { dateIst, hour, minute } = getIstCurrentTime();
      const [targetHour, targetMinute] = (config.scheduleTime || '23:00')
        .split(':')
        .map((s: string) => parseInt(s, 10));

      // If current IST time is past scheduled time today, check if today's backup completed
      const isPastTodaySchedule = hour > targetHour || (hour === targetHour && minute >= targetMinute);
      const targetDateToCheck = isPastTodaySchedule ? dateIst : this.getPreviousDate(dateIst);

      const existingRun = await (this.prisma as any).backupHistory.findFirst({
        where: {
          scheduledOccurrence: targetDateToCheck,
          status: 'COMPLETED',
        },
      });

      if (!existingRun) {
        this.logger.warn(
          `[BackupScheduler] Detected missed scheduled backup for ${targetDateToCheck}. Executing single recovery run...`,
        );
        await this.backupService.executeBackup('MISSED_RECOVERY', targetDateToCheck);
      }
    } catch (err: any) {
      this.logger.warn(`[BackupScheduler] Missed run sweep warning: ${err?.message}`);
    }
  }

  private getPreviousDate(dateStr: string): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
}
