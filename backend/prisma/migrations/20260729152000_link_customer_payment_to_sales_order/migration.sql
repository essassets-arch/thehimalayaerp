ALTER TABLE "CustomerPayment"
ADD COLUMN "salesOrderId" TEXT;

CREATE INDEX "CustomerPayment_salesOrderId_idx"
ON "CustomerPayment"("salesOrderId");

ALTER TABLE "CustomerPayment"
ADD CONSTRAINT "CustomerPayment_salesOrderId_fkey"
FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
