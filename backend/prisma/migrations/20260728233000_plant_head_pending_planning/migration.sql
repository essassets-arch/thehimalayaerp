ALTER TYPE "SalesOrderStatus" ADD VALUE IF NOT EXISTS 'SENT_TO_PLANT_HEAD';
ALTER TYPE "ProductionPlanStatus" ADD VALUE IF NOT EXISTS 'PENDING_PLANNING';

ALTER TABLE "ProductionPlan" ADD COLUMN "assignedToId" TEXT;

ALTER TABLE "ProductionPlan"
ADD CONSTRAINT "ProductionPlan_assignedToId_fkey"
FOREIGN KEY ("assignedToId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ProductionPlan_salesOrderId_idx"
ON "ProductionPlan"("salesOrderId");

CREATE INDEX "ProductionPlan_assignedToId_idx"
ON "ProductionPlan"("assignedToId");
