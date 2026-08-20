-- One canonical metadata format for notifications emitted by every ERP module.
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

ALTER TABLE "Notification"
  ADD COLUMN "module" TEXT NOT NULL DEFAULT 'SYSTEM',
  ADD COLUMN "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN "actorUserId" TEXT,
  ADD COLUMN "actorName" TEXT;

CREATE INDEX "Notification_companyId_userId_priority_createdAt_idx"
  ON "Notification"("companyId", "userId", "priority", "createdAt");
