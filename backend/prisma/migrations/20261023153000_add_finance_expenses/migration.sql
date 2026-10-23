-- CreateTable: finance_expense_categories
CREATE TABLE IF NOT EXISTS "finance_expense_categories" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable: finance_expense_headers
CREATE TABLE IF NOT EXISTS "finance_expense_headers" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_expense_headers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: finance_expenses
CREATE TABLE IF NOT EXISTS "finance_expenses" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "expenseNumber" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "headerId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "description" TEXT NOT NULL,
    "paidTo" TEXT,
    "paymentMethod" TEXT,
    "voucherNumber" TEXT,
    "invoiceNumber" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECORDED',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_expenses_pkey" PRIMARY KEY ("id")
);

-- Indexes for finance_expense_categories
CREATE UNIQUE INDEX IF NOT EXISTS "finance_expense_categories_publicId_key" ON "finance_expense_categories"("publicId");
CREATE UNIQUE INDEX IF NOT EXISTS "finance_expense_categories_companyId_name_key" ON "finance_expense_categories"("companyId", "name");
CREATE INDEX IF NOT EXISTS "finance_expense_categories_companyId_isActive_idx" ON "finance_expense_categories"("companyId", "isActive");

-- Indexes for finance_expense_headers
CREATE UNIQUE INDEX IF NOT EXISTS "finance_expense_headers_publicId_key" ON "finance_expense_headers"("publicId");
CREATE UNIQUE INDEX IF NOT EXISTS "finance_expense_headers_categoryId_name_key" ON "finance_expense_headers"("categoryId", "name");
CREATE INDEX IF NOT EXISTS "finance_expense_headers_categoryId_isActive_idx" ON "finance_expense_headers"("categoryId", "isActive");

-- Indexes for finance_expenses
CREATE UNIQUE INDEX IF NOT EXISTS "finance_expenses_publicId_key" ON "finance_expenses"("publicId");
CREATE UNIQUE INDEX IF NOT EXISTS "finance_expenses_expenseNumber_key" ON "finance_expenses"("expenseNumber");
CREATE INDEX IF NOT EXISTS "finance_expenses_companyId_expenseDate_idx" ON "finance_expenses"("companyId", "expenseDate");
CREATE INDEX IF NOT EXISTS "finance_expenses_companyId_categoryId_idx" ON "finance_expenses"("companyId", "categoryId");
CREATE INDEX IF NOT EXISTS "finance_expenses_companyId_headerId_idx" ON "finance_expenses"("companyId", "headerId");
CREATE INDEX IF NOT EXISTS "finance_expenses_createdAt_idx" ON "finance_expenses"("createdAt");

-- Foreign key constraints with exception suppression
DO $$ BEGIN
    ALTER TABLE "finance_expense_categories" ADD CONSTRAINT "finance_expense_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "finance_expense_headers" ADD CONSTRAINT "finance_expense_headers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "finance_expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "finance_expenses" ADD CONSTRAINT "finance_expenses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "finance_expenses" ADD CONSTRAINT "finance_expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "finance_expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "finance_expenses" ADD CONSTRAINT "finance_expenses_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "finance_expense_headers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "finance_expenses" ADD CONSTRAINT "finance_expenses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "finance_expenses" ADD CONSTRAINT "finance_expenses_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
