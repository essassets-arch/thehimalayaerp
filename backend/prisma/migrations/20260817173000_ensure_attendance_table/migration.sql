-- Corrective migration for databases that recorded the legacy schema-sync
-- migration before its Attendance DDL was applied.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AttendanceStatus') THEN
    CREATE TYPE "AttendanceStatus" AS ENUM ('NOT_PUNCHED', 'PRESENT', 'PUNCHED_IN', 'PUNCHED_OUT', 'LATE', 'HALF_DAY', 'ABSENT', 'LEAVE');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Attendance" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "attendanceDate" TIMESTAMP(3) NOT NULL,
  "punchInAt" TIMESTAMP(3),
  "punchOutAt" TIMESTAMP(3),
  "punchInLatitude" DECIMAL(65,30),
  "punchInLongitude" DECIMAL(65,30),
  "punchInAddress" TEXT,
  "punchInAccuracy" DOUBLE PRECISION,
  "punchOutLatitude" DECIMAL(65,30),
  "punchOutLongitude" DECIMAL(65,30),
  "punchOutAddress" TEXT,
  "punchOutAccuracy" DOUBLE PRECISION,
  "punchInSelfieUrl" TEXT,
  "punchOutSelfieUrl" TEXT,
  "workedSeconds" INTEGER NOT NULL DEFAULT 0,
  "status" "AttendanceStatus" NOT NULL DEFAULT 'NOT_PUNCHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Attendance_companyId_idx" ON "Attendance"("companyId");
CREATE INDEX IF NOT EXISTS "Attendance_userId_idx" ON "Attendance"("userId");
CREATE INDEX IF NOT EXISTS "Attendance_attendanceDate_idx" ON "Attendance"("attendanceDate");
CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_userId_attendanceDate_key" ON "Attendance"("userId", "attendanceDate");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Attendance_userId_fkey') THEN
    ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
