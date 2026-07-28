ALTER TABLE "Lead"
ADD COLUMN "groupName" TEXT,
ADD COLUMN "projectName" TEXT,
ADD COLUMN "gstName" TEXT,
ADD COLUMN "gstNumber" TEXT,
ADD COLUMN "address" JSONB;
