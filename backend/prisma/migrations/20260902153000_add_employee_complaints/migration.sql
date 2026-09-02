-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "EmployeeComplaintPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "EmployeeComplaintStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "EmployeeComplaint" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT,
    "ticketCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "EmployeeComplaintPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "EmployeeComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "hrRemarks" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeComplaint_publicId_key" ON "EmployeeComplaint"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeComplaint_ticketCode_key" ON "EmployeeComplaint"("ticketCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeComplaint_companyId_status_idx" ON "EmployeeComplaint"("companyId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeComplaint_userId_idx" ON "EmployeeComplaint"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeComplaint_employeeId_idx" ON "EmployeeComplaint"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeComplaint_createdAt_idx" ON "EmployeeComplaint"("createdAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EmployeeComplaint_companyId_fkey') THEN
        ALTER TABLE "EmployeeComplaint" ADD CONSTRAINT "EmployeeComplaint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EmployeeComplaint_userId_fkey') THEN
        ALTER TABLE "EmployeeComplaint" ADD CONSTRAINT "EmployeeComplaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EmployeeComplaint_employeeId_fkey') THEN
        ALTER TABLE "EmployeeComplaint" ADD CONSTRAINT "EmployeeComplaint_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EmployeeComplaint_resolvedById_fkey') THEN
        ALTER TABLE "EmployeeComplaint" ADD CONSTRAINT "EmployeeComplaint_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
