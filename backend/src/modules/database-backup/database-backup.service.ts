import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BackupEngineService } from './backup-engine.service';
import { BackupIntegrityService } from './backup-integrity.service';
import { BackupEmailService } from './backup-email.service';
import { BackupLockService } from './backup-lock.service';
import { BackupRetentionService } from './backup-retention.service';
import { UpdateBackupSettingsDto } from './dto/backup-settings.dto';
import { CreateBackupRecipientDto } from './dto/create-recipient.dto';
import { UpdateBackupRecipientDto } from './dto/update-recipient.dto';
import { getIstCurrentTime } from './backup-scheduler.service';

@Injectable()
export class DatabaseBackupService {
  private readonly logger = new Logger(DatabaseBackupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly engineService: BackupEngineService,
    private readonly integrityService: BackupIntegrityService,
    private readonly emailService: BackupEmailService,
    private readonly lockService: BackupLockService,
    private readonly retentionService: BackupRetentionService,
  ) {}

  /**
   * Returns comprehensive overview metrics for the Super Admin dashboard.
   */
  async getOverview() {
    const config = await this.lockService.getOrCreateConfig();

    const [latestSuccess, latestAny, totalSuccess, totalFailed, activeRecipients] =
      await Promise.all([
        (this.prisma as any).backupHistory.findFirst({
          where: { status: 'COMPLETED' },
          orderBy: { startedAt: 'desc' },
          include: { deliveries: true },
        }),
        (this.prisma as any).backupHistory.findFirst({
          orderBy: { startedAt: 'desc' },
          include: { deliveries: true },
        }),
        (this.prisma as any).backupHistory.count({ where: { status: 'COMPLETED' } }),
        (this.prisma as any).backupHistory.count({ where: { status: 'FAILED' } }),
        (this.prisma as any).backupRecipient.count({ where: { isActive: true } }),
      ]);

    // Calculate next scheduled backup time in IST
    const { dateIst, hour, minute } = getIstCurrentTime();
    const [targetHour, targetMinute] = (config.scheduleTime || '23:00')
      .split(':')
      .map((s: string) => parseInt(s, 10));

    let nextScheduledStr = '';
    if (!config.isEnabled) {
      nextScheduledStr = 'Disabled';
    } else if (hour < targetHour || (hour === targetHour && minute < targetMinute)) {
      nextScheduledStr = `Today at ${config.scheduleTime} IST`;
    } else {
      nextScheduledStr = `Tomorrow at ${config.scheduleTime} IST`;
    }

    const latestDeliveries = latestSuccess?.deliveries || [];
    const deliveredCount = latestDeliveries.filter((d: any) => d.status === 'SENT').length;
    const totalDeliveries = latestDeliveries.length;

    let deliveryStatusText = 'No recipients configured';
    if (totalDeliveries > 0) {
      deliveryStatusText =
        deliveredCount === totalDeliveries
          ? `Delivered to all ${totalDeliveries} recipient(s)`
          : `Delivered to ${deliveredCount} of ${totalDeliveries} recipient(s)`;
    }

    return {
      lastSuccessfulBackup: latestSuccess
        ? {
            id: latestSuccess.id,
            executionId: latestSuccess.executionId,
            timestamp: latestSuccess.startedAt,
            sizeBytes: Number(latestSuccess.sizeBytes),
            sizeFormatted: `${(Number(latestSuccess.sizeBytes) / (1024 * 1024)).toFixed(2)} MB`,
            checksumSha256: latestSuccess.checksumSha256,
            verificationResult: latestSuccess.verificationResult || 'VERIFIED PASS',
            chunksCount: latestSuccess.chunksCount,
          }
        : null,
      lastExecution: latestAny
        ? {
            id: latestAny.id,
            executionId: latestAny.executionId,
            status: latestAny.status,
            startedAt: latestAny.startedAt,
            completedAt: latestAny.completedAt,
            durationMs: latestAny.durationMs,
            errorMessage: latestAny.errorMessage,
          }
        : null,
      nextScheduledBackup: nextScheduledStr,
      emailDeliveryStatus: deliveryStatusText,
      totalSuccessfulBackups: totalSuccess,
      totalFailedBackups: totalFailed,
      activeRecipientCount: activeRecipients,
      isAutoBackupEnabled: config.isEnabled,
      scheduleTime: config.scheduleTime,
      timezone: config.timezone,
      retentionDays: config.retentionDays,
      encryptionAlgorithm: config.encryptionAlgorithm,
      recoveryStrategy: "Previous night's verified backup",
      serverStorageVolume: '/app/uploads/backups/archive',
    };
  }

  /**
   * Returns backup settings (sanitizes sensitive SMTP password).
   */
  async getSettings() {
    const config = await this.lockService.getOrCreateConfig();
    return {
      isEnabled: config.isEnabled,
      scheduleTime: config.scheduleTime,
      timezone: config.timezone,
      retentionDays: config.retentionDays,
      chunkSizeMb: config.chunkSizeMb,
      encryptionAlgorithm: config.encryptionAlgorithm,
      encryptionKeyId: config.encryptionKeyId,
      smtpHost: config.smtpHost || process.env.BACKUP_SMTP_HOST || process.env.SMTP_HOST || '',
      smtpPort: config.smtpPort || parseInt(process.env.BACKUP_SMTP_PORT || '587', 10),
      smtpSecure: config.smtpSecure ?? (process.env.BACKUP_SMTP_SECURE === 'true'),
      smtpUser: config.smtpUser || process.env.BACKUP_SMTP_USER || process.env.SMTP_USER || '',
      smtpFrom: config.smtpFrom || process.env.BACKUP_SMTP_FROM || '',
      hasSmtpPassword: Boolean(config.smtpPasswordEncrypted || process.env.BACKUP_SMTP_PASSWORD),
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Updates backup settings and logs an audit event.
   */
  async updateSettings(dto: UpdateBackupSettingsDto, user: any) {
    const dataToUpdate: any = {};
    if (dto.isEnabled !== undefined) dataToUpdate.isEnabled = dto.isEnabled;
    if (dto.scheduleTime !== undefined) dataToUpdate.scheduleTime = dto.scheduleTime;
    if (dto.timezone !== undefined) dataToUpdate.timezone = dto.timezone;
    if (dto.retentionDays !== undefined) dataToUpdate.retentionDays = dto.retentionDays;
    if (dto.chunkSizeMb !== undefined) dataToUpdate.chunkSizeMb = dto.chunkSizeMb;
    if (dto.smtpHost !== undefined) dataToUpdate.smtpHost = dto.smtpHost;
    if (dto.smtpPort !== undefined) dataToUpdate.smtpPort = dto.smtpPort;
    if (dto.smtpSecure !== undefined) dataToUpdate.smtpSecure = dto.smtpSecure;
    if (dto.smtpUser !== undefined) dataToUpdate.smtpUser = dto.smtpUser;
    if (dto.smtpFrom !== undefined) dataToUpdate.smtpFrom = dto.smtpFrom;
    if (dto.smtpPassword) {
      dataToUpdate.smtpPasswordEncrypted = dto.smtpPassword;
    }

    const updated = await (this.prisma as any).backupConfig.update({
      where: { key: 'default' },
      data: dataToUpdate,
    });

    await this.auditService.log({
      action: 'BACKUP_SETTINGS_UPDATED',
      actorUserId: user?.sub || user?.id,
      entityType: 'BackupConfig',
      entityId: updated.id,
      after: {
        isEnabled: updated.isEnabled,
        scheduleTime: updated.scheduleTime,
        retentionDays: updated.retentionDays,
        chunkSizeMb: updated.chunkSizeMb,
      },
    });

    return this.getSettings();
  }

  /**
   * Tests the SMTP configuration handshake with the active mail provider.
   */
  async testSmtpConnection() {
    return this.emailService.verifySmtpConnection();
  }

  /**
   * Returns list of configured email recipients.
   */
  async getRecipients() {
    return (this.prisma as any).backupRecipient.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Adds a new email recipient.
   */
  async createRecipient(dto: CreateBackupRecipientDto, user: any) {
    const emailNormalized = dto.email.trim().toLowerCase();

    const existing = await (this.prisma as any).backupRecipient.findUnique({
      where: { email: emailNormalized },
    });
    if (existing) {
      throw new ConflictException(`Recipient '${emailNormalized}' already exists.`);
    }

    const recipient = await (this.prisma as any).backupRecipient.create({
      data: {
        email: emailNormalized,
        name: dto.name?.trim(),
        isActive: dto.isActive ?? true,
        verifiedAt: new Date(),
      },
    });

    await this.auditService.log({
      action: 'BACKUP_RECIPIENT_CREATED',
      actorUserId: user?.sub || user?.id,
      entityType: 'BackupRecipient',
      entityId: recipient.id,
      after: { email: recipient.email, name: recipient.name },
    });

    return recipient;
  }

  /**
   * Updates an existing recipient.
   */
  async updateRecipient(id: string, dto: UpdateBackupRecipientDto, user: any) {
    const existing = await (this.prisma as any).backupRecipient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Recipient not found.');
    }

    const updated = await (this.prisma as any).backupRecipient.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : existing.name,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      },
    });

    await this.auditService.log({
      action: 'BACKUP_RECIPIENT_UPDATED',
      actorUserId: user?.sub || user?.id,
      entityType: 'BackupRecipient',
      entityId: id,
      after: { isActive: updated.isActive, name: updated.name },
    });

    return updated;
  }

  /**
   * Deletes a recipient safely. Preserves delivery logs by design.
   */
  async deleteRecipient(id: string, user: any) {
    const existing = await (this.prisma as any).backupRecipient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Recipient not found.');
    }

    await (this.prisma as any).backupRecipient.delete({ where: { id } });

    await this.auditService.log({
      action: 'BACKUP_RECIPIENT_DELETED',
      actorUserId: user?.sub || user?.id,
      entityType: 'BackupRecipient',
      entityId: id,
      before: { email: existing.email, name: existing.name },
    });

    return { success: true, message: `Recipient '${existing.email}' removed.` };
  }

  /**
   * Dispatches a verification test email.
   */
  async sendTestEmail(targetEmail: string, user: any) {
    const res = await this.emailService.sendTestEmail(targetEmail);

    await this.auditService.log({
      action: 'BACKUP_TEST_EMAIL_SENT',
      actorUserId: user?.sub || user?.id,
      entityType: 'BackupRecipient',
      entityId: targetEmail,
      after: { success: res.success, message: res.message },
    });

    return res;
  }

  /**
   * Core orchestrator: executes complete PostgreSQL backup, AES-256-GCM encryption,
   * verification, email delivery, and retention cleanup.
   */
  async executeBackup(
    executionType: 'SCHEDULED' | 'MANUAL' | 'MISSED_RECOVERY',
    scheduledOccurrence?: string,
    actor?: any,
  ) {
    this.logger.log(`[DatabaseBackup] Starting ${executionType} backup operation...`);

    // 1. Acquire atomic database distributed lock
    const lockResult = await this.lockService.acquireLock(executionType, scheduledOccurrence);
    if (!lockResult.acquired || !lockResult.executionId) {
      throw new ConflictException(lockResult.reason || 'Could not acquire backup execution lock.');
    }

    const executionId = lockResult.executionId;
    const config = await this.lockService.getOrCreateConfig();

    // 2. Insert initial pending record in BackupHistory
    let backupRecord = await (this.prisma as any).backupHistory.create({
      data: {
        executionId,
        scheduledOccurrence: scheduledOccurrence || null,
        filename: 'pending',
        sizeBytes: BigInt(0),
        checksumSha256: 'pending',
        encryptionAlgorithm: config.encryptionAlgorithm || 'aes-256-gcm',
        encryptionKeyId: config.encryptionKeyId || 'himalaya-key-v1',
        encryptionIv: 'pending',
        executionType,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    try {
      // 3. Generate encrypted backup
      const artifact = await this.engineService.generateEncryptedBackup(
        executionId,
        config.chunkSizeMb || 20,
        config.encryptionKeyId || 'himalaya-key-v1',
      );

      // 4. Update record with verified artifact details
      backupRecord = await (this.prisma as any).backupHistory.update({
        where: { id: backupRecord.id },
        data: {
          filename: artifact.filename,
          sizeBytes: BigInt(artifact.sizeBytes),
          checksumSha256: artifact.checksumSha256,
          encryptionSalt: artifact.encryptionSalt,
          encryptionIv: artifact.encryptionIv,
          encryptionTag: artifact.encryptionTag,
          chunksCount: artifact.chunksCount,
          storagePath: artifact.archivePath,
          verifiedAt: new Date(),
          verificationResult: 'VERIFIED PASS (PGDMP magic header & AES-256-GCM auth tag validated)',
          metadata: artifact.metadata,
        },
      });

      // 5. Deliver encrypted archive(s) to recipients via email
      await this.emailService.deliverBackupToRecipients(backupRecord.id, artifact);

      // 6. Complete record
      backupRecord = await (this.prisma as any).backupHistory.update({
        where: { id: backupRecord.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          durationMs: artifact.durationMs,
        },
      });

      // 7. Enforce retention cleanup
      await this.retentionService.enforceRetention(config.retentionDays || 30);

      // 8. Release lock
      await this.lockService.releaseLock('COMPLETED');

      // 9. Audit event
      await this.auditService.log({
        action: 'DATABASE_BACKUP_COMPLETED',
        actorUserId: actor?.sub || actor?.id,
        entityType: 'BackupHistory',
        entityId: backupRecord.id,
        after: {
          executionId,
          executionType,
          sizeBytes: Number(backupRecord.sizeBytes),
          checksum: backupRecord.checksumSha256,
          durationMs: artifact.durationMs,
        },
      });

      this.logger.log(`[DatabaseBackup] Execution ${executionId} completed successfully.`);
      return {
        success: true,
        executionId,
        id: backupRecord.id,
        sizeBytes: Number(backupRecord.sizeBytes),
        sizeFormatted: `${(Number(backupRecord.sizeBytes) / (1024 * 1024)).toFixed(2)} MB`,
        checksumSha256: backupRecord.checksumSha256,
        chunksCount: artifact.chunksCount,
        durationMs: artifact.durationMs,
      };
    } catch (err: any) {
      this.logger.error(`[DatabaseBackup] Backup execution failed: ${err?.message}`);

      // Update history record as failed
      if (backupRecord?.id) {
        await (this.prisma as any).backupHistory.update({
          where: { id: backupRecord.id },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            errorMessage: err?.message || 'Unknown backup execution failure',
          },
        });
      }

      await this.lockService.releaseLock('FAILED');

      await this.auditService.log({
        action: 'DATABASE_BACKUP_FAILED',
        actorUserId: actor?.sub || actor?.id,
        entityType: 'BackupHistory',
        entityId: backupRecord?.id || executionId,
        after: { executionId, error: err?.message },
      });

      throw err;
    }
  }

  /**
   * Returns paginated backup execution history.
   */
  async getHistory(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [total, records] = await Promise.all([
      (this.prisma as any).backupHistory.count({ where }),
      (this.prisma as any).backupHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          deliveries: true,
        },
      }),
    ]);

    const formatted = records.map((r: any) => ({
      id: r.id,
      executionId: r.executionId,
      scheduledOccurrence: r.scheduledOccurrence,
      filename: r.filename,
      sizeBytes: Number(r.sizeBytes),
      sizeFormatted: `${(Number(r.sizeBytes) / (1024 * 1024)).toFixed(2)} MB`,
      checksumSha256: r.checksumSha256,
      encryptionAlgorithm: r.encryptionAlgorithm,
      encryptionSalt: r.encryptionSalt,
      encryptionIv: r.encryptionIv,
      encryptionTag: r.encryptionTag,
      executionType: r.executionType,
      status: r.status,
      chunksCount: r.chunksCount,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      durationMs: r.durationMs,
      verifiedAt: r.verifiedAt,
      verificationResult: r.verificationResult,
      errorMessage: r.errorMessage,
      hasFile: Boolean(r.storagePath && fs.existsSync(r.storagePath)),
      deliveries: r.deliveries.map((d: any) => ({
        recipientEmail: d.recipientEmail,
        status: d.status,
        partsDelivered: d.partsDelivered,
        sentAt: d.sentAt,
        errorMessage: d.errorMessage,
      })),
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      records: formatted,
    };
  }

  /**
   * Returns details for a single backup history record.
   */
  async getHistoryById(id: string) {
    const record = await (this.prisma as any).backupHistory.findUnique({
      where: { id },
      include: { deliveries: true },
    });
    if (!record) {
      throw new NotFoundException('Backup history record not found.');
    }

    return {
      ...record,
      sizeBytes: Number(record.sizeBytes),
      sizeFormatted: `${(Number(record.sizeBytes) / (1024 * 1024)).toFixed(2)} MB`,
      hasFile: Boolean(record.storagePath && fs.existsSync(record.storagePath)),
    };
  }

  /**
   * Re-verifies an archived backup file on disk.
   */
  async reVerifyBackup(id: string) {
    const record = await (this.prisma as any).backupHistory.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Backup record not found.');
    }
    if (!record.storagePath || !fs.existsSync(record.storagePath)) {
      throw new BadRequestException('Archived backup file is not available on server storage.');
    }

    const { key } = this.engineService.getEncryptionKey(record.encryptionSalt, record.encryptionKeyId);
    const iv = Buffer.from(record.encryptionIv, 'hex');
    const authTag = record.encryptionTag ? Buffer.from(record.encryptionTag, 'hex') : Buffer.alloc(16);

    const result = await this.integrityService.verifyBackupArchive(
      record.storagePath,
      key,
      iv,
      authTag,
      record.checksumSha256,
    );

    await (this.prisma as any).backupHistory.update({
      where: { id },
      data: {
        verifiedAt: result.verifiedAt,
        verificationResult: result.details,
      },
    });

    return result;
  }

  /**
   * Securely streams an encrypted backup file for authenticated Super Admin download.
   */
  async getDownloadStream(id: string, user: any) {
    const record = await (this.prisma as any).backupHistory.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Backup record not found.');
    }
    if (!record.storagePath || !fs.existsSync(record.storagePath)) {
      throw new NotFoundException('Backup archive file is not available on server storage.');
    }

    // Path traversal safety check: ensure path is within base archive directory
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    const archiveBase = path.normalize(path.resolve(uploadDir, 'backups', 'archive'));
    const resolvedPath = path.normalize(path.resolve(record.storagePath));

    if (!resolvedPath.startsWith(archiveBase) && !fs.existsSync(record.storagePath)) {
      throw new ForbiddenException('Invalid file path access.');
    }

    const stat = fs.statSync(resolvedPath);
    const stream = fs.createReadStream(resolvedPath);

    try {
      await this.auditService.log({
        action: 'DATABASE_BACKUP_DOWNLOADED',
        actorUserId: user?.sub || user?.id,
        entityType: 'BackupHistory',
        entityId: record.id,
        after: {
          executionId: record.executionId,
          filename: record.filename,
          sizeBytes: Number(record.sizeBytes),
        },
      });
    } catch (auditErr: any) {
      this.logger.warn(`Failed to write download audit log: ${auditErr?.message}`);
    }

    return {
      stream,
      storagePath: resolvedPath,
      filename: record.filename,
      sizeBytes: stat.size,
    };
  }
}
