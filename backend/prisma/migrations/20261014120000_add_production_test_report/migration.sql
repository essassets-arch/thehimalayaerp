-- Production Test Report additive migration
CREATE TABLE IF NOT EXISTS "ProductionTestReport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL DEFAULT 'COMP-001',
    "reportNumber" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "parentReportId" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientName" TEXT NOT NULL,
    "poNumber" TEXT,
    "productName" TEXT NOT NULL,
    "productId" TEXT,
    "clearOpening" TEXT,
    "quantitySupply" TEXT,
    "projectName" TEXT,
    "specifications" JSONB NOT NULL DEFAULT '[]',
    "loadTestingRows" JSONB NOT NULL DEFAULT '[]',
    "cycleLoadsTon" TEXT,
    "finalLoadTon" TEXT,
    "cycleStatement" TEXT,
    "resultStatement" TEXT,
    "testedByName" TEXT NOT NULL DEFAULT 'Sana Konda Reddy',
    "testedByTitle" TEXT NOT NULL DEFAULT 'Plant Head',
    "testedByStamp" BOOLEAN NOT NULL DEFAULT true,
    "testedBySignature" BOOLEAN NOT NULL DEFAULT true,
    "approvedByName" TEXT,
    "approvedByTitle" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedBySignature" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "rejectionReason" TEXT,
    "remarks" TEXT,
    "testingRecordId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionTestReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductionTestReport_companyId_reportNumber_revision_key" 
ON "ProductionTestReport"("companyId", "reportNumber", "revision");

CREATE INDEX IF NOT EXISTS "ProductionTestReport_companyId_status_idx" 
ON "ProductionTestReport"("companyId", "status");

CREATE INDEX IF NOT EXISTS "ProductionTestReport_companyId_createdAt_idx" 
ON "ProductionTestReport"("companyId", "createdAt");

CREATE INDEX IF NOT EXISTS "ProductionTestReport_parentReportId_idx" 
ON "ProductionTestReport"("parentReportId");
