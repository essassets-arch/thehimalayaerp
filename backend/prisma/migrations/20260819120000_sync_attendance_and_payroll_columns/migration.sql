-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceStatus_new" AS ENUM ('NOT_PUNCHED_IN', 'PUNCHED_IN', 'PRESENT', 'HALF_DAY', 'ABSENT', 'PAID_LEAVE', 'UNPAID_LEAVE', 'WEEKLY_OFF', 'HOLIDAY', 'MISSING_PUNCH_OUT');
ALTER TABLE "Attendance" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Attendance" ALTER COLUMN "status" TYPE TEXT;
UPDATE "Attendance" SET "status" = 'NOT_PUNCHED_IN' WHERE "status" IN ('NOT_PUNCHED', 'PUNCHED_OUT', 'LATE') OR "status" IS NULL;
UPDATE "Attendance" SET "status" = 'PAID_LEAVE' WHERE "status" = 'LEAVE';
ALTER TABLE "Attendance" ALTER COLUMN "status" TYPE "AttendanceStatus_new" USING ("status"::"AttendanceStatus_new");
ALTER TYPE "AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "AttendanceStatus_old";
ALTER TABLE "Attendance" ALTER COLUMN "status" SET DEFAULT 'NOT_PUNCHED_IN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PayrollStatus_new" AS ENUM ('DRAFT', 'HR_VERIFIED', 'PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'ON_HOLD', 'RETURNED_TO_HR', 'REJECTED', 'PENDING_FINANCE', 'PROCESSING', 'PAID', 'CANCELLED');
ALTER TABLE "PayrollRecord" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PayrollRecord" ALTER COLUMN "status" TYPE "PayrollStatus_new" USING ("status"::text::"PayrollStatus_new");
ALTER TABLE "PayrollStatusHistory" ALTER COLUMN "fromStatus" TYPE "PayrollStatus_new" USING ("fromStatus"::text::"PayrollStatus_new");
ALTER TABLE "PayrollStatusHistory" ALTER COLUMN "toStatus" TYPE "PayrollStatus_new" USING ("toStatus"::text::"PayrollStatus_new");
ALTER TYPE "PayrollStatus" RENAME TO "PayrollStatus_old";
ALTER TYPE "PayrollStatus_new" RENAME TO "PayrollStatus";
DROP TYPE "PayrollStatus_old";
ALTER TABLE "PayrollRecord" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropIndex
DROP INDEX IF EXISTS "Attendance_userId_attendanceDate_key";

-- DropIndex
DROP INDEX IF EXISTS "PayrollPeriod_month_year_key";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "earlyExitMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "employeeId" TEXT,
ADD COLUMN IF NOT EXISTS "lateMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "workedMinutes" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'NOT_PUNCHED_IN';

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "expenseName" SET NOT NULL;

-- AlterTable
ALTER TABLE "FcmDeviceToken" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LeaveRequest" ALTER COLUMN "totalDays" SET DATA TYPE INTEGER,
ALTER COLUMN "fromDate" SET NOT NULL,
ALTER COLUMN "toDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "ManualAttendanceRequest" ALTER COLUMN "date" SET NOT NULL;

-- AlterTable
ALTER TABLE "PayrollPeriod" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "closedById" TEXT,
ADD COLUMN IF NOT EXISTS "companyId" TEXT NOT NULL DEFAULT 'COMP-001';

-- AlterTable
ALTER TABLE "PayrollRecord" ADD COLUMN IF NOT EXISTS "absentDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "accountNumberEncrypted" TEXT,
ADD COLUMN IF NOT EXISTS "accountNumberLast4" TEXT,
ADD COLUMN IF NOT EXISTS "bankNameSnapshot" TEXT,
ADD COLUMN IF NOT EXISTS "companyId" TEXT NOT NULL DEFAULT 'COMP-001',
ADD COLUMN IF NOT EXISTS "departmentSnapshot" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "elapsedWorkingDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "employeeCodeSnapshot" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "employeeNameSnapshot" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "employerEsic" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "employerPf" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "employerTotalCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "esicRuleVersion" TEXT NOT NULL DEFAULT 'ESIC_2026_V1',
ADD COLUMN IF NOT EXISTS "halfDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "holidayDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "hrVerifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "hrVerifiedById" TEXT,
ADD COLUMN IF NOT EXISTS "ifscCodeSnapshot" TEXT,
ADD COLUMN IF NOT EXISTS "jobTitleSnapshot" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "pfRuleVersion" TEXT NOT NULL DEFAULT 'EPFO_2026_V1',
ADD COLUMN IF NOT EXISTS "ptRuleVersion" TEXT NOT NULL DEFAULT 'GUJARAT_PT_2026',
ADD COLUMN IF NOT EXISTS "returnReason" TEXT,
ADD COLUMN IF NOT EXISTS "salaryCalculationBasis" TEXT NOT NULL DEFAULT 'WORKING_DAYS',
ADD COLUMN IF NOT EXISTS "salaryDivisorSnapshot" DECIMAL(6,2) NOT NULL DEFAULT 25,
ADD COLUMN IF NOT EXISTS "scheduledWorkingDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "tdsRuleVersion" TEXT NOT NULL DEFAULT 'INCOME_TAX_2026',
ADD COLUMN IF NOT EXISTS "unpaidDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "weeklyOffDays" DECIMAL(6,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductionDailyReport" DROP COLUMN IF EXISTS "lineInCharge",
DROP COLUMN IF EXISTS "manpowerCount",
DROP COLUMN IF EXISTS "remarks",
DROP COLUMN IF EXISTS "totalCoverQty",
DROP COLUMN IF EXISTS "totalFrameQty",
DROP COLUMN IF EXISTS "totalSetQty",
DROP COLUMN IF EXISTS "totalWeightKg",
ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "inventory_items" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "production_targets" ALTER COLUMN "quantity_target" SET NOT NULL,
ALTER COLUMN "target_period" SET NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserLocationHistory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceSessionId" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserLocationHistory_companyId_userId_capturedAt_idx" ON "UserLocationHistory"("companyId", "userId", "capturedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserLocationHistory_deviceSessionId_capturedAt_idx" ON "UserLocationHistory"("deviceSessionId", "capturedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Attendance_employeeId_idx" ON "Attendance"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_employeeId_attendanceDate_key" ON "Attendance"("employeeId", "attendanceDate");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PayrollPeriod_companyId_month_year_key" ON "PayrollPeriod"("companyId", "month", "year");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayrollRecord_companyId_status_idx" ON "PayrollRecord"("companyId", "status");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_companyId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_userId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Attendance_employeeId_fkey') THEN
    ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserLocationHistory_companyId_fkey') THEN
    ALTER TABLE "UserLocationHistory" ADD CONSTRAINT "UserLocationHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserLocationHistory_userId_fkey') THEN
    ALTER TABLE "UserLocationHistory" ADD CONSTRAINT "UserLocationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserLocationHistory_deviceSessionId_fkey') THEN
    ALTER TABLE "UserLocationHistory" ADD CONSTRAINT "UserLocationHistory_deviceSessionId_fkey" FOREIGN KEY ("deviceSessionId") REFERENCES "DeviceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
