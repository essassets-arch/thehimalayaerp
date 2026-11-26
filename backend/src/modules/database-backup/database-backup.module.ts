import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { DatabaseBackupController } from './database-backup.controller';
import { DatabaseBackupService } from './database-backup.service';
import { BackupEngineService } from './backup-engine.service';
import { BackupIntegrityService } from './backup-integrity.service';
import { BackupEmailService } from './backup-email.service';
import { BackupSchedulerService } from './backup-scheduler.service';
import { BackupLockService } from './backup-lock.service';
import { BackupRetentionService } from './backup-retention.service';

@Module({
  imports: [PrismaModule, AuditModule, ConfigModule],
  controllers: [DatabaseBackupController],
  providers: [
    DatabaseBackupService,
    BackupEngineService,
    BackupIntegrityService,
    BackupEmailService,
    BackupSchedulerService,
    BackupLockService,
    BackupRetentionService,
  ],
  exports: [DatabaseBackupService, BackupSchedulerService],
})
export class DatabaseBackupModule {}
