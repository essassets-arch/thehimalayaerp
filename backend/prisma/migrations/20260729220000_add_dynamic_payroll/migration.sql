-- CreateEnum
CREATE TYPE "PayrollPeriodStatus" AS ENUM ('OPEN', 'ATTENDANCE_LOCKED', 'PAYROLL_PROCESSING', 'PAYROLL_COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'READY_FOR_SUBMISSION', 'PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'REJECTED', 'ON_HOLD', 'CORRECTION_REQUIRED', 'SENT_TO_FINANCE', 'PAYMENT_PROCESSING', 'SALARY_PAID', 'PAYMENT_FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollAdjustmentType" AS ENUM ('BONUS', 'INCENTIVE', 'OVERTIME', 'ARREARS', 'REIMBURSEMENT', 'OTHER_EARNING', 'LEAVE_DEDUCTION', 'LOAN_DEDUCTION', 'ADVANCE_DEDUCTION', 'TAX_DEDUCTION', 'OTHER_DEDUCTION');

-- CreateEnum
CREATE TYPE "SalaryPaymentMode" AS ENUM ('BANK_TRANSFER', 'NEFT', 'RTGS', 'IMPS', 'UPI', 'CHEQUE', 'CASH', 'OTHER');

-- Preserve historical rows from the legacy salary-slip table.
ALTER TABLE "SalarySlip" RENAME TO "SalarySlipLegacy";
ALTER TABLE "SalarySlipLegacy" RENAME CONSTRAINT "SalarySlip_pkey" TO "SalarySlipLegacy_pkey";
ALTER TABLE "SalarySlipLegacy" RENAME CONSTRAINT "SalarySlip_employeeId_fkey" TO "SalarySlipLegacy_employeeId_fkey";
ALTER INDEX "SalarySlip_publicId_key" RENAME TO "SalarySlipLegacy_publicId_key";

-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE TABLE "SalarySlip" (
    "id" TEXT NOT NULL,
    "payrollRecordId" TEXT NOT NULL,
    "slipNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salaryMonth" INTEGER NOT NULL,
    "salaryYear" INTEGER NOT NULL,
    "grossEarnings" DECIMAL(14,2) NOT NULL,
    "totalDeductions" DECIMAL(14,2) NOT NULL,
    "netPaid" DECIMAL(14,2) NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalarySlip_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "WorkLocation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PayrollPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSalaryStructure" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "basicSalary" DECIMAL(14,2) NOT NULL,
    "hra" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "conveyanceAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "specialAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "otherAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "pfApplicable" BOOLEAN NOT NULL DEFAULT false,
    "esicApplicable" BOOLEAN NOT NULL DEFAULT false,
    "professionalTax" BOOLEAN NOT NULL DEFAULT false,
    "tdsApplicable" BOOLEAN NOT NULL DEFAULT false,
    "grossSalary" DECIMAL(14,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeMonthlyAttendanceSummary" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "calendarDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "workingDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "presentDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "paidLeaveDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "unpaidLeaveDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "halfDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "absentDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "weeklyOffDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "holidayDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "payableDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "overtimeHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "lateMarks" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "EmployeeMonthlyAttendanceSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRecord" (
    "id" TEXT NOT NULL,
    "payrollNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "attendanceSummaryId" TEXT,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "calendarDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "standardWorkingDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "presentDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "paidLeaveDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "unpaidLeaveDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "payableDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "overtimeHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "basicSalary" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hra" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "conveyanceAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "specialAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "otherAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "overtimeAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "bonusAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "incentiveAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "arrearsAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "otherEarnings" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grossEarnings" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "leaveDeduction" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "pfDeduction" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "esicDeduction" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "professionalTax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tdsDeduction" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "loanDeduction" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "advanceDeduction" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "netPayable" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hrRemarks" TEXT,
    "superAdminRemarks" TEXT,
    "financeRemarks" TEXT,
    "preparedById" TEXT,
    "preparedAt" TIMESTAMP(3),
    "submittedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "sentToFinanceById" TEXT,
    "sentToFinanceAt" TIMESTAMP(3),
    "processingStartedById" TEXT,
    "processingStartedAt" TIMESTAMP(3),
    "paidById" TEXT,
    "paidAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "holdReason" TEXT,
    "correctionReason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAdjustment" (
    "id" TEXT NOT NULL,
    "payrollRecordId" TEXT NOT NULL,
    "type" "PayrollAdjustmentType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "isEarning" BOOLEAN NOT NULL,
    "addedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryPayment" (
    "id" TEXT NOT NULL,
    "payrollRecordId" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMode" "SalaryPaymentMode" NOT NULL,
    "paidAmount" DECIMAL(14,2) NOT NULL,
    "bankAccountId" TEXT,
    "utrNumber" TEXT,
    "transactionReference" TEXT,
    "remarks" TEXT,
    "attachmentUrl" TEXT,
    "paidById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollStatusHistory" (
    "id" TEXT NOT NULL,
    "payrollRecordId" TEXT NOT NULL,
    "fromStatus" "PayrollStatus",
    "toStatus" "PayrollStatus" NOT NULL,
    "action" TEXT NOT NULL,
    "remarks" TEXT,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayrollPeriod_status_idx" ON "PayrollPeriod"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_month_year_key" ON "PayrollPeriod"("month", "year");

-- CreateIndex
CREATE INDEX "EmployeeSalaryStructure_employeeId_effectiveFrom_idx" ON "EmployeeSalaryStructure"("employeeId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeMonthlyAttendanceSummary_employeeId_payrollPeriodId_key" ON "EmployeeMonthlyAttendanceSummary"("employeeId", "payrollPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRecord_payrollNumber_key" ON "PayrollRecord"("payrollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRecord_attendanceSummaryId_key" ON "PayrollRecord"("attendanceSummaryId");

-- CreateIndex
CREATE INDEX "PayrollRecord_payrollPeriodId_status_idx" ON "PayrollRecord"("payrollPeriodId", "status");

-- CreateIndex
CREATE INDEX "PayrollRecord_employeeId_status_idx" ON "PayrollRecord"("employeeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRecord_employeeId_payrollPeriodId_key" ON "PayrollRecord"("employeeId", "payrollPeriodId");

-- CreateIndex
CREATE INDEX "PayrollAdjustment_payrollRecordId_idx" ON "PayrollAdjustment"("payrollRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryPayment_payrollRecordId_key" ON "SalaryPayment"("payrollRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryPayment_paymentNumber_key" ON "SalaryPayment"("paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryPayment_utrNumber_key" ON "SalaryPayment"("utrNumber");

-- CreateIndex
CREATE INDEX "SalaryPayment_paymentDate_idx" ON "SalaryPayment"("paymentDate");

-- CreateIndex
CREATE INDEX "PayrollStatusHistory_payrollRecordId_changedAt_idx" ON "PayrollStatusHistory"("payrollRecordId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalarySlip_payrollRecordId_key" ON "SalarySlip"("payrollRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "SalarySlip_slipNumber_key" ON "SalarySlip"("slipNumber");

-- CreateIndex
CREATE INDEX "SalarySlip_employeeId_salaryYear_salaryMonth_idx" ON "SalarySlip"("employeeId", "salaryYear", "salaryMonth");

-- AddForeignKey
ALTER TABLE "EmployeeSalaryStructure" ADD CONSTRAINT "EmployeeSalaryStructure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeMonthlyAttendanceSummary" ADD CONSTRAINT "EmployeeMonthlyAttendanceSummary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeMonthlyAttendanceSummary" ADD CONSTRAINT "EmployeeMonthlyAttendanceSummary_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_attendanceSummaryId_fkey" FOREIGN KEY ("attendanceSummaryId") REFERENCES "EmployeeMonthlyAttendanceSummary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdjustment" ADD CONSTRAINT "PayrollAdjustment_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalarySlip" ADD CONSTRAINT "SalarySlip_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalarySlip" ADD CONSTRAINT "SalarySlip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollStatusHistory" ADD CONSTRAINT "PayrollStatusHistory_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
