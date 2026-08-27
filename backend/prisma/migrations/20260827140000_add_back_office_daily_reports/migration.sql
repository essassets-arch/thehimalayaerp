-- CreateTable
CREATE TABLE IF NOT EXISTS "BackOfficeDailyReport" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "tasksCompleted" TEXT NOT NULL,
    "issuesOrBlockers" TEXT,
    "planForTomorrow" TEXT,
    "workingHours" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "adminRemarks" TEXT,
    "acknowledgedById" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BackOfficeDailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BackOfficeDailyReport_publicId_key" ON "BackOfficeDailyReport"("publicId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackOfficeDailyReport_companyId_reportDate_idx" ON "BackOfficeDailyReport"("companyId", "reportDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackOfficeDailyReport_userId_reportDate_idx" ON "BackOfficeDailyReport"("userId", "reportDate");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BackOfficeDailyReport_companyId_fkey'
    ) THEN
        ALTER TABLE "BackOfficeDailyReport" ADD CONSTRAINT "BackOfficeDailyReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BackOfficeDailyReport_userId_fkey'
    ) THEN
        ALTER TABLE "BackOfficeDailyReport" ADD CONSTRAINT "BackOfficeDailyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
