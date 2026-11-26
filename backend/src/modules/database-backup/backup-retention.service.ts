import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class BackupRetentionService {
  private readonly logger = new Logger(BackupRetentionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Evaluates and safely cleans up expired backup archives according to retention policy.
   * STRICT SAFETY: Never deletes the only valid recovery point.
   */
  async enforceRetention(retentionDays = 30): Promise<{ prunedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let prunedCount = 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    this.logger.log(
      `[BackupRetention] Checking for backups older than ${retentionDays} days (cutoff: ${cutoffDate.toISOString()})...`,
    );

    // 1. Fetch all backups marked COMPLETED
    const completedBackups = await (this.prisma as any).backupHistory.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' },
    });

    if (completedBackups.length <= 1) {
      this.logger.log(
        `[BackupRetention] Only ${completedBackups.length} valid backup(s) exist. Retention cleanup skipped to preserve recovery point.`,
      );
      return { prunedCount: 0, errors: [] };
    }

    // The most recent completed backup is protected under all circumstances
    const latestRecoveryPoint = completedBackups[0];

    // 2. Identify candidates older than cutoff date that are NOT the latest recovery point
    const candidates = completedBackups.slice(1).filter((b: any) => new Date(b.startedAt) < cutoffDate);

    for (const candidate of candidates) {
      try {
        if (candidate.id === latestRecoveryPoint.id) {
          continue; // Extra safety check
        }

        // Delete physical archive file if it exists
        if (candidate.storagePath && fs.existsSync(candidate.storagePath)) {
          fs.unlinkSync(candidate.storagePath);
          this.logger.log(`[BackupRetention] Deleted expired backup file: ${candidate.storagePath}`);

          // Also check for any multipart files (.part*.enc) in the directory
          const dir = path.dirname(candidate.storagePath);
          const baseName = path.basename(candidate.storagePath);
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            for (const f of files) {
              if (f.startsWith(baseName) && f !== baseName) {
                try {
                  fs.unlinkSync(path.join(dir, f));
                } catch {
                  /* ignore part cleanup error */
                }
              }
            }
          }
        }

        // Update record storagePath to indicate pruned from local storage
        await (this.prisma as any).backupHistory.update({
          where: { id: candidate.id },
          data: {
            storagePath: null,
            metadata: {
              ...(candidate.metadata as any),
              prunedAt: new Date().toISOString(),
              prunedReason: `Retention policy exceeded (${retentionDays} days)`,
            },
          },
        });

        // Record in audit log
        await this.auditService.log({
          action: 'RETENTION_CLEANUP',
          entityType: 'BackupHistory',
          entityId: candidate.id,
          after: {
            executionId: candidate.executionId,
            prunedAt: new Date().toISOString(),
            retentionDays,
          },
        });

        prunedCount++;
      } catch (err: any) {
        const msg = `Failed to prune candidate ${candidate.executionId}: ${err?.message}`;
        this.logger.error(`[BackupRetention] ${msg}`);
        errors.push(msg);
      }
    }

    this.logger.log(`[BackupRetention] Retention cleanup completed. Pruned: ${prunedCount}, Errors: ${errors.length}`);
    return { prunedCount, errors };
  }
}
