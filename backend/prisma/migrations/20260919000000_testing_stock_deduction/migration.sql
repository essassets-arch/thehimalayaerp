-- Additive migration: historical testing records remain untouched and do not consume stock retroactively.
ALTER TYPE "StockHistoryEvent" ADD VALUE IF NOT EXISTS 'TESTING';
ALTER TABLE "ProductionTestingRecord"
  ALTER COLUMN "productName" DROP NOT NULL,
  ADD COLUMN "productId" TEXT,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "requestId" TEXT,
  ADD COLUMN "previousQuantity" DECIMAL(18,3),
  ADD COLUMN "remainingQuantity" DECIMAL(18,3);
ALTER TABLE "ProductionTestingRecord" ADD CONSTRAINT "ProductionTestingRecord_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductionTestingRecord" ADD CONSTRAINT "ProductionTestingRecord_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "ProductionTestingRecord_companyId_requestId_key" ON "ProductionTestingRecord"("companyId", "requestId");
CREATE INDEX "ProductionTestingRecord_companyId_createdAt_idx" ON "ProductionTestingRecord"("companyId", "createdAt");
