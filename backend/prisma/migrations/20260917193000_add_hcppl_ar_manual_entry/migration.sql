-- CreateTable
CREATE TABLE IF NOT EXISTS "HcpplArManualEntry" (
    "id" TEXT NOT NULL,
    "srNo" INTEGER,
    "invoiceNo" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "basicAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "invoiceGstAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "partyName" TEXT NOT NULL,
    "siteName" TEXT,
    "salesType" TEXT,
    "salesPerson" TEXT,
    "paymentTerm" TEXT,
    "ageingDays" INTEGER,
    "managementStatus" TEXT NOT NULL DEFAULT 'NMGMT',
    "ageingBucket" TEXT NOT NULL DEFAULT '30 DAYS',
    "dueStatus" TEXT NOT NULL DEFAULT 'DUE',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "HcpplArManualEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HcpplArManualEntry_isArchived_idx" ON "HcpplArManualEntry"("isArchived");
CREATE INDEX IF NOT EXISTS "HcpplArManualEntry_invoiceDate_idx" ON "HcpplArManualEntry"("invoiceDate");
CREATE INDEX IF NOT EXISTS "HcpplArManualEntry_partyName_idx" ON "HcpplArManualEntry"("partyName");
CREATE INDEX IF NOT EXISTS "HcpplArManualEntry_salesPerson_idx" ON "HcpplArManualEntry"("salesPerson");
CREATE INDEX IF NOT EXISTS "HcpplArManualEntry_managementStatus_idx" ON "HcpplArManualEntry"("managementStatus");
CREATE INDEX IF NOT EXISTS "HcpplArManualEntry_paymentStatus_idx" ON "HcpplArManualEntry"("paymentStatus");
CREATE INDEX IF NOT EXISTS "HcpplArManualEntry_dueStatus_idx" ON "HcpplArManualEntry"("dueStatus");
CREATE INDEX IF NOT EXISTS "HcpplArManualEntry_ageingBucket_idx" ON "HcpplArManualEntry"("ageingBucket");
