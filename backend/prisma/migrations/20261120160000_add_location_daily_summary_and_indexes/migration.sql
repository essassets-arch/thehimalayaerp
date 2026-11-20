-- Additive migration for 7-day sales location history performance indexes and daily rollups.
-- 100% idempotent & non-destructive.

CREATE TABLE IF NOT EXISTS "EmployeeDailyLocationSummary" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT,
    "dateIst" TEXT NOT NULL,
    "punchInAt" TIMESTAMP(3),
    "punchOutAt" TIMESTAMP(3),
    "punchInAddress" TEXT,
    "punchOutAddress" TEXT,
    "firstPingAt" TIMESTAMP(3),
    "lastPingAt" TIMESTAMP(3),
    "totalDistanceKm" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "totalPointsCount" INTEGER NOT NULL DEFAULT 0,
    "totalStopsCount" INTEGER NOT NULL DEFAULT 0,
    "activeMinutes" INTEGER NOT NULL DEFAULT 0,
    "leadsCapturedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeDailyLocationSummary_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeDailyLocationSummary_companyId_userId_dateIst_key"
    ON "EmployeeDailyLocationSummary"("companyId", "userId", "dateIst");

CREATE INDEX IF NOT EXISTS "EmployeeDailyLocationSummary_userId_dateIst_idx"
    ON "EmployeeDailyLocationSummary"("userId", "dateIst");

CREATE INDEX IF NOT EXISTS "EmployeeDailyLocationSummary_companyId_dateIst_idx"
    ON "EmployeeDailyLocationSummary"("companyId", "dateIst");

CREATE INDEX IF NOT EXISTS "UserLocationHistory_userId_capturedAt_idx"
    ON "UserLocationHistory"("userId", "capturedAt");

CREATE INDEX IF NOT EXISTS "EmployeeLocationPoint_companyId_userId_recordedAt_idx"
    ON "EmployeeLocationPoint"("companyId", "userId", "recordedAt");

CREATE INDEX IF NOT EXISTS "EmployeeLocationPoint_userId_recordedAt_idx"
    ON "EmployeeLocationPoint"("userId", "recordedAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EmployeeDailyLocationSummary_companyId_fkey'
    ) THEN
        ALTER TABLE "EmployeeDailyLocationSummary"
            ADD CONSTRAINT "EmployeeDailyLocationSummary_companyId_fkey"
            FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EmployeeDailyLocationSummary_userId_fkey'
    ) THEN
        ALTER TABLE "EmployeeDailyLocationSummary"
            ADD CONSTRAINT "EmployeeDailyLocationSummary_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
