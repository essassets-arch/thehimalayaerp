-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

-- ALTER TYPE "StockHistoryEvent" ADD VALUE 'PRODUCTION_IN';
-- ALTER TYPE "StockHistoryEvent" ADD VALUE 'ADJUSTMENT_IN';
-- ALTER TYPE "StockHistoryEvent" ADD VALUE 'ADJUSTMENT_OUT';
-- ALTER TYPE "StockHistoryEvent" ADD VALUE 'RESERVATION';
-- ALTER TYPE "StockHistoryEvent" ADD VALUE 'RELEASE';

-- Ensure StockHistoryEvent enum type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StockHistoryEvent') THEN
    CREATE TYPE "StockHistoryEvent" AS ENUM ('STOCK_IN', 'RESERVE', 'UNRESERVE', 'DISPATCH_OUT', 'QC_RECEIPT', 'ADJUSTMENT', 'RETURN_IN');
  END IF;
END
$$;

-- Ensure StockHistory table exists
CREATE TABLE IF NOT EXISTS "StockHistory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "salesOrderId" TEXT,
    "salesOrderItemId" TEXT,
    "allocationId" TEXT,
    "dispatchId" TEXT,
    "event" "StockHistoryEvent" NOT NULL,
    "actor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("id")
);

-- Ensure StockHistory indices exist
CREATE INDEX IF NOT EXISTS "StockHistory_companyId_productId_createdAt_idx" ON "StockHistory"("companyId", "productId", "createdAt");
CREATE INDEX IF NOT EXISTS "StockHistory_salesOrderId_idx" ON "StockHistory"("salesOrderId");
CREATE INDEX IF NOT EXISTS "StockHistory_allocationId_idx" ON "StockHistory"("allocationId");
CREATE INDEX IF NOT EXISTS "StockHistory_dispatchId_idx" ON "StockHistory"("dispatchId");

-- AlterTable
ALTER TABLE "CustomerPayment" ADD COLUMN IF NOT EXISTS "method" TEXT;
ALTER TABLE "CustomerPayment" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3);
ALTER TABLE "CustomerPayment" ADD COLUMN IF NOT EXISTS "rejectedById" TEXT;
ALTER TABLE "CustomerPayment" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "CustomerPayment" ADD COLUMN IF NOT EXISTS "remarks" TEXT;
ALTER TABLE "CustomerPayment" ADD COLUMN IF NOT EXISTS "transactionReference" TEXT;

-- AlterTable
ALTER TABLE "FinishedGoods" ADD COLUMN IF NOT EXISTS "reservedQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "stockPostedAt" TIMESTAMP(3);
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "stockPostedBy" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "stockTransactionId" TEXT;

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "outstandingAmount" DECIMAL(18,2);
ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0;
ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentDueDate" TIMESTAMP(3);
ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTermDays" INTEGER;
ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTermStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT;

-- AlterTable
ALTER TABLE "StockHistory" ADD COLUMN IF NOT EXISTS "afterAvailableQuantity" DECIMAL(18,3);
ALTER TABLE "StockHistory" ADD COLUMN IF NOT EXISTS "afterQuantity" DECIMAL(18,3);
ALTER TABLE "StockHistory" ADD COLUMN IF NOT EXISTS "beforeAvailableQuantity" DECIMAL(18,3);
ALTER TABLE "StockHistory" ADD COLUMN IF NOT EXISTS "beforeQuantity" DECIMAL(18,3);
ALTER TABLE "StockHistory" ADD COLUMN IF NOT EXISTS "referenceNumber" TEXT;
ALTER TABLE "StockHistory" ADD COLUMN IF NOT EXISTS "remarks" TEXT;
ALTER TABLE "StockHistory" ADD COLUMN IF NOT EXISTS "sourceId" TEXT;
ALTER TABLE "StockHistory" ADD COLUMN IF NOT EXISTS "sourceItemId" TEXT;
ALTER TABLE "StockHistory" ADD COLUMN IF NOT EXISTS "sourceType" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "DispatchDailyReport" (
    "id" TEXT NOT NULL,
    "reportNo" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "shift" TEXT,
    "dispatchExecutive" TEXT,
    "dispatchType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalCovers" INTEGER NOT NULL DEFAULT 0,
    "totalFrames" INTEGER NOT NULL DEFAULT 0,
    "totalSets" INTEGER NOT NULL DEFAULT 0,
    "totalCoverWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "totalFrameWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "totalWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "submittedById" TEXT,
    "approvedById" TEXT,
    "cancelledById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "stockPostedAt" TIMESTAMP(3),
    "stockPostedBy" TEXT,
    "stockTransactionId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DispatchDailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DispatchDailyReportItem" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "productId" TEXT,
    "customProductName" TEXT,
    "srNo" INTEGER NOT NULL,
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
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DispatchDailyReportItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DispatchDailyReport_reportNo_key" ON "DispatchDailyReport"("reportNo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DispatchDailyReport_companyId_status_idx" ON "DispatchDailyReport"("companyId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DispatchDailyReport_reportDate_idx" ON "DispatchDailyReport"("reportDate");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DispatchDailyReport_companyId_reportDate_shift_dispatchType_key" ON "DispatchDailyReport"("companyId", "reportDate", "shift", "dispatchType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DispatchDailyReportItem_reportId_idx" ON "DispatchDailyReportItem"("reportId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DispatchDailyReportItem_productId_idx" ON "DispatchDailyReportItem"("productId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'DispatchDailyReport_companyId_fkey') THEN
    ALTER TABLE "DispatchDailyReport" ADD CONSTRAINT "DispatchDailyReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'DispatchDailyReport_createdById_fkey') THEN
    ALTER TABLE "DispatchDailyReport" ADD CONSTRAINT "DispatchDailyReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'DispatchDailyReportItem_reportId_fkey') THEN
    ALTER TABLE "DispatchDailyReportItem" ADD CONSTRAINT "DispatchDailyReportItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DispatchDailyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'DispatchDailyReportItem_productId_fkey') THEN
    ALTER TABLE "DispatchDailyReportItem" ADD CONSTRAINT "DispatchDailyReportItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;
