-- Replace the legacy return/RMA complaint shape with the customer complaint workflow.
DROP TABLE IF EXISTS "CustomerComplaint" CASCADE;
-- Legacy enum types are retained because the local legacy-data backup retains
-- its original enum columns. They are harmless once no live table uses them.

CREATE TYPE "ComplaintStatus" AS ENUM ('DRAFT', 'PENDING_SUPER_ADMIN', 'APPROVED', 'REJECTED');

CREATE TABLE "CustomerComplaint" (
  "id" TEXT NOT NULL,
  "complaintNo" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "complaintType" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "complaintDate" TIMESTAMP(3) NOT NULL,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "salesRemarks" TEXT,
  "attachment" TEXT,
  "status" "ComplaintStatus" NOT NULL DEFAULT 'DRAFT',
  "adminRemarks" TEXT,
  "submittedBy" TEXT,
  "submittedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectedBy" TEXT,
  "rejectedAt" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerComplaint_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CustomerComplaint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CustomerComplaint_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CustomerComplaint_complaintNo_key" ON "CustomerComplaint"("complaintNo");
CREATE INDEX "CustomerComplaint_customerId_idx" ON "CustomerComplaint"("customerId");
CREATE INDEX "CustomerComplaint_productId_idx" ON "CustomerComplaint"("productId");
CREATE INDEX "CustomerComplaint_status_idx" ON "CustomerComplaint"("status");
