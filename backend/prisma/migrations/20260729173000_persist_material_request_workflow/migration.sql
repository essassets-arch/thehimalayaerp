ALTER TABLE "MaterialRequest"
ADD COLUMN "workOrderNo" TEXT,
ADD COLUMN "warehouse" TEXT,
ADD COLUMN "priority" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "approvedById" TEXT,
ADD COLUMN "approvedAt" TIMESTAMP(3);

ALTER TABLE "MaterialRequestItem"
ADD COLUMN "approvedQuantity" DECIMAL(14,2),
ADD COLUMN "unit" TEXT;
