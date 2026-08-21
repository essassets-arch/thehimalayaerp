-- AlterTable
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "permanentAddress" TEXT;
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "companyPhoneNumber" TEXT;
