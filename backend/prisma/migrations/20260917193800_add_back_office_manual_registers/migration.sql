-- CreateTable SampleTrackerEntry
CREATE TABLE IF NOT EXISTS "SampleTrackerEntry" (
    "id" TEXT NOT NULL,
    "partyName" TEXT NOT NULL,
    "sitePincode" TEXT,
    "materialManually" TEXT NOT NULL,
    "partyContact" TEXT,
    "referencePerson" TEXT,
    "referenceNumber" TEXT,
    "dispatchDate" TIMESTAMP(3) NOT NULL,
    "transportMode" TEXT NOT NULL,
    "transportAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "remark" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SampleTrackerEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SampleTrackerEntry_isArchived_idx" ON "SampleTrackerEntry"("isArchived");
CREATE INDEX IF NOT EXISTS "SampleTrackerEntry_dispatchDate_idx" ON "SampleTrackerEntry"("dispatchDate");
CREATE INDEX IF NOT EXISTS "SampleTrackerEntry_partyName_idx" ON "SampleTrackerEntry"("partyName");
CREATE INDEX IF NOT EXISTS "SampleTrackerEntry_status_idx" ON "SampleTrackerEntry"("status");
CREATE INDEX IF NOT EXISTS "SampleTrackerEntry_transportMode_idx" ON "SampleTrackerEntry"("transportMode");

-- CreateTable OutwardRegisterEntry
CREATE TABLE IF NOT EXISTS "OutwardRegisterEntry" (
    "id" TEXT NOT NULL,
    "outwardDate" TIMESTAMP(3) NOT NULL,
    "transporterName" TEXT NOT NULL,
    "vehicleNo" TEXT,
    "material" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "partyName" TEXT NOT NULL,
    "salesPerson" TEXT,
    "invoiceNo" TEXT,
    "receivingManually" TEXT,
    "remark" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "OutwardRegisterEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OutwardRegisterEntry_isArchived_idx" ON "OutwardRegisterEntry"("isArchived");
CREATE INDEX IF NOT EXISTS "OutwardRegisterEntry_outwardDate_idx" ON "OutwardRegisterEntry"("outwardDate");
CREATE INDEX IF NOT EXISTS "OutwardRegisterEntry_partyName_idx" ON "OutwardRegisterEntry"("partyName");
CREATE INDEX IF NOT EXISTS "OutwardRegisterEntry_transporterName_idx" ON "OutwardRegisterEntry"("transporterName");
CREATE INDEX IF NOT EXISTS "OutwardRegisterEntry_salesPerson_idx" ON "OutwardRegisterEntry"("salesPerson");
CREATE INDEX IF NOT EXISTS "OutwardRegisterEntry_invoiceNo_idx" ON "OutwardRegisterEntry"("invoiceNo");

-- CreateTable PaymentFollowUpEntry
CREATE TABLE IF NOT EXISTS "PaymentFollowUpEntry" (
    "id" TEXT NOT NULL,
    "partyName" TEXT NOT NULL,
    "duePaymentAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "salesPerson" TEXT,
    "remarks" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PaymentFollowUpEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PaymentFollowUpEntry_isArchived_idx" ON "PaymentFollowUpEntry"("isArchived");
CREATE INDEX IF NOT EXISTS "PaymentFollowUpEntry_partyName_idx" ON "PaymentFollowUpEntry"("partyName");
CREATE INDEX IF NOT EXISTS "PaymentFollowUpEntry_salesPerson_idx" ON "PaymentFollowUpEntry"("salesPerson");
CREATE INDEX IF NOT EXISTS "PaymentFollowUpEntry_createdAt_idx" ON "PaymentFollowUpEntry"("createdAt");
