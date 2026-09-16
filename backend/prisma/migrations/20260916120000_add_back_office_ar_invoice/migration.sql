-- CreateTable
CREATE TABLE IF NOT EXISTS "BackOfficeArInvoice" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL DEFAULT 'APPL',
    "srNo" INTEGER,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "basicAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "invoiceAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "companyName" TEXT NOT NULL,
    "siteName" TEXT,
    "city" TEXT,
    "salesType" TEXT NOT NULL DEFAULT 'Regular',
    "salesPerson" TEXT,
    "paymentTermDays" INTEGER NOT NULL DEFAULT 30,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "amtRcvd" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amtRcvdDate" TIMESTAMP(3),
    "completePaymentDate" TIMESTAMP(3),
    "outstanding" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "quarter" TEXT NOT NULL,
    "ageingDays" INTEGER,
    "ageingBucket" TEXT,
    "salesOrderId" TEXT,
    "dispatchId" TEXT,
    "salesInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackOfficeArInvoice_pkey" PRIMARY KEY ("id")
);

-- Fallback for existing instances to ensure columns exist
ALTER TABLE "BackOfficeArInvoice" ADD COLUMN IF NOT EXISTS "ageingDays" INTEGER;
ALTER TABLE "BackOfficeArInvoice" ADD COLUMN IF NOT EXISTS "ageingBucket" TEXT;


-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BackOfficeArInvoice_entity_invoiceNumber_key" ON "BackOfficeArInvoice"("entity", "invoiceNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackOfficeArInvoice_entity_idx" ON "BackOfficeArInvoice"("entity");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackOfficeArInvoice_quarter_idx" ON "BackOfficeArInvoice"("quarter");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackOfficeArInvoice_status_idx" ON "BackOfficeArInvoice"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackOfficeArInvoice_salesPerson_idx" ON "BackOfficeArInvoice"("salesPerson");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackOfficeArInvoice_companyName_idx" ON "BackOfficeArInvoice"("companyName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackOfficeArInvoice_invoiceDate_idx" ON "BackOfficeArInvoice"("invoiceDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackOfficeArInvoice_dueDate_idx" ON "BackOfficeArInvoice"("dueDate");
