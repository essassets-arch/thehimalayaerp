-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockHistoryEvent" ADD VALUE 'PRODUCTION_IN';
ALTER TYPE "StockHistoryEvent" ADD VALUE 'ADJUSTMENT_IN';
ALTER TYPE "StockHistoryEvent" ADD VALUE 'ADJUSTMENT_OUT';
ALTER TYPE "StockHistoryEvent" ADD VALUE 'RESERVATION';
ALTER TYPE "StockHistoryEvent" ADD VALUE 'RELEASE';

-- AlterTable
ALTER TABLE "CustomerPayment" ADD COLUMN     "method" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedById" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "transactionReference" TEXT;

-- AlterTable
ALTER TABLE "FinishedGoods" ADD COLUMN     "reservedQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductionDailyReport" ADD COLUMN     "stockPostedAt" TIMESTAMP(3),
ADD COLUMN     "stockPostedBy" TEXT,
ADD COLUMN     "stockTransactionId" TEXT;

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "outstandingAmount" DECIMAL(18,2),
ADD COLUMN     "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentDueDate" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "paymentTermDays" INTEGER,
ADD COLUMN     "paymentTermStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paymentTerms" TEXT;

-- AlterTable
ALTER TABLE "StockHistory" ADD COLUMN     "afterAvailableQuantity" DECIMAL(18,3),
ADD COLUMN     "afterQuantity" DECIMAL(18,3),
ADD COLUMN     "beforeAvailableQuantity" DECIMAL(18,3),
ADD COLUMN     "beforeQuantity" DECIMAL(18,3),
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "sourceItemId" TEXT,
ADD COLUMN     "sourceType" TEXT;

-- CreateTable
CREATE TABLE "DispatchDailyReport" (
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
CREATE TABLE "DispatchDailyReportItem" (
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
CREATE UNIQUE INDEX "DispatchDailyReport_reportNo_key" ON "DispatchDailyReport"("reportNo");

-- CreateIndex
CREATE INDEX "DispatchDailyReport_companyId_status_idx" ON "DispatchDailyReport"("companyId", "status");

-- CreateIndex
CREATE INDEX "DispatchDailyReport_reportDate_idx" ON "DispatchDailyReport"("reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchDailyReport_companyId_reportDate_shift_dispatchType_key" ON "DispatchDailyReport"("companyId", "reportDate", "shift", "dispatchType");

-- CreateIndex
CREATE INDEX "DispatchDailyReportItem_reportId_idx" ON "DispatchDailyReportItem"("reportId");

-- CreateIndex
CREATE INDEX "DispatchDailyReportItem_productId_idx" ON "DispatchDailyReportItem"("productId");

-- AddForeignKey
ALTER TABLE "DispatchDailyReport" ADD CONSTRAINT "DispatchDailyReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchDailyReport" ADD CONSTRAINT "DispatchDailyReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchDailyReportItem" ADD CONSTRAINT "DispatchDailyReportItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DispatchDailyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchDailyReportItem" ADD CONSTRAINT "DispatchDailyReportItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
