-- AlterTable PurchaseOrder: ensure purchaseIndentId and all snapshot/lifecycle columns exist
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "purchaseIndentId" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "draftPoNo" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "poNo" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "poNumber" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "expectedDeliveryDate" TIMESTAMP(3);
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "issuedAt" TIMESTAMP(3);
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "issuedById" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "snapshot" JSONB;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "workflowStateId" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(14,2) DEFAULT 0;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "gstAmount" DECIMAL(14,2) DEFAULT 0;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "freight" DECIMAL(14,2) DEFAULT 0;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "otherCharges" DECIMAL(14,2) DEFAULT 0;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "superAdminApprovedById" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "superAdminApprovedAt" TIMESTAMP(3);
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "superAdminRejectedById" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "superAdminRejectedAt" TIMESTAMP(3);
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "superAdminRejectionReason" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "orderedById" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "orderedAt" TIMESTAMP(3);
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "vendorOrderReference" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "orderRemarks" TEXT;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3);

-- AlterTable PurchaseOrderItem: ensure purchaseIndentId and item snapshot columns exist
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "purchaseIndentId" TEXT;
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "indentItemId" TEXT;
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "materialCodeSnapshot" TEXT;
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "materialNameSnapshot" TEXT;
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "uomSnapshot" TEXT;
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "lineSubtotal" DECIMAL(14,2);
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "gstAmount" DECIMAL(14,2) DEFAULT 0;
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "lineTotal" DECIMAL(14,2);
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "discountPercent" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "gstPercent" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "receivedQuantity" DECIMAL(14,2) DEFAULT 0;
ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "acceptedQuantity" DECIMAL(14,2) DEFAULT 0;

-- Create non-unique indexes for fast lookup
CREATE INDEX IF NOT EXISTS "PurchaseOrder_purchaseIndentId_idx" ON "PurchaseOrder"("purchaseIndentId");
CREATE INDEX IF NOT EXISTS "PurchaseOrderItem_purchaseIndentId_idx" ON "PurchaseOrderItem"("purchaseIndentId");

-- Safe foreign key addition if not already existing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PurchaseOrder_purchaseIndentId_fkey'
  ) THEN
    BEGIN
      ALTER TABLE "PurchaseOrder" 
      ADD CONSTRAINT "PurchaseOrder_purchaseIndentId_fkey" 
      FOREIGN KEY ("purchaseIndentId") REFERENCES "PurchaseIndent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;
