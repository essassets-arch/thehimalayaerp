-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "fcmMessageId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "fcmStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "Notification" ADD COLUMN "fcmError" TEXT;
ALTER TABLE "Notification" ADD COLUMN "fcmAttemptedAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN "fcmSuccessCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Notification" ADD COLUMN "fcmFailureCount" INTEGER NOT NULL DEFAULT 0;
