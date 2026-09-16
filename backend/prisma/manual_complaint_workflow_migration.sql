-- Migration for Customer Complaint Workflow
-- 1. Add new enum values to ComplaintStatus
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'PLANT_HEAD_PENDING';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'PLANT_HEAD_APPROVED';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'DISPATCH_PENDING';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'DISPATCH_COMPLETED';
ALTER TYPE "ComplaintStatus" ADD VALUE IF NOT EXISTS 'FINANCE_PENDING';

-- 2. Migrate existing status records to canonical PLANT_HEAD_PENDING
UPDATE "CustomerComplaint"
SET status = 'PLANT_HEAD_PENDING'
WHERE status::text IN ('PENDING_PLANT_HEAD', 'SUBMITTED', 'PENDING_SUPER_ADMIN');

-- 3. Extend CustomerComplaint table
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "dispatchCompletedAt" timestamp;
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "dispatchCompletedBy" text;
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "dispatchRemarks" text;
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "dispatchEvidence" text;
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "financeApprovedReturnAmount" numeric(18,2);
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "financeRemarks" text;
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "financeResolvedAt" timestamp;
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "financeResolvedBy" text;
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "originalBillAmount" numeric(18,2);
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "calculatedComplaintAmount" numeric(18,2);
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "netOrderValue" numeric(18,2);

-- 4. Extend CustomerComplaintItem table
ALTER TABLE "CustomerComplaintItem" ADD COLUMN IF NOT EXISTS "unitPrice" numeric(18,2) DEFAULT 0;
ALTER TABLE "CustomerComplaintItem" ADD COLUMN IF NOT EXISTS "complaintAmount" numeric(18,2) DEFAULT 0;
ALTER TABLE "CustomerComplaintItem" ADD COLUMN IF NOT EXISTS "productNameSnapshot" text;
ALTER TABLE "CustomerComplaintItem" ADD COLUMN IF NOT EXISTS "productCodeSnapshot" text;

-- 5. Create ComplaintFinancialAdjustment table
CREATE TABLE IF NOT EXISTS "ComplaintFinancialAdjustment" (
  "id" text PRIMARY KEY,
  "complaintId" text UNIQUE NOT NULL REFERENCES "CustomerComplaint"("id") ON DELETE CASCADE,
  "salesOrderId" text NOT NULL REFERENCES "SalesOrder"("id"),
  "customerId" text NOT NULL REFERENCES "Customer"("id"),
  "salesExecutiveId" text REFERENCES "User"("id"),
  "referenceNumber" text UNIQUE NOT NULL,
  "originalOrderAmount" numeric(18,2) NOT NULL,
  "calculatedReturnAmount" numeric(18,2) NOT NULL,
  "approvedReturnAmount" numeric(18,2) NOT NULL,
  "netOrderAmount" numeric(18,2) NOT NULL,
  "adjustmentType" text NOT NULL DEFAULT 'RETURN_ADJUSTMENT',
  "status" text NOT NULL DEFAULT 'APPLIED',
  "remarks" text NOT NULL,
  "createdById" text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ComplaintFinancialAdjustment_salesOrderId_idx" ON "ComplaintFinancialAdjustment"("salesOrderId");
CREATE INDEX IF NOT EXISTS "ComplaintFinancialAdjustment_customerId_idx" ON "ComplaintFinancialAdjustment"("customerId");
CREATE INDEX IF NOT EXISTS "ComplaintFinancialAdjustment_salesExecutiveId_idx" ON "ComplaintFinancialAdjustment"("salesExecutiveId");

-- 6. Create ComplaintStatusHistory table
CREATE TABLE IF NOT EXISTS "ComplaintStatusHistory" (
  "id" text PRIMARY KEY,
  "complaintId" text NOT NULL REFERENCES "CustomerComplaint"("id") ON DELETE CASCADE,
  "fromStatus" text,
  "toStatus" text NOT NULL,
  "action" text NOT NULL,
  "actorId" text,
  "remarks" text,
  "metadata" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ComplaintStatusHistory_complaintId_idx" ON "ComplaintStatusHistory"("complaintId");

-- 7. Create ComplaintAttachment table
CREATE TABLE IF NOT EXISTS "ComplaintAttachment" (
  "id" text PRIMARY KEY,
  "complaintId" text NOT NULL REFERENCES "CustomerComplaint"("id") ON DELETE CASCADE,
  "fileUrl" text NOT NULL,
  "fileName" text,
  "fileType" text,
  "fileSize" integer,
  "category" text NOT NULL,
  "uploadedById" text,
  "uploadedAt" timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ComplaintAttachment_complaintId_idx" ON "ComplaintAttachment"("complaintId");
