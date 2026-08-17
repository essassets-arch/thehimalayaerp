-- DropIndex
DROP INDEX IF EXISTS "FcmDeviceToken_companyId_idx";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN IF EXISTS "category",
DROP COLUMN IF EXISTS "description",
ADD COLUMN IF NOT EXISTS "expenseName" TEXT,
ADD COLUMN IF NOT EXISTS "hrApprovedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "hrApprovedBy" TEXT,
ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT,
ADD COLUMN IF NOT EXISTS "superApprovedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "superApprovedBy" TEXT;

-- AlterTable
ALTER TABLE "FcmDeviceToken" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "GoodsReceiptNote" ADD COLUMN IF NOT EXISTS "financeAuditedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "financeAuditedById" TEXT;

-- AlterTable
ALTER TABLE "GoodsReceiptNoteItem" ADD COLUMN IF NOT EXISTS "financeApprovedQuantity" DECIMAL(14,2),
ADD COLUMN IF NOT EXISTS "purchaseOrderItemId" TEXT;

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "nextReminderAt";

-- AlterTable
ALTER TABLE "LeaveApproval" DROP COLUMN IF EXISTS "actionAt",
ADD COLUMN IF NOT EXISTS "actionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "LeaveRequest" DROP COLUMN IF EXISTS "endDate",
DROP COLUMN IF EXISTS "startDate",
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
ADD COLUMN IF NOT EXISTS "attachment" TEXT,
ADD COLUMN IF NOT EXISTS "currentApprover" TEXT,
ADD COLUMN IF NOT EXISTS "fromDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "remarks" TEXT,
ADD COLUMN IF NOT EXISTS "toDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ManualAttendanceRequest" DROP COLUMN IF EXISTS "attendanceDate",
DROP COLUMN IF EXISTS "requestedInTime",
DROP COLUMN IF EXISTS "requestedOutTime",
ADD COLUMN IF NOT EXISTS "date" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "remarks" TEXT;

-- AlterTable
ALTER TABLE "PurchaseIndent" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "indentNo" TEXT,
ADD COLUMN IF NOT EXISTS "plantHeadApprovedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "plantHeadApprovedById" TEXT,
ADD COLUMN IF NOT EXISTS "plantHeadRejectedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "plantHeadRejectedById" TEXT,
ADD COLUMN IF NOT EXISTS "plantHeadRejectionReason" TEXT;

-- AlterTable
ALTER TABLE "PurchaseIndentItem" ADD COLUMN IF NOT EXISTS "currentStockSnapshot" DECIMAL(14,2),
ADD COLUMN IF NOT EXISTS "materialCode" TEXT,
ADD COLUMN IF NOT EXISTS "materialName" TEXT,
ADD COLUMN IF NOT EXISTS "minimumStockSnapshot" DECIMAL(14,2),
ADD COLUMN IF NOT EXISTS "uom" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "draftPoNo" TEXT,
ADD COLUMN IF NOT EXISTS "gstAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "orderRemarks" TEXT,
ADD COLUMN IF NOT EXISTS "orderedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "orderedById" TEXT,
ADD COLUMN IF NOT EXISTS "poNo" TEXT,
ADD COLUMN IF NOT EXISTS "superAdminApprovedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "superAdminApprovedById" TEXT,
ADD COLUMN IF NOT EXISTS "superAdminRejectedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "superAdminRejectedById" TEXT,
ADD COLUMN IF NOT EXISTS "superAdminRejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "vendorOrderReference" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "gstAmount" DECIMAL(14,2),
ADD COLUMN IF NOT EXISTS "indentItemId" TEXT,
ADD COLUMN IF NOT EXISTS "lineSubtotal" DECIMAL(14,2),
ADD COLUMN IF NOT EXISTS "lineTotal" DECIMAL(14,2),
ADD COLUMN IF NOT EXISTS "materialCodeSnapshot" TEXT,
ADD COLUMN IF NOT EXISTS "materialNameSnapshot" TEXT,
ADD COLUMN IF NOT EXISTS "uomSnapshot" TEXT;

-- AlterTable
ALTER TABLE "RawMaterial" ALTER COLUMN "category" SET DEFAULT 'Raw Material';

-- AlterTable
ALTER TABLE "inventory_items" DROP COLUMN IF EXISTS "createdAt",
DROP COLUMN IF EXISTS "max_stock",
DROP COLUMN IF EXISTS "reorder_level",
DROP COLUMN IF EXISTS "status",
DROP COLUMN IF EXISTS "updatedAt",
DROP COLUMN IF EXISTS "valuation",
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "production_targets" DROP COLUMN IF EXISTS "target_volume",
DROP COLUMN IF EXISTS "unit",
ADD COLUMN IF NOT EXISTS "created_by_id" TEXT,
ADD COLUMN IF NOT EXISTS "plant_id" TEXT,
ADD COLUMN IF NOT EXISTS "quantity_target" INTEGER,
ADD COLUMN IF NOT EXISTS "updated_by_id" TEXT,
DROP COLUMN IF EXISTS "target_period",
ADD COLUMN IF NOT EXISTS "target_period" "TargetPeriod",
ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "end_date" SET DATA TYPE DATE,
ALTER COLUMN "remarks" SET DATA TYPE VARCHAR(500);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FcmDeviceToken_companyId_userId_idx" ON "FcmDeviceToken"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseIndent_indentNo_key" ON "PurchaseIndent"("indentNo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseOrder_draftPoNo_key" ON "PurchaseOrder"("draftPoNo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseOrder_poNo_key" ON "PurchaseOrder"("poNo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "production_targets_status_target_period_idx" ON "production_targets"("status", "target_period");
