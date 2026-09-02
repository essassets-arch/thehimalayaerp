-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ExpenseClaimStatus" AS ENUM ('PENDING_HR', 'PENDING_SUPERADMIN', 'PENDING_FINANCE', 'FINANCE_PROCESSED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ExpenseClaimHistoryAction" AS ENUM ('SUBMITTED', 'HR_APPROVED', 'HR_REJECTED', 'SUPER_ADMIN_APPROVED', 'SUPER_ADMIN_REJECTED', 'FINANCE_PROCESSED', 'FINANCE_REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ExpenseClaim" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT,
    "claimNumber" TEXT NOT NULL,
    "expenseName" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "receiptUrl" TEXT,
    "status" "ExpenseClaimStatus" NOT NULL DEFAULT 'PENDING_HR',
    "hrApprovedById" TEXT,
    "hrApprovedBy" TEXT,
    "hrApprovedAt" TIMESTAMP(3),
    "hrRemarks" TEXT,
    "superAdminApprovedById" TEXT,
    "superAdminApprovedBy" TEXT,
    "superAdminApprovedAt" TIMESTAMP(3),
    "superAdminRemarks" TEXT,
    "financeProcessedById" TEXT,
    "financeProcessedBy" TEXT,
    "financeProcessedAt" TIMESTAMP(3),
    "financeRemarks" TEXT,
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ExpenseClaimApprovalHistory" (
    "id" TEXT NOT NULL,
    "expenseClaimId" TEXT NOT NULL,
    "action" "ExpenseClaimHistoryAction" NOT NULL,
    "fromStatus" "ExpenseClaimStatus",
    "toStatus" "ExpenseClaimStatus" NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseClaimApprovalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ExpenseClaim_publicId_key" ON "ExpenseClaim"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ExpenseClaim_claimNumber_key" ON "ExpenseClaim"("claimNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExpenseClaim_companyId_status_idx" ON "ExpenseClaim"("companyId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExpenseClaim_userId_idx" ON "ExpenseClaim"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExpenseClaim_employeeId_idx" ON "ExpenseClaim"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExpenseClaim_createdAt_idx" ON "ExpenseClaim"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExpenseClaimApprovalHistory_expenseClaimId_createdAt_idx" ON "ExpenseClaimApprovalHistory"("expenseClaimId", "createdAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExpenseClaim_companyId_fkey') THEN
        ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExpenseClaim_userId_fkey') THEN
        ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExpenseClaim_employeeId_fkey') THEN
        ALTER TABLE "ExpenseClaim" ADD CONSTRAINT "ExpenseClaim_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExpenseClaimApprovalHistory_expenseClaimId_fkey') THEN
        ALTER TABLE "ExpenseClaimApprovalHistory" ADD CONSTRAINT "ExpenseClaimApprovalHistory_expenseClaimId_fkey" FOREIGN KEY ("expenseClaimId") REFERENCES "ExpenseClaim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
