-- Phase 1: authoritative material reorder configuration and procurement exceptions.
CREATE TYPE "ProcurementDeliveryStatus" AS ENUM ('PENDING_VERIFICATION','VERIFIED','PARTIALLY_RECEIVED','COMPLETED','CANCELLED');
CREATE TYPE "MaterialRejectionStatus" AS ENUM ('PENDING_FINANCE','APPROVED','REJECTED','RESOLUTION_PENDING','CLOSED');
CREATE TYPE "ProcurementReplacementStatus" AS ENUM ('PENDING_FINANCE','APPROVED','REJECTED','IN_TRANSIT','COMPLETED','CLOSED');

ALTER TABLE "Product"
  ADD COLUMN "minimumStock" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN "reorderQuantity" DECIMAL(14,2),
  ADD COLUMN "reorderUnit" TEXT,
  ADD COLUMN "leadTimeDays" INTEGER,
  ADD COLUMN "preferredVendorId" TEXT,
  ADD COLUMN "isAutoReorderEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "ProcurementDelivery" (
  "id" TEXT NOT NULL, "deliveryNumber" TEXT NOT NULL, "companyId" TEXT NOT NULL,
  "purchaseOrderId" TEXT NOT NULL, "supplierId" TEXT NOT NULL, "warehouseId" TEXT NOT NULL,
  "grnId" TEXT, "status" "ProcurementDeliveryStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "expectedDeliveryDate" TIMESTAMP(3), "actualDeliveryDate" TIMESTAMP(3), "verifiedAt" TIMESTAMP(3),
  "verifiedById" TEXT, "invoiceNumber" TEXT, "deliveryChallanNo" TEXT, "remarks" TEXT,
  "deletedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProcurementDelivery_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProcurementDeliveryItem" (
  "id" TEXT NOT NULL, "deliveryId" TEXT NOT NULL, "purchaseOrderItemId" TEXT NOT NULL,
  "productId" TEXT NOT NULL, "deliveredQuantity" DECIMAL(14,2) NOT NULL,
  "acceptedQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0, "rejectedQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "remainingQuantity" DECIMAL(14,2) NOT NULL, "remarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProcurementDeliveryItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MaterialRejection" (
  "id" TEXT NOT NULL, "rejectionNumber" TEXT NOT NULL, "companyId" TEXT NOT NULL,
  "purchaseOrderId" TEXT NOT NULL, "supplierId" TEXT NOT NULL, "deliveryId" TEXT,
  "invoiceNumber" TEXT, "status" "MaterialRejectionStatus" NOT NULL DEFAULT 'PENDING_FINANCE',
  "financeRemarks" TEXT, "expectedResolutionDate" TIMESTAMP(3), "resolvedAt" TIMESTAMP(3),
  "createdById" TEXT, "decidedById" TEXT, "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MaterialRejection_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MaterialRejectionItem" (
  "id" TEXT NOT NULL, "materialRejectionId" TEXT NOT NULL, "purchaseOrderItemId" TEXT NOT NULL,
  "productId" TEXT NOT NULL, "quantity" DECIMAL(14,2) NOT NULL, "reason" TEXT NOT NULL,
  "remarks" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MaterialRejectionItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProcurementReplacementRequest" (
  "id" TEXT NOT NULL, "requestNumber" TEXT NOT NULL, "companyId" TEXT NOT NULL,
  "purchaseOrderId" TEXT NOT NULL, "supplierId" TEXT NOT NULL, "deliveryId" TEXT,
  "materialRejectionId" TEXT, "invoiceNumber" TEXT,
  "status" "ProcurementReplacementStatus" NOT NULL DEFAULT 'PENDING_FINANCE',
  "expectedDeliveryDate" TIMESTAMP(3), "financeRemarks" TEXT, "completedAt" TIMESTAMP(3),
  "createdById" TEXT, "decidedById" TEXT, "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProcurementReplacementRequest_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProcurementReplacementItem" (
  "id" TEXT NOT NULL, "replacementRequestId" TEXT NOT NULL, "purchaseOrderItemId" TEXT NOT NULL,
  "productId" TEXT NOT NULL, "quantity" DECIMAL(14,2) NOT NULL, "reason" TEXT NOT NULL,
  "remarks" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProcurementReplacementItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProcurementDelivery_deliveryNumber_key" ON "ProcurementDelivery"("deliveryNumber");
CREATE UNIQUE INDEX "ProcurementDelivery_grnId_key" ON "ProcurementDelivery"("grnId");
CREATE INDEX "ProcurementDelivery_companyId_status_idx" ON "ProcurementDelivery"("companyId","status");
CREATE INDEX "ProcurementDelivery_purchaseOrderId_actualDeliveryDate_idx" ON "ProcurementDelivery"("purchaseOrderId","actualDeliveryDate");
CREATE UNIQUE INDEX "ProcurementDeliveryItem_deliveryId_purchaseOrderItemId_key" ON "ProcurementDeliveryItem"("deliveryId","purchaseOrderItemId");
CREATE UNIQUE INDEX "MaterialRejection_rejectionNumber_key" ON "MaterialRejection"("rejectionNumber");
CREATE INDEX "MaterialRejection_companyId_status_idx" ON "MaterialRejection"("companyId","status");
CREATE UNIQUE INDEX "ProcurementReplacementRequest_requestNumber_key" ON "ProcurementReplacementRequest"("requestNumber");
CREATE INDEX "ProcurementReplacementRequest_companyId_status_idx" ON "ProcurementReplacementRequest"("companyId","status");
CREATE INDEX "Product_companyId_minimumStock_idx" ON "Product"("companyId","minimumStock");
CREATE INDEX "Product_preferredVendorId_idx" ON "Product"("preferredVendorId");

ALTER TABLE "Product" ADD CONSTRAINT "Product_preferredVendorId_fkey" FOREIGN KEY ("preferredVendorId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "GoodsReceiptNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProcurementDeliveryItem" ADD CONSTRAINT "ProcurementDeliveryItem_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ProcurementDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProcurementDeliveryItem" ADD CONSTRAINT "ProcurementDeliveryItem_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementDeliveryItem" ADD CONSTRAINT "ProcurementDeliveryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON UPDATE CASCADE;
ALTER TABLE "MaterialRejection" ADD CONSTRAINT "MaterialRejection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON UPDATE CASCADE;
ALTER TABLE "MaterialRejection" ADD CONSTRAINT "MaterialRejection_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON UPDATE CASCADE;
ALTER TABLE "MaterialRejection" ADD CONSTRAINT "MaterialRejection_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON UPDATE CASCADE;
ALTER TABLE "MaterialRejection" ADD CONSTRAINT "MaterialRejection_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ProcurementDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MaterialRejectionItem" ADD CONSTRAINT "MaterialRejectionItem_materialRejectionId_fkey" FOREIGN KEY ("materialRejectionId") REFERENCES "MaterialRejection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaterialRejectionItem" ADD CONSTRAINT "MaterialRejectionItem_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem"("id") ON UPDATE CASCADE;
ALTER TABLE "MaterialRejectionItem" ADD CONSTRAINT "MaterialRejectionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ProcurementDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_materialRejectionId_fkey" FOREIGN KEY ("materialRejectionId") REFERENCES "MaterialRejection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProcurementReplacementItem" ADD CONSTRAINT "ProcurementReplacementItem_replacementRequestId_fkey" FOREIGN KEY ("replacementRequestId") REFERENCES "ProcurementReplacementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProcurementReplacementItem" ADD CONSTRAINT "ProcurementReplacementItem_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem"("id") ON UPDATE CASCADE;
ALTER TABLE "ProcurementReplacementItem" ADD CONSTRAINT "ProcurementReplacementItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON UPDATE CASCADE;
