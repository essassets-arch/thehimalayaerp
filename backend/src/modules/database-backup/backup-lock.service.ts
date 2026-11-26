import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface LockAcquireResult {
  acquired: boolean;
  reason?: string;
  executionId?: string;
}

@Injectable()
export class BackupLockService {
  private readonly logger = new Logger(BackupLockService.name);
  private activeLocalExecutionId: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Attempts to acquire an atomic database execution lock.
   * Multi-instance safe and crash-resilient (stale lock expires after 45 minutes).
   */
  async acquireLock(
    type: 'SCHEDULED' | 'MANUAL' | 'MISSED_RECOVERY',
    scheduledOccurrence?: string,
  ): Promise<LockAcquireResult> {
    const config = await this.getOrCreateConfig();

    // 1. Prevent duplicate scheduled execution for the same IST date
    if (scheduledOccurrence && (type === 'SCHEDULED' || type === 'MISSED_RECOVERY')) {
      const existingSuccess = await (this.prisma as any).backupHistory.findFirst({
        where: {
          scheduledOccurrence,
          status: 'COMPLETED',
        },
      });

      if (existingSuccess) {
        this.logger.warn(
          `[BackupLock] Scheduled backup for date ${scheduledOccurrence} already completed. Duplicate run prevented.`,
        );
        return {
          acquired: false,
          reason: `A successful scheduled backup already exists for date ${scheduledOccurrence}.`,
        };
      }
    }

    // 2. Check in-progress status & stale timeout (45 minutes)
    const now = new Date();
    const staleThresholdMs = 45 * 60 * 1000;
    if (config.lastStatus === 'IN_PROGRESS' && config.lastExecutionAt) {
      const elapsed = now.getTime() - new Date(config.lastExecutionAt).getTime();
      if (elapsed < staleThresholdMs) {
        this.logger.warn(
          `[BackupLock] Concurrency conflict: Backup is already in progress (started ${Math.round(elapsed / 1000)}s ago).`,
        );
        return {
          acquired: false,
          reason: `Another backup operation is currently in progress (active for ${Math.round(elapsed / 60000)}m).`,
        };
      }
      this.logger.warn(
        `[BackupLock] Overriding stale lock from ${config.lastExecutionAt.toISOString()} (elapsed > 45m).`,
      );
    }

    // 3. Generate unique execution ID: BKP-YYYYMMDD-HHMMSS-RANDOM
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const executionId = `BKP-${timestampStr}-${randomHex}`;

    // 4. Atomically update config state to IN_PROGRESS
    try {
      await (this.prisma as any).backupConfig.update({
        where: { key: 'default' },
        data: {
          lastStatus: 'IN_PROGRESS',
          lastExecutionAt: now,
          lastRunDateIst: scheduledOccurrence || config.lastRunDateIst,
        },
      });

      this.activeLocalExecutionId = executionId;
      this.logger.log(`[BackupLock] Lock acquired successfully. Execution ID: ${executionId}`);
      return { acquired: true, executionId };
    } catch (err: any) {
      this.logger.error(`[BackupLock] Failed to record lock acquisition: ${err?.message}`);
      return { acquired: false, reason: `Database lock acquisition failed: ${err?.message}` };
    }
  }

  /**
   * Releases the database execution lock with final status.
   */
  async releaseLock(status: 'COMPLETED' | 'FAILED') {
    try {
      await (this.prisma as any).backupConfig.update({
        where: { key: 'default' },
        data: {
          lastStatus: status,
        },
      });
      this.activeLocalExecutionId = null;
      this.logger.log(`[BackupLock] Lock released with status: ${status}`);
    } catch (err: any) {
      this.logger.warn(`[BackupLock] Warning during lock release: ${err?.message}`);
    }
  }

  /**
   * Ensures default singleton configuration exists.
   */
  async getOrCreateConfig() {
    let config = await (this.prisma as any).backupConfig.findUnique({
      where: { key: 'default' },
    });

    if (!config) {
      config = await (this.prisma as any).backupConfig.create({
        data: {
          key: 'default',
          isEnabled: true,
          scheduleTime: '23:00',
          timezone: 'Asia/Kolkata',
          retentionDays: 30,
          chunkSizeMb: 20,
          encryptionAlgorithm: 'aes-256-gcm',
          encryptionKeyId: 'himalaya-key-v1',
        },
      });
    }

    return config;
  }
}
