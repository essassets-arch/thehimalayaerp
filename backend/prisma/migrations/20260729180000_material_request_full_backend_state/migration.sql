ALTER TABLE "MaterialRequest"
ADD COLUMN "metadata" JSONB;

ALTER TABLE "MaterialRequestItem"
ADD COLUMN "issuedQuantity" DECIMAL(14,2),
ADD COLUMN "receivedQuantity" DECIMAL(14,2),
ADD COLUMN "consumedQuantity" DECIMAL(14,2),
ADD COLUMN "returnedQuantity" DECIMAL(14,2);
