-- AlterTable
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "route" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "eventKey" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "FcmDeviceToken" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL DEFAULT 'web',
    "userAgent" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FcmDeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Notification_eventKey_key" ON "Notification"("eventKey");
CREATE INDEX IF NOT EXISTS "Notification_companyId_userId_isRead_createdAt_idx" ON "Notification"("companyId", "userId", "isRead", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_status_idx" ON "Notification"("userId", "status");
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_companyId_idx" ON "Notification"("companyId");
CREATE INDEX IF NOT EXISTS "Notification_entityType_entityId_idx" ON "Notification"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "Notification_eventKey_idx" ON "Notification"("eventKey");

CREATE UNIQUE INDEX IF NOT EXISTS "FcmDeviceToken_token_key" ON "FcmDeviceToken"("token");
CREATE INDEX IF NOT EXISTS "FcmDeviceToken_userId_idx" ON "FcmDeviceToken"("userId");
CREATE INDEX IF NOT EXISTS "FcmDeviceToken_companyId_idx" ON "FcmDeviceToken"("companyId");

-- AddForeignKey (idempotent for databases where a previous attempt applied it)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FcmDeviceToken_companyId_fkey') THEN
    ALTER TABLE "FcmDeviceToken" ADD CONSTRAINT "FcmDeviceToken_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FcmDeviceToken_userId_fkey') THEN
    ALTER TABLE "FcmDeviceToken" ADD CONSTRAINT "FcmDeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
