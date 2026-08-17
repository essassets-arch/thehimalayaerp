-- ── Fully Idempotent PostgreSQL Migration ─────────────────────────────────────

-- 1. Create Enums if not exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MachineStatus') THEN
        CREATE TYPE "MachineStatus" AS ENUM ('USE', 'NOT_USE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductionTargetStatus') THEN
        CREATE TYPE "ProductionTargetStatus" AS ENUM ('ACTIVE', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExpenseStatus') THEN
        CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING_HR', 'PENDING_SUPER_ADMIN', 'APPROVED', 'REJECTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeaveStatus') THEN
        CREATE TYPE "LeaveStatus" AS ENUM ('PENDING_HR', 'PENDING_PLANT_HEAD', 'PENDING_SUPER_ADMIN', 'APPROVED', 'REJECTED');
    END IF;
END $$;

-- 2. Drop constraints safely if exist
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT IF EXISTS "InventoryTransaction_productId_fkey";

-- Pre-create tables that will be altered or referenced below
CREATE TABLE IF NOT EXISTS "ProductionDailyReport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reportNo" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "shift" TEXT NOT NULL,
    "supervisorName" TEXT NOT NULL,
    "lineInCharge" TEXT NOT NULL,
    "manpowerCount" INTEGER NOT NULL DEFAULT 0,
    "totalSetQty" INTEGER NOT NULL DEFAULT 0,
    "totalCoverQty" INTEGER NOT NULL DEFAULT 0,
    "totalFrameQty" INTEGER NOT NULL DEFAULT 0,
    "totalWeightKg" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionDailyReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductionDailyReportItem" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "productId" TEXT,
    "customProductName" TEXT,
    "srNo" INTEGER NOT NULL,
    "size" TEXT,
    "type" TEXT,
    "capacity" TEXT,
    "coverQty" INTEGER NOT NULL DEFAULT 0,
    "coverUnitWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "coverWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "actualCoverWeight" DECIMAL(14,3),
    "frameQty" INTEGER NOT NULL DEFAULT 0,
    "frameUnitWeight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "frameWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "actualFrameWeight" DECIMAL(14,3),
    "weightOverrideReason" TEXT,
    "setQty" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "workOrderId" TEXT,
    "productionPlanId" TEXT,
    "salesOrderId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionDailyReportItem_pkey" PRIMARY KEY ("id")
);

-- 3. Add columns safely with IF NOT EXISTS
ALTER TABLE "CustomerComplaint" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;
ALTER TABLE "Dispatch" ADD COLUMN IF NOT EXISTS "dispatchCategory" TEXT;

ALTER TABLE "InventoryTransaction" ADD COLUMN IF NOT EXISTS "rawMaterialId" TEXT;
ALTER TABLE "InventoryTransaction" ALTER COLUMN "productId" DROP NOT NULL;

ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "capacity" TEXT,
ADD COLUMN IF NOT EXISTS "coverUnitWeight" DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS "coversPerSet" INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS "frameUnitWeight" DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS "framesPerSet" INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS "size" TEXT,
ADD COLUMN IF NOT EXISTS "type" TEXT;

ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "expectedTransportationCost" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;

ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;
ALTER TABLE "SampleRequest" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dispatchCategory" TEXT;

-- Reconcile and add missing nextReminder columns to match schema.prisma
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);
ALTER TABLE "SampleRequest" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);
ALTER TABLE "ProductionPlan" ADD COLUMN IF NOT EXISTS "priority" TEXT;
ALTER TABLE "FollowUp" ADD COLUMN IF NOT EXISTS "companyId" TEXT,
ADD COLUMN IF NOT EXISTS "customerName" TEXT,
ADD COLUMN IF NOT EXISTS "moduleType" TEXT,
ADD COLUMN IF NOT EXISTS "moduleId" TEXT,
ADD COLUMN IF NOT EXISTS "reminderDate" TEXT,
ADD COLUMN IF NOT EXISTS "reminderTime" TEXT,
ADD COLUMN IF NOT EXISTS "reminderType" TEXT DEFAULT 'Follow-up',
ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS "remarks" TEXT,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dismissedAt" TIMESTAMP(3);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='SalesOrder' AND column_name='nextReminderAt') THEN
        ALTER TABLE "SalesOrder" RENAME COLUMN "nextReminderAt" TO "nextReminder";
    ELSE
        ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);
    END IF;
END $$;

ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "reportNo" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "shift" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "supervisorName" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'DRAFT';
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalCovers" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalFrames" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalSets" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalCoverWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalFrameWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "updatedById" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "submittedById" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "approvedById" TEXT;
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

ALTER TABLE "ProductionDailyReport" ALTER COLUMN "shift" DROP NOT NULL;
ALTER TABLE "ProductionDailyReport" ALTER COLUMN "supervisorName" DROP NOT NULL;
ALTER TABLE "ProductionDailyReport" ALTER COLUMN "createdById" DROP NOT NULL;

-- 4. Create Tables safely if not exist
CREATE TABLE IF NOT EXISTS "inventory_items" (
    "id" SERIAL NOT NULL,
    "srNo" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "min_stock" INTEGER NOT NULL,
    "max_stock" INTEGER NOT NULL,
    "reorder_level" INTEGER NOT NULL,
    "valuation" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "machines" (
    "id" BIGSERIAL NOT NULL,
    "machine_id" VARCHAR(30) NOT NULL,
    "machine_name" VARCHAR(150) NOT NULL,
    "machine_type" VARCHAR(100) NOT NULL,
    "serial_number" VARCHAR(100),
    "location" VARCHAR(100),
    "plant_id" BIGINT NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "machine_daily_status" (
    "id" BIGSERIAL NOT NULL,
    "machine_id" BIGINT NOT NULL,
    "plant_id" BIGINT NOT NULL DEFAULT 1,
    "work_date" DATE NOT NULL,
    "status" "MachineStatus" NOT NULL,
    "remarks" VARCHAR(300),
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_daily_status_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "production_targets" (
    "id" TEXT NOT NULL,
    "target_period" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "target_volume" DECIMAL(14,3) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Pcs',
    "status" "ProductionTargetStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_targets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "description" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING_HR',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeaveRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" DECIMAL(5,1) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING_HR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeaveApproval" (
    "id" TEXT NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "approverRole" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "remarks" TEXT,
    "actionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ManualAttendanceRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "requestedInTime" TEXT,
    "requestedOutTime" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualAttendanceRequest_pkey" PRIMARY KEY ("id")
);

-- Reconcile and add missing Attendance, AttendancePunch, ShiftPolicy, and StockHistory schemas
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AttendanceStatus') THEN
        CREATE TYPE "AttendanceStatus" AS ENUM ('NOT_PUNCHED', 'PRESENT', 'PUNCHED_IN', 'PUNCHED_OUT', 'LATE', 'HALF_DAY', 'ABSENT', 'LEAVE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StockHistoryEvent') THEN
        CREATE TYPE "StockHistoryEvent" AS ENUM ('STOCK_IN', 'RESERVE', 'UNRESERVE', 'DISPATCH_OUT', 'QC_RECEIPT', 'ADJUSTMENT', 'RETURN_IN');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "AttendancePunch" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "empName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "location" TEXT,
    "coords" TEXT,
    "selfieUrl" TEXT,
    "isRealPunch" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendancePunch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ShiftPolicy" (
    "id" TEXT NOT NULL,
    "deptName" TEXT NOT NULL,
    "checkIn" TEXT NOT NULL,
    "checkOut" TEXT NOT NULL,
    "grace" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Attendance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "punchInAt" TIMESTAMP(3),
    "punchOutAt" TIMESTAMP(3),
    "punchInLatitude" DECIMAL(65,30),
    "punchInLongitude" DECIMAL(65,30),
    "punchInAddress" TEXT,
    "punchInAccuracy" DOUBLE PRECISION,
    "punchOutLatitude" DECIMAL(65,30),
    "punchOutLongitude" DECIMAL(65,30),
    "punchOutAddress" TEXT,
    "punchOutAccuracy" DOUBLE PRECISION,
    "punchInSelfieUrl" TEXT,
    "punchOutSelfieUrl" TEXT,
    "workedSeconds" INTEGER NOT NULL DEFAULT 0,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'NOT_PUNCHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StockHistory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "salesOrderId" TEXT,
    "salesOrderItemId" TEXT,
    "allocationId" TEXT,
    "dispatchId" TEXT,
    "event" "StockHistoryEvent" NOT NULL,
    "actor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'AttendancePunch_empId_idx') THEN
        CREATE INDEX "AttendancePunch_empId_idx" ON "AttendancePunch"("empId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'AttendancePunch_date_idx') THEN
        CREATE INDEX "AttendancePunch_date_idx" ON "AttendancePunch"("date");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ShiftPolicy_deptName_key') THEN
        CREATE UNIQUE INDEX "ShiftPolicy_deptName_key" ON "ShiftPolicy"("deptName");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Attendance_companyId_idx') THEN
        CREATE INDEX "Attendance_companyId_idx" ON "Attendance"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Attendance_userId_idx') THEN
        CREATE INDEX "Attendance_userId_idx" ON "Attendance"("userId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Attendance_attendanceDate_idx') THEN
        CREATE INDEX "Attendance_attendanceDate_idx" ON "Attendance"("attendanceDate");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'StockHistory_companyId_productId_createdAt_idx') THEN
        CREATE INDEX "StockHistory_companyId_productId_createdAt_idx" ON "StockHistory"("companyId", "productId", "createdAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'StockHistory_salesOrderId_idx') THEN
        CREATE INDEX "StockHistory_salesOrderId_idx" ON "StockHistory"("salesOrderId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'StockHistory_allocationId_idx') THEN
        CREATE INDEX "StockHistory_allocationId_idx" ON "StockHistory"("allocationId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'StockHistory_dispatchId_idx') THEN
        CREATE INDEX "StockHistory_dispatchId_idx" ON "StockHistory"("dispatchId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Attendance_userId_fkey') THEN
        ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "RawMaterial" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "category" TEXT,
    "unit" TEXT NOT NULL,
    "minimumStock" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "storageLocation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- ProductionDailyReport and ProductionDailyReportItem moved to the top of this migration script

-- 5. Create Indexes safely if not exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'inventory_items_code_key') THEN
        CREATE UNIQUE INDEX "inventory_items_code_key" ON "inventory_items"("code");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'machines_machine_id_key') THEN
        CREATE UNIQUE INDEX "machines_machine_id_key" ON "machines"("machine_id");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'machine_daily_status_machine_id_work_date_key') THEN
        CREATE UNIQUE INDEX "machine_daily_status_machine_id_work_date_key" ON "machine_daily_status"("machine_id", "work_date");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'production_targets_start_date_end_date_idx') THEN
        CREATE INDEX "production_targets_start_date_end_date_idx" ON "production_targets"("start_date", "end_date");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'production_targets_status_target_period_idx') THEN
        CREATE INDEX "production_targets_status_target_period_idx" ON "production_targets"("status", "target_period");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Expense_employeeId_idx') THEN
        CREATE INDEX "Expense_employeeId_idx" ON "Expense"("employeeId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Expense_companyId_idx') THEN
        CREATE INDEX "Expense_companyId_idx" ON "Expense"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'LeaveRequest_employeeId_idx') THEN
        CREATE INDEX "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'LeaveRequest_companyId_idx') THEN
        CREATE INDEX "LeaveRequest_companyId_idx" ON "LeaveRequest"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'LeaveApproval_leaveRequestId_idx') THEN
        CREATE INDEX "LeaveApproval_leaveRequestId_idx" ON "LeaveApproval"("leaveRequestId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ManualAttendanceRequest_employeeId_idx') THEN
        CREATE INDEX "ManualAttendanceRequest_employeeId_idx" ON "ManualAttendanceRequest"("employeeId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'RawMaterial_publicId_key') THEN
        CREATE UNIQUE INDEX "RawMaterial_publicId_key" ON "RawMaterial"("publicId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'RawMaterial_sku_key') THEN
        CREATE UNIQUE INDEX "RawMaterial_sku_key" ON "RawMaterial"("sku");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'RawMaterial_companyId_idx') THEN
        CREATE INDEX "RawMaterial_companyId_idx" ON "RawMaterial"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'RawMaterial_sku_idx') THEN
        CREATE INDEX "RawMaterial_sku_idx" ON "RawMaterial"("sku");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProductionDailyReport_reportNo_key') THEN
        CREATE UNIQUE INDEX "ProductionDailyReport_reportNo_key" ON "ProductionDailyReport"("reportNo");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProductionDailyReport_companyId_status_idx') THEN
        CREATE INDEX "ProductionDailyReport_companyId_status_idx" ON "ProductionDailyReport"("companyId", "status");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProductionDailyReport_reportDate_idx') THEN
        CREATE INDEX "ProductionDailyReport_reportDate_idx" ON "ProductionDailyReport"("reportDate");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProductionDailyReport_companyId_reportDate_shift_key') THEN
        CREATE UNIQUE INDEX "ProductionDailyReport_companyId_reportDate_shift_key" ON "ProductionDailyReport"("companyId", "reportDate", "shift");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProductionDailyReportItem_reportId_idx') THEN
        CREATE INDEX "ProductionDailyReportItem_reportId_idx" ON "ProductionDailyReportItem"("reportId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProductionDailyReportItem_productId_idx') THEN
        CREATE INDEX "ProductionDailyReportItem_productId_idx" ON "ProductionDailyReportItem"("productId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'CustomerComplaint_salesExecutiveId_idx') THEN
        CREATE INDEX "CustomerComplaint_salesExecutiveId_idx" ON "CustomerComplaint"("salesExecutiveId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'DispatchItem_dispatchId_salesOrderItemId_key') THEN
        CREATE UNIQUE INDEX "DispatchItem_dispatchId_salesOrderItemId_key" ON "DispatchItem"("dispatchId", "salesOrderItemId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Lead_salesExecutiveId_idx') THEN
        CREATE INDEX "Lead_salesExecutiveId_idx" ON "Lead"("salesExecutiveId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ProductionPlan_salesOrderId_key') THEN
        CREATE UNIQUE INDEX "ProductionPlan_salesOrderId_key" ON "ProductionPlan"("salesOrderId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Quotation_salesExecutiveId_idx') THEN
        CREATE INDEX "Quotation_salesExecutiveId_idx" ON "Quotation"("salesExecutiveId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'SalesOrder_sourceQuotationId_key') THEN
        CREATE UNIQUE INDEX "SalesOrder_sourceQuotationId_key" ON "SalesOrder"("sourceQuotationId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'SalesOrder_salesExecutiveId_idx') THEN
        CREATE INDEX "SalesOrder_salesExecutiveId_idx" ON "SalesOrder"("salesExecutiveId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'SampleRequest_companyId_salesExecutiveId_idx') THEN
        CREATE INDEX "SampleRequest_companyId_salesExecutiveId_idx" ON "SampleRequest"("companyId", "salesExecutiveId");
    END IF;
END $$;

-- 6. Add Foreign Keys safely if not exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Lead_salesExecutiveId_fkey') THEN
        ALTER TABLE "Lead" ADD CONSTRAINT "Lead_salesExecutiveId_fkey" FOREIGN KEY ("salesExecutiveId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InventoryTransaction_productId_fkey') THEN
        ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InventoryTransaction_rawMaterialId_fkey') THEN
        ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Quotation_salesExecutiveId_fkey') THEN
        ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_salesExecutiveId_fkey" FOREIGN KEY ("salesExecutiveId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SalesOrder_salesExecutiveId_fkey') THEN
        ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_salesExecutiveId_fkey" FOREIGN KEY ("salesExecutiveId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CustomerComplaint_salesExecutiveId_fkey') THEN
        ALTER TABLE "CustomerComplaint" ADD CONSTRAINT "CustomerComplaint_salesExecutiveId_fkey" FOREIGN KEY ("salesExecutiveId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SampleRequest_salesExecutiveId_fkey') THEN
        ALTER TABLE "SampleRequest" ADD CONSTRAINT "SampleRequest_salesExecutiveId_fkey" FOREIGN KEY ("salesExecutiveId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'machine_daily_status_machine_id_fkey') THEN
        ALTER TABLE "machine_daily_status" ADD CONSTRAINT "machine_daily_status_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'machine_daily_status_updated_by_id_fkey') THEN
        ALTER TABLE "machine_daily_status" ADD CONSTRAINT "machine_daily_status_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeaveRequest_companyId_fkey') THEN
        ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeaveRequest_employeeId_fkey') THEN
        ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeaveRequest_departmentId_fkey') THEN
        ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeaveApproval_leaveRequestId_fkey') THEN
        ALTER TABLE "LeaveApproval" ADD CONSTRAINT "LeaveApproval_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ManualAttendanceRequest_employeeId_fkey') THEN
        ALTER TABLE "ManualAttendanceRequest" ADD CONSTRAINT "ManualAttendanceRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RawMaterial_companyId_fkey') THEN
        ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductionDailyReport_companyId_fkey') THEN
        ALTER TABLE "ProductionDailyReport" ADD CONSTRAINT "ProductionDailyReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductionDailyReport_createdById_fkey') THEN
        ALTER TABLE "ProductionDailyReport" ADD CONSTRAINT "ProductionDailyReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductionDailyReport_approvedById_fkey') THEN
        ALTER TABLE "ProductionDailyReport" ADD CONSTRAINT "ProductionDailyReport_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductionDailyReportItem_reportId_fkey') THEN
        ALTER TABLE "ProductionDailyReportItem" ADD CONSTRAINT "ProductionDailyReportItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ProductionDailyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductionDailyReportItem_productId_fkey') THEN
        ALTER TABLE "ProductionDailyReportItem" ADD CONSTRAINT "ProductionDailyReportItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
