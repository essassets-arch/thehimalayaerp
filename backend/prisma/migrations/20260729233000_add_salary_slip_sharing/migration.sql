-- AlterTable
ALTER TABLE "SalarySlip" ADD COLUMN     "availableToEmployee" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "SalarySlipShare" (
    "id" TEXT NOT NULL,
    "salarySlipId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "allowDownload" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),

    CONSTRAINT "SalarySlipShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalarySlipShare_tokenHash_key" ON "SalarySlipShare"("tokenHash");

-- CreateIndex
CREATE INDEX "SalarySlipShare_salarySlipId_idx" ON "SalarySlipShare"("salarySlipId");

-- CreateIndex
CREATE INDEX "SalarySlipShare_expiresAt_idx" ON "SalarySlipShare"("expiresAt");

-- AddForeignKey
ALTER TABLE "SalarySlipShare" ADD CONSTRAINT "SalarySlipShare_salarySlipId_fkey" FOREIGN KEY ("salarySlipId") REFERENCES "SalarySlip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
