ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "salesOrderItemId" TEXT;
CREATE INDEX IF NOT EXISTS "WorkOrder_salesOrderItemId_idx"
  ON "WorkOrder"("salesOrderItemId");
ALTER TABLE "WorkOrder"
  ADD CONSTRAINT "WorkOrder_salesOrderItemId_fkey"
  FOREIGN KEY ("salesOrderItemId") REFERENCES "SalesOrderItem"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
