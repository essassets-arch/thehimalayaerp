-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "LocationSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'FORCE_CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable EmployeeLocationSession
CREATE TABLE IF NOT EXISTS "EmployeeLocationSession" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "deviceSessionId" TEXT,
    "punchInAt" TIMESTAMP(3) NOT NULL,
    "punchInLatitude" DECIMAL(10,7) NOT NULL,
    "punchInLongitude" DECIMAL(10,7) NOT NULL,
    "punchInAccuracy" DOUBLE PRECISION,
    "punchInAddress" TEXT,
    "punchOutAt" TIMESTAMP(3),
    "punchOutLatitude" DECIMAL(10,7),
    "punchOutLongitude" DECIMAL(10,7),
    "punchOutAccuracy" DOUBLE PRECISION,
    "punchOutAddress" TEXT,
    "status" "LocationSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalDistanceKm" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "totalPointsCount" INTEGER NOT NULL DEFAULT 0,
    "totalStopsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeLocationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable EmployeeLocationPoint
CREATE TABLE IF NOT EXISTS "EmployeeLocationPoint" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientPointId" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "batteryLevel" DOUBLE PRECISION,
    "isMockLocation" BOOLEAN NOT NULL DEFAULT false,
    "isFilteredJump" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'FLUTTER_BACKGROUND',
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "serverReceivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stopId" TEXT,

    CONSTRAINT "EmployeeLocationPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable EmployeeRouteStop
CREATE TABLE IF NOT EXISTS "EmployeeRouteStop" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "address" TEXT,
    "locationName" TEXT,
    "arrivedAt" TIMESTAMP(3) NOT NULL,
    "departedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmployeeRouteStop_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for attendanceId on EmployeeLocationSession
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeLocationSession_attendanceId_key" ON "EmployeeLocationSession"("attendanceId");

-- Partial unique index: Exactly 1 ACTIVE session per company+employee (Section D)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_active_employee_location_session" 
ON "EmployeeLocationSession"("companyId", "employeeId") 
WHERE "status" = 'ACTIVE';

-- Idempotency constraint: sessionId + clientPointId on EmployeeLocationPoint (Section C)
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeLocationPoint_sessionId_clientPointId_key" ON "EmployeeLocationPoint"("sessionId", "clientPointId");

-- Performance Indexes
CREATE INDEX IF NOT EXISTS "EmployeeLocationSession_companyId_employeeId_punchInAt_idx" ON "EmployeeLocationSession"("companyId", "employeeId", "punchInAt");
CREATE INDEX IF NOT EXISTS "EmployeeLocationSession_companyId_status_idx" ON "EmployeeLocationSession"("companyId", "status");
CREATE INDEX IF NOT EXISTS "EmployeeLocationSession_attendanceId_idx" ON "EmployeeLocationSession"("attendanceId");

CREATE INDEX IF NOT EXISTS "EmployeeLocationPoint_sessionId_recordedAt_idx" ON "EmployeeLocationPoint"("sessionId", "recordedAt");
CREATE INDEX IF NOT EXISTS "EmployeeLocationPoint_employeeId_recordedAt_idx" ON "EmployeeLocationPoint"("employeeId", "recordedAt");
CREATE INDEX IF NOT EXISTS "EmployeeLocationPoint_companyId_recordedAt_idx" ON "EmployeeLocationPoint"("companyId", "recordedAt");

CREATE INDEX IF NOT EXISTS "EmployeeRouteStop_sessionId_arrivedAt_idx" ON "EmployeeRouteStop"("sessionId", "arrivedAt");
CREATE INDEX IF NOT EXISTS "EmployeeRouteStop_employeeId_arrivedAt_idx" ON "EmployeeRouteStop"("employeeId", "arrivedAt");

-- Retention-Safe Foreign Keys (No cascade from Company/Employee/User)
DO $$ BEGIN
    ALTER TABLE "EmployeeLocationSession" ADD CONSTRAINT "EmployeeLocationSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeLocationSession" ADD CONSTRAINT "EmployeeLocationSession_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeLocationSession" ADD CONSTRAINT "EmployeeLocationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeLocationSession" ADD CONSTRAINT "EmployeeLocationSession_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Internal Session Cascade Foreign Keys
DO $$ BEGIN
    ALTER TABLE "EmployeeLocationPoint" ADD CONSTRAINT "EmployeeLocationPoint_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "EmployeeLocationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeLocationPoint" ADD CONSTRAINT "EmployeeLocationPoint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeLocationPoint" ADD CONSTRAINT "EmployeeLocationPoint_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeLocationPoint" ADD CONSTRAINT "EmployeeLocationPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeLocationPoint" ADD CONSTRAINT "EmployeeLocationPoint_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "EmployeeRouteStop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeRouteStop" ADD CONSTRAINT "EmployeeRouteStop_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "EmployeeLocationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeRouteStop" ADD CONSTRAINT "EmployeeRouteStop_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "EmployeeRouteStop" ADD CONSTRAINT "EmployeeRouteStop_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
