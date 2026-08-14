-- Idempotent Migration: Fix ProductionDailyReport & ProductionDailyReportItem Columns

CREATE TABLE IF NOT EXISTS "ProductionDailyReport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reportNo" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "shift" TEXT,
    "supervisorName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalCovers" INTEGER NOT NULL DEFAULT 0,
    "totalFrames" INTEGER NOT NULL DEFAULT 0,
    "totalSets" INTEGER NOT NULL DEFAULT 0,
    "totalCoverWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "totalFrameWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "totalWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "updatedById" TEXT,
    "submittedById" TEXT,
    "approvedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionDailyReport_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "reportNo" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "shift" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "supervisorName" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'DRAFT';
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalCovers" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalFrames" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalSets" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalCoverWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalFrameWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "updatedById" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "submittedById" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "approvedById" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

ALTER TABLE "ProductionDailyReport" ALTER COLUMN "shift" DROP NOT NULL;
ALTER TABLE "ProductionDailyReport" ALTER COLUMN "supervisorName" DROP NOT NULL;
ALTER TABLE "ProductionDailyReport" ALTER COLUMN "createdById" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "ProductionDailyReportItem" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "productId" TEXT,
    "customProductName" TEXT,
    "srNo" INTEGER NOT NULL DEFAULT 1,
    "size" TEXT,
    "type" TEXT,
    "capacity" TEXT,
    "coverQty" INTEGER NOT NULL DEFAULT 0,
    "coverUnitWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "coverWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "actualCoverWeight" DECIMAL(14,3),
    "frameQty" INTEGER NOT NULL DEFAULT 0,
    "frameUnitWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "frameWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "actualFrameWeight" DECIMAL(14,3),
    "weightOverrideReason" TEXT,
    "setQty" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "workOrderId" TEXT,
    "productionPlanId" TEXT,
    "salesOrderId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionDailyReportItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "reportId" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "customProductName" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "srNo" INTEGER DEFAULT 1;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "size" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "capacity" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "coverQty" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "coverUnitWeight" DECIMAL(10,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "coverWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "actualCoverWeight" DECIMAL(14,3);
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "frameQty" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "frameUnitWeight" DECIMAL(10,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "frameWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "actualFrameWeight" DECIMAL(14,3);
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "weightOverrideReason" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "setQty" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "totalWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "workOrderId" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "productionPlanId" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "salesOrderId" TEXT;
ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "remarks" TEXT;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProductionDailyReport_companyId_reportDate_shift_key') THEN
        CREATE UNIQUE INDEX "ProductionDailyReport_companyId_reportDate_shift_key" ON "ProductionDailyReport"("companyId", "reportDate", "shift");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProductionDailyReport_reportNo_key') THEN
        CREATE UNIQUE INDEX "ProductionDailyReport_reportNo_key" ON "ProductionDailyReport"("reportNo");
    END IF;
END $$;
