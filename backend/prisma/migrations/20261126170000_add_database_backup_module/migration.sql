-- ==============================================================================
-- Migration: Add Super Admin Database Backup Module Tables
-- 100% Additive & Idempotent (CREATE TABLE IF NOT EXISTS)
-- Zero modification to existing ERP business tables. Zero data loss.
-- ==============================================================================

-- 1. Backup Config Table (singleton per company/system)
CREATE TABLE IF NOT EXISTS "backup_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'default',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "scheduleTime" TEXT NOT NULL DEFAULT '23:00',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "chunkSizeMb" INTEGER NOT NULL DEFAULT 20,
    "encryptionAlgorithm" TEXT NOT NULL DEFAULT 'aes-256-gcm',
    "encryptionKeyId" TEXT NOT NULL DEFAULT 'himalaya-key-v1',
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpSecure" BOOLEAN DEFAULT false,
    "smtpUser" TEXT,
    "smtpPasswordEncrypted" TEXT,
    "smtpFrom" TEXT,
    "lastRunDateIst" TEXT,
    "lastExecutionAt" TIMESTAMP(3),
    "lastStatus" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "backup_configs_key_key" ON "backup_configs"("key");

-- 2. Backup Recipient Table
CREATE TABLE IF NOT EXISTS "backup_recipients" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verifiedAt" TIMESTAMP(3),
    "lastDeliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_recipients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "backup_recipients_email_key" ON "backup_recipients"("email");

-- 3. Backup History Table
CREATE TABLE IF NOT EXISTS "backup_histories" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "scheduledOccurrence" TEXT,
    "filename" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "encryptionAlgorithm" TEXT NOT NULL DEFAULT 'aes-256-gcm',
    "encryptionKeyId" TEXT NOT NULL DEFAULT 'himalaya-key-v1',
    "encryptionSalt" TEXT,
    "encryptionIv" TEXT NOT NULL,
    "encryptionTag" TEXT,
    "executionType" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "chunksCount" INTEGER NOT NULL DEFAULT 1,
    "storagePath" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "verifiedAt" TIMESTAMP(3),
    "verificationResult" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,

    CONSTRAINT "backup_histories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "backup_histories_executionId_key" ON "backup_histories"("executionId");
CREATE INDEX IF NOT EXISTS "backup_histories_status_startedAt_idx" ON "backup_histories"("status", "startedAt");
CREATE INDEX IF NOT EXISTS "backup_histories_scheduledOccurrence_idx" ON "backup_histories"("scheduledOccurrence");

-- 4. Backup Delivery History Table
CREATE TABLE IF NOT EXISTS "backup_delivery_histories" (
    "id" TEXT NOT NULL,
    "backupId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "partsDelivered" INTEGER NOT NULL DEFAULT 1,
    "partsTotal" INTEGER NOT NULL DEFAULT 1,
    "messageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_delivery_histories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "backup_delivery_histories_backupId_fkey" FOREIGN KEY ("backupId") REFERENCES "backup_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "backup_delivery_histories_backupId_status_idx" ON "backup_delivery_histories"("backupId", "status");
CREATE INDEX IF NOT EXISTS "backup_delivery_histories_recipientEmail_idx" ON "backup_delivery_histories"("recipientEmail");

-- 5. Backup Audit Event Table
CREATE TABLE IF NOT EXISTS "backup_audit_events" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "backup_audit_events_action_createdAt_idx" ON "backup_audit_events"("action", "createdAt");
