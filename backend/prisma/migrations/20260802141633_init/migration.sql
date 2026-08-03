-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CREDIT_HOLD');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ON_PROBATION', 'CONFIRMED', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'RETIRED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('SAVINGS', 'CURRENT', 'SALARY', 'OTHER');

-- CreateEnum
CREATE TYPE "EmployeeDocumentType" AS ENUM ('AADHAAR_CARD', 'PAN_CARD', 'BANK_PASSBOOK', 'CANCELLED_CHEQUE', 'RESUME', 'PASSPORT', 'DRIVING_LICENCE', 'EDUCATION_CERTIFICATE', 'EXPERIENCE_CERTIFICATE', 'APPOINTMENT_LETTER', 'SALARY_SLIP', 'POLICE_VERIFICATION', 'MEDICAL_CERTIFICATE', 'PHOTOGRAPH', 'SIGNATURE', 'OTHER');

-- CreateEnum
CREATE TYPE "EmployeeDocumentStatus" AS ENUM ('UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PayrollPeriodStatus" AS ENUM ('OPEN', 'ATTENDANCE_LOCKED', 'PAYROLL_PROCESSING', 'PAYROLL_COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'READY_FOR_SUBMISSION', 'PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'REJECTED', 'ON_HOLD', 'CORRECTION_REQUIRED', 'SENT_TO_FINANCE', 'PAYMENT_PROCESSING', 'SALARY_PAID', 'PAYMENT_FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollAdjustmentType" AS ENUM ('BONUS', 'INCENTIVE', 'OVERTIME', 'ARREARS', 'REIMBURSEMENT', 'OTHER_EARNING', 'LEAVE_DEDUCTION', 'LOAN_DEDUCTION', 'ADVANCE_DEDUCTION', 'TAX_DEDUCTION', 'OTHER_DEDUCTION');

-- CreateEnum
CREATE TYPE "SalaryPaymentMode" AS ENUM ('BANK_TRANSFER', 'NEFT', 'RTGS', 'IMPS', 'UPI', 'CHEQUE', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "SalesOrderStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'CONFIRMED', 'SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QcStatus" AS ENUM ('PENDING', 'PASSED', 'PARTIAL', 'FAILED', 'REWORK', 'APPROVED');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('PENDING_DISPATCH', 'DISPATCH_DRAFT', 'DISPATCH_APPROVED', 'READY_FOR_PICKUP', 'VEHICLE_ASSIGNED', 'LOADING_IN_PROGRESS', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'POD_RECEIVED', 'DISPATCH_CLOSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'REJECTED', 'RECEIVED', 'PARTIALLY_ALLOCATED', 'ALLOCATED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PICKUP_PENDING', 'PICKUP_ASSIGNED', 'IN_TRANSIT', 'GATE_RECEIVED', 'QC_PENDING', 'QC_COMPLETED', 'CREDIT_NOTE_PENDING', 'CREDIT_NOTE_ISSUED', 'REFUND_PENDING', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReplacementRequestStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReplacementOrderStatus" AS ENUM ('ORDER_CREATED', 'PRODUCTION_REQUIRED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'POD_CONFIRMED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'POSTED', 'PARTIALLY_PAID', 'PAID', 'VOID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'COLD_CALL', 'EXHIBITION', 'OTHER');

-- CreateEnum
CREATE TYPE "CreditReviewResult" AS ENUM ('PASSED', 'HOLD', 'REJECTED');

-- CreateEnum
CREATE TYPE "SalesAllocationType" AS ENUM ('FINISHED_GOODS_RESERVATION', 'PRODUCTION_REQUIRED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('DRAFT', 'PENDING_SUPER_ADMIN', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReturnReasonCode" AS ENUM ('DEFECTIVE', 'WRONG_ITEM', 'DAMAGE_IN_TRANSIT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReturnResolutionType" AS ENUM ('CREDIT_NOTE', 'REFUND', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "ReturnInspectionResult" AS ENUM ('GOOD', 'REWORKABLE', 'DEFECTIVE');

-- CreateEnum
CREATE TYPE "ReplacementReasonCode" AS ENUM ('DEFECTIVE', 'WRONG_ITEM', 'DAMAGE_IN_TRANSIT', 'OTHER');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('CREATED', 'PENDING_DISPATCH', 'DISPATCHED', 'DELIVERED', 'TESTING', 'APPROVED', 'REJECTED', 'RETURN_REQUIRED', 'RETURN_REQUESTED', 'RETURN_IN_TRANSIT', 'RETURNED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProcurementDeliveryStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaterialRejectionStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'REPLACEMENT_EXPECTED', 'REPLACEMENT_RECEIVED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RejectionResolutionType" AS ENUM ('REPLACED', 'CREDIT_NOTE', 'REFUND', 'WAIVED');

-- CreateEnum
CREATE TYPE "ProcurementReplacementStatus" AS ENUM ('PENDING_FINANCE', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProductionPlanStatus" AS ENUM ('PENDING_PLANNING', 'DRAFT', 'UNDER_REVIEW', 'APPROVED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('IN_PRODUCTION', 'QC_PENDING', 'QC_FAILED', 'REWORK_IN_PROGRESS', 'READY_FOR_DISPATCH', 'DISPATCHED');

-- CreateEnum
CREATE TYPE "QCResult" AS ENUM ('PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('CREATED', 'MATERIAL_PENDING', 'READY', 'CANCELLED', 'STARTED', 'PARTIALLY_COMPLETED', 'COMPLETED', 'QC_PENDING', 'QC_APPROVED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RecruitmentPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'CONTRACT', 'TEMPORARY', 'APPRENTICE', 'INTERN', 'TRAINEE', 'CONSULTANT', 'PART_TIME');

-- CreateEnum
CREATE TYPE "RecruitmentRequestStatus" AS ENUM ('DRAFT', 'OPEN', 'RETURNED_FOR_CORRECTION', 'HR_PROCESSING', 'CANDIDATES_SOURCED', 'INTERVIEWS_SCHEDULED', 'CANDIDATES_SELECTED', 'OFFER_IN_PROGRESS', 'PARTIALLY_FULFILLED', 'FULFILLED', 'ON_HOLD', 'REJECTED', 'WITHDRAWN', 'PENDING');

-- CreateEnum
CREATE TYPE "RecruitmentCandidateStatus" AS ENUM ('SOURCED', 'SCREENING', 'SHORTLISTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'JOINED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'RESCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InterviewResult" AS ENUM ('PENDING', 'SELECTED', 'REJECTED', 'NEXT_ROUND', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "BrandAnalysisRequestStatus" AS ENUM ('DRAFT', 'PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'SUPER_ADMIN_REJECTED', 'FINANCE_ANALYSIS_IN_PROGRESS', 'FINANCE_ANALYSIS_COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BrandAnalysisRecommendation" AS ENUM ('RECOMMENDED', 'NOT_RECOMMENDED', 'FURTHER_REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "TargetPeriod" AS ENUM ('Monthly', 'Quarterly', 'Yearly');

-- CreateEnum
CREATE TYPE "SalesTargetStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "DocumentSequence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdSequence" (
    "key" TEXT NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdSequence_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "alternatePhone" TEXT,
    "billingAddress" JSONB,
    "branchId" TEXT,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "creditLimit" DECIMAL(14,2),
    "creditDays" INTEGER,
    "email" TEXT,
    "gstin" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "pan" TEXT,
    "paymentTerms" INTEGER,
    "creditStatus" TEXT NOT NULL DEFAULT 'GOOD',
    "phone" TEXT,
    "shippingAddress" JSONB,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "leadNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "groupName" TEXT,
    "projectName" TEXT,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "gstName" TEXT,
    "gstNumber" TEXT,
    "address" JSONB,
    "source" "LeadSource",
    "productInterest" TEXT,
    "detailedItems" JSONB,
    "estimatedQuantity" DECIMAL(18,3),
    "unit" TEXT,
    "workflowStateId" TEXT,
    "assignedToId" TEXT,
    "customerId" TEXT,
    "convertedCustomerId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "convertedById" TEXT,
    "nextReminderAt" TIMESTAMP(3),
    "lostReason" TEXT,
    "remarks" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "companyId" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "companyId" TEXT,
    "branchId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseStatus" INTEGER NOT NULL,
    "responseBody" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "category" TEXT,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "minimumStock" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "reorderQuantity" DECIMAL(14,2),
    "reorderUnit" TEXT,
    "leadTimeDays" INTEGER,
    "preferredVendorId" TEXT,
    "isAutoReorderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "gstin" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialRequest" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "branchId" TEXT,
    "requestedById" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "workOrderNo" TEXT,
    "warehouse" TEXT,
    "priority" TEXT,
    "notes" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialRequestItem" (
    "id" TEXT NOT NULL,
    "materialRequestId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "approvedQuantity" DECIMAL(14,2),
    "issuedQuantity" DECIMAL(14,2),
    "receivedQuantity" DECIMAL(14,2),
    "consumedQuantity" DECIMAL(14,2),
    "returnedQuantity" DECIMAL(14,2),
    "unit" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "MaterialRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseIndent" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "indentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "department" TEXT,
    "warehouseId" TEXT,
    "requiredDate" TIMESTAMP(3),
    "priority" TEXT DEFAULT 'NORMAL',
    "businessReason" TEXT,
    "remarks" TEXT,
    "cancellationReason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseIndent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseIndentItem" (
    "id" TEXT NOT NULL,
    "purchaseIndentId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "approvedQuantity" DECIMAL(14,2),
    "estimatedUnitRate" DECIMAL(14,2),
    "lineRemarks" TEXT,
    "materialReqItemId" TEXT,

    CONSTRAINT "PurchaseIndentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseIndentStatusHistory" (
    "id" TEXT NOT NULL,
    "purchaseIndentId" TEXT NOT NULL,
    "oldStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "remarks" TEXT,
    "actorId" TEXT,
    "requestId" TEXT,
    "versionBefore" INTEGER,
    "versionAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseIndentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkLocation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "reportingManagerId" TEXT,
    "workLocationId" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "probationEndDate" TIMESTAMP(3),
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "workEmail" TEXT NOT NULL,
    "personalEmail" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "residentialAddress" TEXT NOT NULL,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "emergencyRelationship" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "aadhaarNumberEncrypted" TEXT NOT NULL,
    "aadhaarLastFour" TEXT NOT NULL,
    "aadhaarHash" TEXT NOT NULL,
    "uanNumber" TEXT,
    "esicNumber" TEXT,
    "bankName" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "bankAccountType" "BankAccountType" NOT NULL,
    "bankAccountEncrypted" TEXT NOT NULL,
    "bankAccountLastFour" TEXT NOT NULL,
    "bankAccountHash" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "branchName" TEXT,
    "baseSalary" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDraft" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "employeeData" JSONB NOT NULL,
    "completedEmployeeId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "documentType" "EmployeeDocumentType" NOT NULL,
    "documentName" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "description" TEXT,
    "expiryDate" TIMESTAMP(3),
    "status" "EmployeeDocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "rejectionReason" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT,

    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

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
    "availableToEmployee" BOOLEAN NOT NULL DEFAULT true,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalarySlip_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "companyId" TEXT,
    "workflowStateId" TEXT,
    "leadId" TEXT,
    "customerId" TEXT,
    "validUntil" TIMESTAMP(3),
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentQuotationId" TEXT,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(18,3) NOT NULL,
    "unitPrice" DECIMAL(18,2) NOT NULL,
    "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quotationId" TEXT,
    "sourceQuotationId" TEXT,
    "customerPurchaseOrderNo" TEXT,
    "customerPurchaseOrderDate" TIMESTAMP(3),
    "customerPurchaseOrderFileUrl" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedDeliveryDate" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "subtotal" DECIMAL(18,2) NOT NULL,
    "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(18,2) NOT NULL,
    "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "freightAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentTermsDays" INTEGER,
    "deliveryTerms" TEXT,
    "billingAddress" JSONB,
    "shippingAddress" JSONB,
    "remarks" TEXT,
    "workflowStateId" TEXT,
    "status" "SalesOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productNameSnapshot" TEXT NOT NULL,
    "productCodeSnapshot" TEXT,
    "specifications" JSONB,
    "orderedQuantity" DECIMAL(18,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(18,2) NOT NULL,
    "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(18,2) NOT NULL,
    "taxRate" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderCreditReview" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "outstandingAmount" DECIMAL(18,2) NOT NULL,
    "approvedCreditLimit" DECIMAL(18,2) NOT NULL,
    "availableCredit" DECIMAL(18,2) NOT NULL,
    "paymentTermsDays" INTEGER,
    "result" "CreditReviewResult" NOT NULL,
    "reviewedById" TEXT,
    "approvedById" TEXT,
    "approvalRemarks" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "SalesOrderCreditReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderAllocation" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "salesOrderItemId" TEXT NOT NULL,
    "allocationType" "SalesAllocationType" NOT NULL,
    "requiredQuantity" DECIMAL(18,3) NOT NULL,
    "reservedQuantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "productionQuantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "workOrderId" TEXT,
    "inventoryBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrderAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerComplaint" (
    "id" TEXT NOT NULL,
    "complaintNo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "complaintType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "complaintDate" TIMESTAMP(3) NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "salesRemarks" TEXT,
    "attachment" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'DRAFT',
    "adminRemarks" TEXT,
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturn" (
    "id" TEXT NOT NULL,
    "returnNumber" TEXT NOT NULL,
    "rmaNumber" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "complaintId" TEXT,
    "reasonCode" "ReturnReasonCode" NOT NULL,
    "customerRemarks" TEXT,
    "internalRemarks" TEXT,
    "pickupRequired" BOOLEAN NOT NULL DEFAULT true,
    "pickupAddress" JSONB,
    "resolutionType" "ReturnResolutionType" NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "dispatchDetails" JSONB,
    "deliveryProof" JSONB,
    "workflowStateId" TEXT,
    "requestedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "approvedById" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnItem" (
    "id" TEXT NOT NULL,
    "salesReturnId" TEXT NOT NULL,
    "salesOrderItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "deliveredQuantity" DECIMAL(18,3) NOT NULL,
    "previouslyReturnedQty" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "requestedQuantity" DECIMAL(18,3) NOT NULL,
    "approvedQuantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "receivedQuantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "goodQuantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "defectiveQuantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "scrapQuantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "reworkQuantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "conditionReported" TEXT,
    "reason" TEXT NOT NULL,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnQcInspection" (
    "id" TEXT NOT NULL,
    "salesReturnId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectionResult" "ReturnInspectionResult" NOT NULL,
    "inspectionNotes" TEXT,
    "inspectionEvidence" JSONB,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnQcInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnQcInspectionItem" (
    "id" TEXT NOT NULL,
    "returnQcInspectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnQcInspectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "complaintId" TEXT,
    "salesOrderId" TEXT NOT NULL,
    "returnId" TEXT,
    "workflowStateId" TEXT,
    "reasonCode" "ReplacementReasonCode" NOT NULL,
    "status" "ReplacementRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "dispatchStatus" "ReplacementOrderStatus",
    "dispatchDetails" JSONB,
    "deliveryProof" JSONB,
    "completedAt" TIMESTAMP(3),
    "customerRemarks" TEXT,
    "internalRemarks" TEXT,
    "evidence" JSONB,
    "requestedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "approvedById" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "ReplacementRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementRequestItem" (
    "id" TEXT NOT NULL,
    "replacementRequestId" TEXT NOT NULL,
    "salesOrderItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "requestedQuantity" DECIMAL(18,3) NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReplacementRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementOrder" (
    "id" TEXT NOT NULL,
    "replacementOrderNo" TEXT NOT NULL,
    "originalSalesOrderId" TEXT NOT NULL,
    "replacementRequestId" TEXT NOT NULL,
    "commercialValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "workflowStateId" TEXT,
    "status" "ReplacementOrderStatus" NOT NULL DEFAULT 'ORDER_CREATED',
    "deliveryAddress" JSONB,
    "remarks" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "ReplacementOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementOrderItem" (
    "id" TEXT NOT NULL,
    "replacementOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReplacementOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderHistory" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesOrderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "dispatchId" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "workflowStateId" TEXT,
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "freightAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "roundingAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPaymentAllocation" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerPaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnGateEntry" (
    "id" TEXT NOT NULL,
    "salesReturnId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnGateEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditNote" (
    "id" TEXT NOT NULL,
    "salesReturnId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementOrderHistory" (
    "id" TEXT NOT NULL,
    "replacementOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReplacementOrderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegacyMigrationReference" (
    "id" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "legacyId" TEXT NOT NULL,
    "newEntityId" TEXT NOT NULL,
    "checksum" TEXT,
    "migratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegacyMigrationReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleRequest" (
    "id" TEXT NOT NULL,
    "sampleNumber" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "status" "SampleStatus" NOT NULL DEFAULT 'CREATED',
    "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3),
    "testingDeadline" TIMESTAMP(3),
    "returnDeadline" TIMESTAMP(3),
    "dispatchDate" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "returnRequestedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "proofOfDelivery" TEXT,
    "transportMode" TEXT,
    "vehicleNo" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "lrNo" TEXT,
    "transportCost" DECIMAL(14,2),
    "customerFeedback" TEXT,
    "sampleResult" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SampleRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleItem" (
    "id" TEXT NOT NULL,
    "sampleRequestId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "specifications" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SampleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleHistory" (
    "id" TEXT NOT NULL,
    "sampleRequestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SampleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseIndentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "poNumber" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "freight" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "otherCharges" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "paymentTerms" TEXT,
    "expectedDeliveryDate" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "issuedById" TEXT,
    "snapshot" JSONB,
    "workflowStateId" TEXT,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gstPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "receivedQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "acceptedQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderStatusHistory" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "oldStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "remarks" TEXT,
    "actorId" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceiptNote" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "grnNumber" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedById" TEXT,
    "snapshot" JSONB,
    "inventoryPostedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoodsReceiptNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceiptNoteItem" (
    "id" TEXT NOT NULL,
    "goodsReceiptNoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "acceptedQuantity" DECIMAL(14,2) NOT NULL,
    "rejectedQuantity" DECIMAL(14,2) NOT NULL,
    "receivedQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "inspectionRemarks" TEXT,

    CONSTRAINT "GoodsReceiptNoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GRNStatusHistory" (
    "id" TEXT NOT NULL,
    "goodsReceiptNoteId" TEXT NOT NULL,
    "oldStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "remarks" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GRNStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementDelivery" (
    "id" TEXT NOT NULL,
    "deliveryNumber" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "grnId" TEXT,
    "status" "ProcurementDeliveryStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "expectedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "invoiceNumber" TEXT,
    "deliveryChallanNo" TEXT,
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcurementDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementDeliveryItem" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "purchaseOrderItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "deliveredQuantity" DECIMAL(14,2) NOT NULL,
    "acceptedQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "rejectedQuantity" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "remainingQuantity" DECIMAL(14,2) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcurementDeliveryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialRejection" (
    "id" TEXT NOT NULL,
    "rejectionNumber" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "invoiceNumber" TEXT,
    "status" "MaterialRejectionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "financeRemarks" TEXT,
    "expectedResolutionDate" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionType" "RejectionResolutionType",
    "createdById" TEXT,
    "decidedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialRejection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialRejectionItem" (
    "id" TEXT NOT NULL,
    "materialRejectionId" TEXT NOT NULL,
    "purchaseOrderItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialRejectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementReplacementRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "replacementDeliveryId" TEXT,
    "materialRejectionId" TEXT,
    "invoiceNumber" TEXT,
    "status" "ProcurementReplacementStatus" NOT NULL DEFAULT 'PENDING_FINANCE',
    "expectedDeliveryDate" TIMESTAMP(3),
    "financeRemarks" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "decidedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcurementReplacementRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementReplacementItem" (
    "id" TEXT NOT NULL,
    "replacementRequestId" TEXT NOT NULL,
    "purchaseOrderItemId" TEXT NOT NULL,
    "materialRejectionItemId" TEXT,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcurementReplacementItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSupplier" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "leadTimeDays" INTEGER,
    "lastPrice" DECIMAL(14,2),
    "minimumOrderQty" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "matchResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorInvoiceItem" (
    "id" TEXT NOT NULL,
    "vendorInvoiceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "unitRate" DECIMAL(14,2) NOT NULL,
    "gstPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "VendorInvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorPayment" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "paymentDate" TIMESTAMP(3),
    "transactionId" TEXT,
    "paidAmount" DECIMAL(14,2) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorPaymentAllocation" (
    "id" TEXT NOT NULL,
    "vendorPaymentId" TEXT NOT NULL,
    "vendorInvoiceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "VendorPaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorReturn" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorReturnItem" (
    "id" TEXT NOT NULL,
    "vendorReturnId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "VendorReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierPayable" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierPayable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowState" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "isInitial" BOOLEAN NOT NULL DEFAULT false,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkflowState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTransition" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "fromStateId" TEXT NOT NULL,
    "toStateId" TEXT NOT NULL,
    "actionName" TEXT NOT NULL,
    "actionLabel" TEXT NOT NULL,
    "requiredRole" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "allowReject" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkflowTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowHistory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "remarks" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowHistoryLegacy" (
    "id" TEXT NOT NULL,
    "workflowCode" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "fromState" TEXT NOT NULL,
    "toState" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "remarks" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowHistoryLegacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "notes" TEXT,
    "reminderAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionPlan" (
    "id" TEXT NOT NULL,
    "planNumber" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "status" "ProductionPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "plannedStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "productionLine" TEXT,
    "workflowStateId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "workOrderNumber" TEXT NOT NULL,
    "productionPlanId" TEXT NOT NULL,
    "salesOrderItemId" TEXT,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'CREATED',
    "quantity" DECIMAL(18,3) NOT NULL,
    "workflowStateId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "startedById" TEXT,
    "completedById" TEXT,
    "sentToDispatchAt" TIMESTAMP(3),
    "sentToDispatchById" TEXT,
    "dispatchedAt" TIMESTAMP(3),
    "dispatchedById" TEXT,
    "createdById" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productionStatus" "ProductionStatus" NOT NULL DEFAULT 'IN_PRODUCTION',
    "qcResult" "QCResult",
    "qcRemarks" TEXT,
    "failureReason" TEXT,
    "reworkCount" INTEGER NOT NULL DEFAULT 0,
    "qcCheckedById" TEXT,
    "productionStartTime" TIMESTAMP(3),
    "productionEndTime" TIMESTAMP(3),
    "qcTimestamp" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionStatusHistory" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "fromStatus" "ProductionStatus",
    "toStatus" "ProductionStatus" NOT NULL,
    "remarks" TEXT,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBatch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCInspection" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "status" "QcStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "workflowStateId" TEXT,
    "approvedQuantity" DECIMAL(18,3),
    "rejectedQuantity" DECIMAL(18,3),
    "remarks" TEXT,
    "approvedAt" TIMESTAMP(3),
    "inspectorId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QCInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispatch" (
    "id" TEXT NOT NULL,
    "dispatchNo" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "status" "DispatchStatus" NOT NULL DEFAULT 'DISPATCH_DRAFT',
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "deliveryAddress" TEXT,
    "specialInstructions" TEXT,
    "packageCount" INTEGER,
    "packageType" TEXT,
    "totalWeight" DECIMAL(18,3),
    "transporterName" TEXT,
    "vehicleNumber" TEXT,
    "vehicleType" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "driverLicence" TEXT,
    "lrNumber" TEXT,
    "freightType" TEXT,
    "freightAmount" DECIMAL(18,2),
    "trackingRef" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "rejectionRemarks" TEXT,
    "readyAt" TIMESTAMP(3),
    "readyById" TEXT,
    "dispatchLocation" TEXT,
    "documentChecklist" JSONB,
    "loadingStartedAt" TIMESTAMP(3),
    "loadingCompletedAt" TIMESTAMP(3),
    "loadedQuantity" DECIMAL(18,3),
    "vehicleClean" BOOLEAN DEFAULT true,
    "sealNumber" TEXT,
    "loadingSupervisor" TEXT,
    "loadingRemarks" TEXT,
    "dispatchedAt" TIMESTAMP(3),
    "dispatchedById" TEXT,
    "gateOutAt" TIMESTAMP(3),
    "gatePassNumber" TEXT,
    "gateSecurityConfirmed" BOOLEAN DEFAULT false,
    "invoiceNumber" TEXT,
    "ewayBillNumber" TEXT,
    "currentLocation" TEXT,
    "lastLocationUpdateAt" TIMESTAMP(3),
    "eta" TIMESTAMP(3),
    "transitCondition" TEXT,
    "transitRemarks" TEXT,
    "transitLogs" JSONB,
    "outForDeliveryAt" TIMESTAMP(3),
    "deliveryContactPerson" TEXT,
    "deliveryContactPhone" TEXT,
    "expectedDeliveryTime" TIMESTAMP(3),
    "deliveryAttemptNo" INTEGER DEFAULT 1,
    "deliveredAt" TIMESTAMP(3),
    "deliveredQuantity" DECIMAL(18,3),
    "shortQuantity" DECIMAL(18,3),
    "damagedQuantity" DECIMAL(18,3),
    "receivedBy" TEXT,
    "receiverDesignation" TEXT,
    "receiverPhone" TEXT,
    "deliveryRemarks" TEXT,
    "deliveryPhotoUrl" TEXT,
    "signatureUrl" TEXT,
    "podUrl" TEXT,
    "podReceivedAt" TIMESTAMP(3),
    "podApprovedAt" TIMESTAMP(3),
    "podApprovedById" TEXT,
    "podStatus" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "transitDuration" INTEGER,
    "deliveryLatitude" DECIMAL(65,30),
    "deliveryLongitude" DECIMAL(65,30),
    "deliveredById" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "workflowStateId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchItem" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "salesOrderItemId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "salesOrderItemId" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "unitPrice" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPayment" (
    "id" TEXT NOT NULL,
    "paymentNo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesOrderId" TEXT,
    "proofUrl" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "workflowStateId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerLedger" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "debit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "reversalOfId" TEXT,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderAmendment" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "amendmentNo" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "role" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "rejectedById" TEXT,
    "remarks" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "indentNumber" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "vacancies" INTEGER NOT NULL,
    "priority" "RecruitmentPriority" NOT NULL,
    "employmentType" "EmploymentType",
    "requiredExperience" TEXT,
    "requiredSkills" TEXT,
    "reasonForHiring" TEXT NOT NULL,
    "jobDescription" TEXT,
    "requiredByDate" TIMESTAMP(3),
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "requestedByRole" TEXT NOT NULL,
    "assignedHrUserId" TEXT,
    "assignedHrUserName" TEXT,
    "positionsFilled" INTEGER NOT NULL DEFAULT 0,
    "status" "RecruitmentRequestStatus" NOT NULL DEFAULT 'OPEN',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingStartedAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "hrRemarks" TEXT,
    "rejectionReason" TEXT,
    "correctionReason" TEXT,
    "rejectedBy" TEXT,
    "fulfilledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RecruitmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentCandidate" (
    "id" TEXT NOT NULL,
    "candidateNumber" TEXT NOT NULL,
    "recruitmentRequestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "experience" TEXT,
    "currentCompany" TEXT,
    "expectedSalary" DECIMAL(14,2),
    "resumeUrl" TEXT,
    "source" TEXT,
    "status" "RecruitmentCandidateStatus" NOT NULL DEFAULT 'SOURCED',
    "remarks" TEXT,
    "selectedAt" TIMESTAMP(3),
    "joiningDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentInterview" (
    "id" TEXT NOT NULL,
    "recruitmentRequestId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "interviewDate" TIMESTAMP(3) NOT NULL,
    "interviewMode" TEXT NOT NULL,
    "interviewLocation" TEXT,
    "meetingLink" TEXT,
    "interviewRound" TEXT,
    "panelMembers" JSONB,
    "instructions" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "feedback" TEXT,
    "rating" INTEGER,
    "result" "InterviewResult",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentRequestTimeline" (
    "id" TEXT NOT NULL,
    "recruitmentRequestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" "RecruitmentRequestStatus",
    "toStatus" "RecruitmentRequestStatus",
    "performedById" TEXT NOT NULL,
    "performedByName" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "remarks" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitmentRequestTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_analysis_requests" (
    "id" TEXT NOT NULL,
    "requestNo" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageOriginalName" TEXT,
    "reason" TEXT NOT NULL,
    "orderDetails" TEXT,
    "requiredByDate" TIMESTAMP(3),
    "remarks" TEXT,
    "status" "BrandAnalysisRequestStatus" NOT NULL DEFAULT 'PENDING_SUPER_ADMIN_APPROVAL',
    "version" INTEGER NOT NULL DEFAULT 1,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalRemarks" TEXT,
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "financeStartedById" TEXT,
    "financeStartedAt" TIMESTAMP(3),
    "financeInitialRemarks" TEXT,
    "financeCompletedById" TEXT,
    "financeCompletedAt" TIMESTAMP(3),
    "analysisResult" TEXT,
    "recommendedBrand" TEXT,
    "estimatedUnitCost" DECIMAL(18,2),
    "estimatedTotalCost" DECIMAL(18,2),
    "supplierName" TEXT,
    "financeRemarks" TEXT,
    "analysisDocumentUrl" TEXT,
    "recommendation" "BrandAnalysisRecommendation",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_analysis_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_analysis_history" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fromStatus" "BrandAnalysisRequestStatus",
    "toStatus" "BrandAnalysisRequestStatus" NOT NULL,
    "action" TEXT NOT NULL,
    "remarks" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_analysis_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesTarget" (
    "id" TEXT NOT NULL,
    "salespersonId" TEXT NOT NULL,
    "targetPeriod" "TargetPeriod" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "revenueTarget" DECIMAL(15,2) NOT NULL,
    "remarks" TEXT,
    "status" "SalesTargetStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionTestingRecord" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL DEFAULT 'COMP-001',
    "referenceNo" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "remarks" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionTestingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionShiftEntry" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,
    "targetQty" DECIMAL(18,3) NOT NULL,
    "producedQty" DECIMAL(18,3) NOT NULL,
    "rejectedQty" DECIMAL(18,3) NOT NULL,
    "reworkQty" DECIMAL(18,3) NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionShiftEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionScrapEntry" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,
    "scrapQty" DECIMAL(18,3) NOT NULL,
    "wastageQty" DECIMAL(18,3) NOT NULL,
    "category" TEXT NOT NULL,
    "remarks" TEXT,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionScrapEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishedGoods" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "salesOrderId" TEXT,
    "quantity" DECIMAL(65,30) NOT NULL,
    "availableQuantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedById" TEXT,

    CONSTRAINT "FinishedGoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElevationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElevationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentSequence_companyId_documentType_idx" ON "DocumentSequence"("companyId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSequence_companyId_documentType_year_key" ON "DocumentSequence"("companyId", "documentType", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Company_publicId_key" ON "Company"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_publicId_key" ON "Branch"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_publicId_key" ON "Role"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_publicId_key" ON "Permission"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "Customer"("customerCode");

-- CreateIndex
CREATE INDEX "Customer_companyId_status_idx" ON "Customer"("companyId", "status");

-- CreateIndex
CREATE INDEX "Customer_companyId_companyName_idx" ON "Customer"("companyId", "companyName");

-- CreateIndex
CREATE INDEX "Customer_companyId_email_idx" ON "Customer"("companyId", "email");

-- CreateIndex
CREATE INDEX "Customer_companyId_phone_idx" ON "Customer"("companyId", "phone");

-- CreateIndex
CREATE INDEX "Customer_companyId_gstin_idx" ON "Customer"("companyId", "gstin");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_companyId_gstin_key" ON "Customer"("companyId", "gstin");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_leadNumber_key" ON "Lead"("leadNumber");

-- CreateIndex
CREATE INDEX "Lead_workflowStateId_idx" ON "Lead"("workflowStateId");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");

-- CreateIndex
CREATE INDEX "Lead_companyName_idx" ON "Lead"("companyName");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_userId_key_key" ON "IdempotencyRecord"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Product_publicId_key" ON "Product"("publicId");

-- CreateIndex
CREATE INDEX "Product_companyId_minimumStock_idx" ON "Product"("companyId", "minimumStock");

-- CreateIndex
CREATE INDEX "Product_preferredVendorId_idx" ON "Product"("preferredVendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_publicId_key" ON "Supplier"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialRequest_publicId_key" ON "MaterialRequest"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseIndent_publicId_key" ON "PurchaseIndent"("publicId");

-- CreateIndex
CREATE INDEX "PurchaseIndent_status_idx" ON "PurchaseIndent"("status");

-- CreateIndex
CREATE INDEX "PurchaseIndent_requiredDate_idx" ON "PurchaseIndent"("requiredDate");

-- CreateIndex
CREATE INDEX "PurchaseIndentStatusHistory_purchaseIndentId_createdAt_idx" ON "PurchaseIndentStatusHistory"("purchaseIndentId", "createdAt");

-- CreateIndex
CREATE INDEX "Department_companyId_isActive_idx" ON "Department"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Department_companyId_code_key" ON "Department"("companyId", "code");

-- CreateIndex
CREATE INDEX "WorkLocation_companyId_isActive_idx" ON "WorkLocation"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WorkLocation_companyId_code_key" ON "WorkLocation"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_publicId_key" ON "Employee"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_workEmail_key" ON "Employee"("workEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_panNumber_key" ON "Employee"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_aadhaarHash_key" ON "Employee"("aadhaarHash");

-- CreateIndex
CREATE INDEX "Employee_companyId_status_idx" ON "Employee"("companyId", "status");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- CreateIndex
CREATE INDEX "Employee_workLocationId_idx" ON "Employee"("workLocationId");

-- CreateIndex
CREATE INDEX "Employee_reportingManagerId_idx" ON "Employee"("reportingManagerId");

-- CreateIndex
CREATE INDEX "Employee_fullName_idx" ON "Employee"("fullName");

-- CreateIndex
CREATE INDEX "Employee_phoneNumber_idx" ON "Employee"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeDraft_completedEmployeeId_key" ON "EmployeeDraft"("completedEmployeeId");

-- CreateIndex
CREATE INDEX "EmployeeDraft_companyId_createdById_idx" ON "EmployeeDraft"("companyId", "createdById");

-- CreateIndex
CREATE INDEX "EmployeeDocument_employeeId_idx" ON "EmployeeDocument"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeDocument_documentType_idx" ON "EmployeeDocument"("documentType");

-- CreateIndex
CREATE INDEX "EmployeeDocument_status_idx" ON "EmployeeDocument"("status");

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
CREATE UNIQUE INDEX "SalarySlip_payrollRecordId_key" ON "SalarySlip"("payrollRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "SalarySlip_slipNumber_key" ON "SalarySlip"("slipNumber");

-- CreateIndex
CREATE INDEX "SalarySlip_employeeId_salaryYear_salaryMonth_idx" ON "SalarySlip"("employeeId", "salaryYear", "salaryMonth");

-- CreateIndex
CREATE UNIQUE INDEX "SalarySlipShare_tokenHash_key" ON "SalarySlipShare"("tokenHash");

-- CreateIndex
CREATE INDEX "SalarySlipShare_salarySlipId_idx" ON "SalarySlipShare"("salarySlipId");

-- CreateIndex
CREATE INDEX "SalarySlipShare_expiresAt_idx" ON "SalarySlipShare"("expiresAt");

-- CreateIndex
CREATE INDEX "PayrollStatusHistory_payrollRecordId_changedAt_idx" ON "PayrollStatusHistory"("payrollRecordId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");

-- CreateIndex
CREATE INDEX "Quotation_workflowStateId_idx" ON "Quotation"("workflowStateId");

-- CreateIndex
CREATE INDEX "Quotation_leadId_idx" ON "Quotation"("leadId");

-- CreateIndex
CREATE INDEX "Quotation_customerId_idx" ON "Quotation"("customerId");

-- CreateIndex
CREATE INDEX "Quotation_parentQuotationId_idx" ON "Quotation"("parentQuotationId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_orderNumber_key" ON "SalesOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_quotationId_key" ON "SalesOrder"("quotationId");

-- CreateIndex
CREATE INDEX "SalesOrder_customerId_idx" ON "SalesOrder"("customerId");

-- CreateIndex
CREATE INDEX "SalesOrder_status_idx" ON "SalesOrder"("status");

-- CreateIndex
CREATE INDEX "SalesOrder_workflowStateId_idx" ON "SalesOrder"("workflowStateId");

-- CreateIndex
CREATE INDEX "SalesOrder_createdAt_idx" ON "SalesOrder"("createdAt");

-- CreateIndex
CREATE INDEX "SalesOrderItem_salesOrderId_idx" ON "SalesOrderItem"("salesOrderId");

-- CreateIndex
CREATE INDEX "SalesOrderItem_productId_idx" ON "SalesOrderItem"("productId");

-- CreateIndex
CREATE INDEX "SalesOrderCreditReview_salesOrderId_idx" ON "SalesOrderCreditReview"("salesOrderId");

-- CreateIndex
CREATE INDEX "SalesOrderAllocation_salesOrderId_idx" ON "SalesOrderAllocation"("salesOrderId");

-- CreateIndex
CREATE INDEX "SalesOrderAllocation_salesOrderItemId_idx" ON "SalesOrderAllocation"("salesOrderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerComplaint_complaintNo_key" ON "CustomerComplaint"("complaintNo");

-- CreateIndex
CREATE INDEX "CustomerComplaint_customerId_idx" ON "CustomerComplaint"("customerId");

-- CreateIndex
CREATE INDEX "CustomerComplaint_productId_idx" ON "CustomerComplaint"("productId");

-- CreateIndex
CREATE INDEX "CustomerComplaint_status_idx" ON "CustomerComplaint"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SalesReturn_returnNumber_key" ON "SalesReturn"("returnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SalesReturn_rmaNumber_key" ON "SalesReturn"("rmaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SalesReturn_complaintId_key" ON "SalesReturn"("complaintId");

-- CreateIndex
CREATE INDEX "SalesReturn_salesOrderId_idx" ON "SalesReturn"("salesOrderId");

-- CreateIndex
CREATE INDEX "SalesReturn_workflowStateId_idx" ON "SalesReturn"("workflowStateId");

-- CreateIndex
CREATE INDEX "SalesReturnItem_salesReturnId_idx" ON "SalesReturnItem"("salesReturnId");

-- CreateIndex
CREATE INDEX "SalesReturnItem_salesOrderItemId_idx" ON "SalesReturnItem"("salesOrderItemId");

-- CreateIndex
CREATE INDEX "ReturnQcInspection_salesReturnId_idx" ON "ReturnQcInspection"("salesReturnId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementRequest_requestNumber_key" ON "ReplacementRequest"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementRequest_complaintId_key" ON "ReplacementRequest"("complaintId");

-- CreateIndex
CREATE INDEX "ReplacementRequest_salesOrderId_idx" ON "ReplacementRequest"("salesOrderId");

-- CreateIndex
CREATE INDEX "ReplacementRequest_workflowStateId_idx" ON "ReplacementRequest"("workflowStateId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementOrder_replacementOrderNo_key" ON "ReplacementOrder"("replacementOrderNo");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementOrder_replacementRequestId_key" ON "ReplacementOrder"("replacementRequestId");

-- CreateIndex
CREATE INDEX "ReplacementOrder_originalSalesOrderId_idx" ON "ReplacementOrder"("originalSalesOrderId");

-- CreateIndex
CREATE INDEX "ReplacementOrder_workflowStateId_idx" ON "ReplacementOrder"("workflowStateId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesInvoice_invoiceNumber_key" ON "SalesInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "SalesInvoice_workflowStateId_idx" ON "SalesInvoice"("workflowStateId");

-- CreateIndex
CREATE INDEX "LegacyMigrationReference_newEntityId_idx" ON "LegacyMigrationReference"("newEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyMigrationReference_sourceSystem_entityType_legacyId_key" ON "LegacyMigrationReference"("sourceSystem", "entityType", "legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "SampleRequest_sampleNumber_key" ON "SampleRequest"("sampleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_publicId_key" ON "PurchaseOrder"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_purchaseIndentId_key" ON "PurchaseOrder"("purchaseIndentId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrderStatusHistory_purchaseOrderId_createdAt_idx" ON "PurchaseOrderStatusHistory"("purchaseOrderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsReceiptNote_publicId_key" ON "GoodsReceiptNote"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsReceiptNote_grnNumber_key" ON "GoodsReceiptNote"("grnNumber");

-- CreateIndex
CREATE INDEX "GoodsReceiptNote_status_idx" ON "GoodsReceiptNote"("status");

-- CreateIndex
CREATE INDEX "GRNStatusHistory_goodsReceiptNoteId_createdAt_idx" ON "GRNStatusHistory"("goodsReceiptNoteId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcurementDelivery_deliveryNumber_key" ON "ProcurementDelivery"("deliveryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProcurementDelivery_grnId_key" ON "ProcurementDelivery"("grnId");

-- CreateIndex
CREATE INDEX "ProcurementDelivery_companyId_status_idx" ON "ProcurementDelivery"("companyId", "status");

-- CreateIndex
CREATE INDEX "ProcurementDelivery_purchaseOrderId_actualDeliveryDate_idx" ON "ProcurementDelivery"("purchaseOrderId", "actualDeliveryDate");

-- CreateIndex
CREATE INDEX "ProcurementDelivery_supplierId_idx" ON "ProcurementDelivery"("supplierId");

-- CreateIndex
CREATE INDEX "ProcurementDeliveryItem_productId_idx" ON "ProcurementDeliveryItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcurementDeliveryItem_deliveryId_purchaseOrderItemId_key" ON "ProcurementDeliveryItem"("deliveryId", "purchaseOrderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialRejection_rejectionNumber_key" ON "MaterialRejection"("rejectionNumber");

-- CreateIndex
CREATE INDEX "MaterialRejection_companyId_status_idx" ON "MaterialRejection"("companyId", "status");

-- CreateIndex
CREATE INDEX "MaterialRejection_purchaseOrderId_idx" ON "MaterialRejection"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "MaterialRejection_deliveryId_idx" ON "MaterialRejection"("deliveryId");

-- CreateIndex
CREATE INDEX "MaterialRejectionItem_productId_idx" ON "MaterialRejectionItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcurementReplacementRequest_requestNumber_key" ON "ProcurementReplacementRequest"("requestNumber");

-- CreateIndex
CREATE INDEX "ProcurementReplacementRequest_companyId_status_idx" ON "ProcurementReplacementRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "ProcurementReplacementRequest_purchaseOrderId_idx" ON "ProcurementReplacementRequest"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "ProcurementReplacementRequest_materialRejectionId_idx" ON "ProcurementReplacementRequest"("materialRejectionId");

-- CreateIndex
CREATE INDEX "ProcurementReplacementRequest_replacementDeliveryId_idx" ON "ProcurementReplacementRequest"("replacementDeliveryId");

-- CreateIndex
CREATE INDEX "ProcurementReplacementItem_productId_idx" ON "ProcurementReplacementItem"("productId");

-- CreateIndex
CREATE INDEX "ProcurementReplacementItem_materialRejectionItemId_idx" ON "ProcurementReplacementItem"("materialRejectionItemId");

-- CreateIndex
CREATE INDEX "ProductSupplier_supplierId_isPreferred_idx" ON "ProductSupplier"("supplierId", "isPreferred");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSupplier_productId_supplierId_key" ON "ProductSupplier"("productId", "supplierId");

-- CreateIndex
CREATE INDEX "VendorInvoice_status_dueDate_idx" ON "VendorInvoice"("status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "VendorInvoice_supplierId_invoiceNumber_key" ON "VendorInvoice"("supplierId", "invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VendorPayment_paymentNumber_key" ON "VendorPayment"("paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VendorPayment_transactionId_key" ON "VendorPayment"("transactionId");

-- CreateIndex
CREATE INDEX "VendorPayment_status_idx" ON "VendorPayment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VendorPaymentAllocation_vendorPaymentId_vendorInvoiceId_key" ON "VendorPaymentAllocation"("vendorPaymentId", "vendorInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorReturn_publicId_key" ON "VendorReturn"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_code_key" ON "WorkflowDefinition"("code");

-- CreateIndex
CREATE INDEX "WorkflowHistory_entityType_entityId_idx" ON "WorkflowHistory"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "WorkflowHistory_companyId_idx" ON "WorkflowHistory"("companyId");

-- CreateIndex
CREATE INDEX "WorkflowHistory_userId_idx" ON "WorkflowHistory"("userId");

-- CreateIndex
CREATE INDEX "WorkflowHistory_createdAt_idx" ON "WorkflowHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionPlan_planNumber_key" ON "ProductionPlan"("planNumber");

-- CreateIndex
CREATE INDEX "ProductionPlan_salesOrderId_idx" ON "ProductionPlan"("salesOrderId");

-- CreateIndex
CREATE INDEX "ProductionPlan_assignedToId_idx" ON "ProductionPlan"("assignedToId");

-- CreateIndex
CREATE INDEX "ProductionPlan_workflowStateId_idx" ON "ProductionPlan"("workflowStateId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_workOrderNumber_key" ON "WorkOrder"("workOrderNumber");

-- CreateIndex
CREATE INDEX "WorkOrder_workflowStateId_idx" ON "WorkOrder"("workflowStateId");

-- CreateIndex
CREATE INDEX "WorkOrder_salesOrderItemId_idx" ON "WorkOrder"("salesOrderItemId");

-- CreateIndex
CREATE INDEX "WorkOrder_productionStatus_idx" ON "WorkOrder"("productionStatus");

-- CreateIndex
CREATE INDEX "ProductionStatusHistory_workOrderId_changedAt_idx" ON "ProductionStatusHistory"("workOrderId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionBatch_batchNumber_key" ON "ProductionBatch"("batchNumber");

-- CreateIndex
CREATE INDEX "QCInspection_workflowStateId_idx" ON "QCInspection"("workflowStateId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispatch_dispatchNo_key" ON "Dispatch"("dispatchNo");

-- CreateIndex
CREATE INDEX "Dispatch_workflowStateId_idx" ON "Dispatch"("workflowStateId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPayment_paymentNo_key" ON "CustomerPayment"("paymentNo");

-- CreateIndex
CREATE INDEX "CustomerPayment_workflowStateId_idx" ON "CustomerPayment"("workflowStateId");

-- CreateIndex
CREATE INDEX "CustomerPayment_salesOrderId_idx" ON "CustomerPayment"("salesOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_invoiceId_key" ON "PaymentAllocation"("paymentId", "invoiceId");

-- CreateIndex
CREATE INDEX "CustomerLedger_customerId_idx" ON "CustomerLedger"("customerId");

-- CreateIndex
CREATE INDEX "CustomerLedger_createdAt_idx" ON "CustomerLedger"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderAmendment_amendmentNo_key" ON "OrderAmendment"("amendmentNo");

-- CreateIndex
CREATE INDEX "Approval_entityType_entityId_idx" ON "Approval"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Approval_companyId_status_idx" ON "Approval"("companyId", "status");

-- CreateIndex
CREATE INDEX "Approval_approvedById_idx" ON "Approval"("approvedById");

-- CreateIndex
CREATE INDEX "Attachment_entityType_entityId_idx" ON "Attachment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Attachment_companyId_idx" ON "Attachment"("companyId");

-- CreateIndex
CREATE INDEX "Attachment_uploadedById_idx" ON "Attachment"("uploadedById");

-- CreateIndex
CREATE INDEX "Comment_entityType_entityId_idx" ON "Comment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Comment_companyId_idx" ON "Comment"("companyId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_companyId_idx" ON "Notification"("companyId");

-- CreateIndex
CREATE INDEX "Notification_entityType_entityId_idx" ON "Notification"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentRequest_indentNumber_key" ON "RecruitmentRequest"("indentNumber");

-- CreateIndex
CREATE INDEX "RecruitmentRequest_companyId_status_idx" ON "RecruitmentRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "RecruitmentRequest_department_idx" ON "RecruitmentRequest"("department");

-- CreateIndex
CREATE INDEX "RecruitmentRequest_requestedById_idx" ON "RecruitmentRequest"("requestedById");

-- CreateIndex
CREATE INDEX "RecruitmentRequest_assignedHrUserId_idx" ON "RecruitmentRequest"("assignedHrUserId");

-- CreateIndex
CREATE INDEX "RecruitmentRequest_createdAt_idx" ON "RecruitmentRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentCandidate_candidateNumber_key" ON "RecruitmentCandidate"("candidateNumber");

-- CreateIndex
CREATE INDEX "RecruitmentCandidate_recruitmentRequestId_idx" ON "RecruitmentCandidate"("recruitmentRequestId");

-- CreateIndex
CREATE INDEX "RecruitmentCandidate_status_idx" ON "RecruitmentCandidate"("status");

-- CreateIndex
CREATE INDEX "RecruitmentInterview_recruitmentRequestId_idx" ON "RecruitmentInterview"("recruitmentRequestId");

-- CreateIndex
CREATE INDEX "RecruitmentInterview_candidateId_idx" ON "RecruitmentInterview"("candidateId");

-- CreateIndex
CREATE INDEX "RecruitmentInterview_interviewDate_idx" ON "RecruitmentInterview"("interviewDate");

-- CreateIndex
CREATE INDEX "RecruitmentRequestTimeline_recruitmentRequestId_idx" ON "RecruitmentRequestTimeline"("recruitmentRequestId");

-- CreateIndex
CREATE INDEX "RecruitmentRequestTimeline_createdAt_idx" ON "RecruitmentRequestTimeline"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "brand_analysis_requests_requestNo_key" ON "brand_analysis_requests"("requestNo");

-- CreateIndex
CREATE INDEX "brand_analysis_requests_status_idx" ON "brand_analysis_requests"("status");

-- CreateIndex
CREATE INDEX "brand_analysis_requests_requestedById_idx" ON "brand_analysis_requests"("requestedById");

-- CreateIndex
CREATE INDEX "brand_analysis_requests_createdAt_idx" ON "brand_analysis_requests"("createdAt");

-- CreateIndex
CREATE INDEX "brand_analysis_history_requestId_idx" ON "brand_analysis_history"("requestId");

-- CreateIndex
CREATE INDEX "brand_analysis_history_performedById_idx" ON "brand_analysis_history"("performedById");

-- CreateIndex
CREATE INDEX "SalesTarget_salespersonId_status_idx" ON "SalesTarget"("salespersonId", "status");

-- CreateIndex
CREATE INDEX "SalesTarget_startDate_endDate_idx" ON "SalesTarget"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionTestingRecord_referenceNo_key" ON "ProductionTestingRecord"("referenceNo");

-- CreateIndex
CREATE INDEX "ProductionTestingRecord_status_idx" ON "ProductionTestingRecord"("status");

-- CreateIndex
CREATE INDEX "ProductionShiftEntry_workOrderId_idx" ON "ProductionShiftEntry"("workOrderId");

-- CreateIndex
CREATE INDEX "ProductionShiftEntry_shift_date_idx" ON "ProductionShiftEntry"("shift", "date");

-- CreateIndex
CREATE INDEX "ProductionScrapEntry_workOrderId_idx" ON "ProductionScrapEntry"("workOrderId");

-- CreateIndex
CREATE INDEX "ProductionScrapEntry_shift_date_idx" ON "ProductionScrapEntry"("shift", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FinishedGoods_workOrderId_key" ON "FinishedGoods"("workOrderId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_preferredVendorId_fkey" FOREIGN KEY ("preferredVendorId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequestItem" ADD CONSTRAINT "MaterialRequestItem_materialRequestId_fkey" FOREIGN KEY ("materialRequestId") REFERENCES "MaterialRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequestItem" ADD CONSTRAINT "MaterialRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseIndent" ADD CONSTRAINT "PurchaseIndent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseIndent" ADD CONSTRAINT "PurchaseIndent_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseIndentItem" ADD CONSTRAINT "PurchaseIndentItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseIndentItem" ADD CONSTRAINT "PurchaseIndentItem_purchaseIndentId_fkey" FOREIGN KEY ("purchaseIndentId") REFERENCES "PurchaseIndent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseIndentStatusHistory" ADD CONSTRAINT "PurchaseIndentStatusHistory_purchaseIndentId_fkey" FOREIGN KEY ("purchaseIndentId") REFERENCES "PurchaseIndent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkLocation" ADD CONSTRAINT "WorkLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_workLocationId_fkey" FOREIGN KEY ("workLocationId") REFERENCES "WorkLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDraft" ADD CONSTRAINT "EmployeeDraft_completedEmployeeId_fkey" FOREIGN KEY ("completedEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "SalarySlip" ADD CONSTRAINT "SalarySlip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalarySlipShare" ADD CONSTRAINT "SalarySlipShare_salarySlipId_fkey" FOREIGN KEY ("salarySlipId") REFERENCES "SalarySlip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollStatusHistory" ADD CONSTRAINT "PayrollStatusHistory_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES "PayrollRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_parentQuotationId_fkey" FOREIGN KEY ("parentQuotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_sourceQuotationId_fkey" FOREIGN KEY ("sourceQuotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderCreditReview" ADD CONSTRAINT "SalesOrderCreditReview_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderAllocation" ADD CONSTRAINT "SalesOrderAllocation_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerComplaint" ADD CONSTRAINT "CustomerComplaint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerComplaint" ADD CONSTRAINT "CustomerComplaint_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnQcInspection" ADD CONSTRAINT "ReturnQcInspection_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnQcInspectionItem" ADD CONSTRAINT "ReturnQcInspectionItem_returnQcInspectionId_fkey" FOREIGN KEY ("returnQcInspectionId") REFERENCES "ReturnQcInspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementRequest" ADD CONSTRAINT "ReplacementRequest_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementRequest" ADD CONSTRAINT "ReplacementRequest_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementRequestItem" ADD CONSTRAINT "ReplacementRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementRequestItem" ADD CONSTRAINT "ReplacementRequestItem_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "SalesOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementRequestItem" ADD CONSTRAINT "ReplacementRequestItem_replacementRequestId_fkey" FOREIGN KEY ("replacementRequestId") REFERENCES "ReplacementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_originalSalesOrderId_fkey" FOREIGN KEY ("originalSalesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_replacementRequestId_fkey" FOREIGN KEY ("replacementRequestId") REFERENCES "ReplacementRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrderItem" ADD CONSTRAINT "ReplacementOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrderItem" ADD CONSTRAINT "ReplacementOrderItem_replacementOrderId_fkey" FOREIGN KEY ("replacementOrderId") REFERENCES "ReplacementOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderHistory" ADD CONSTRAINT "SalesOrderHistory_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "Dispatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPaymentAllocation" ADD CONSTRAINT "CustomerPaymentAllocation_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnGateEntry" ADD CONSTRAINT "ReturnGateEntry_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrderHistory" ADD CONSTRAINT "ReplacementOrderHistory_replacementOrderId_fkey" FOREIGN KEY ("replacementOrderId") REFERENCES "ReplacementOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleRequest" ADD CONSTRAINT "SampleRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleRequest" ADD CONSTRAINT "SampleRequest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleRequest" ADD CONSTRAINT "SampleRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleItem" ADD CONSTRAINT "SampleItem_sampleRequestId_fkey" FOREIGN KEY ("sampleRequestId") REFERENCES "SampleRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleItem" ADD CONSTRAINT "SampleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleHistory" ADD CONSTRAINT "SampleHistory_sampleRequestId_fkey" FOREIGN KEY ("sampleRequestId") REFERENCES "SampleRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_purchaseIndentId_fkey" FOREIGN KEY ("purchaseIndentId") REFERENCES "PurchaseIndent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderStatusHistory" ADD CONSTRAINT "PurchaseOrderStatusHistory_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptNote" ADD CONSTRAINT "GoodsReceiptNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptNote" ADD CONSTRAINT "GoodsReceiptNote_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptNote" ADD CONSTRAINT "GoodsReceiptNote_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptNoteItem" ADD CONSTRAINT "GoodsReceiptNoteItem_goodsReceiptNoteId_fkey" FOREIGN KEY ("goodsReceiptNoteId") REFERENCES "GoodsReceiptNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptNoteItem" ADD CONSTRAINT "GoodsReceiptNoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GRNStatusHistory" ADD CONSTRAINT "GRNStatusHistory_goodsReceiptNoteId_fkey" FOREIGN KEY ("goodsReceiptNoteId") REFERENCES "GoodsReceiptNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementDelivery" ADD CONSTRAINT "ProcurementDelivery_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "GoodsReceiptNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementDeliveryItem" ADD CONSTRAINT "ProcurementDeliveryItem_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ProcurementDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementDeliveryItem" ADD CONSTRAINT "ProcurementDeliveryItem_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementDeliveryItem" ADD CONSTRAINT "ProcurementDeliveryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRejection" ADD CONSTRAINT "MaterialRejection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRejection" ADD CONSTRAINT "MaterialRejection_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRejection" ADD CONSTRAINT "MaterialRejection_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRejection" ADD CONSTRAINT "MaterialRejection_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ProcurementDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRejectionItem" ADD CONSTRAINT "MaterialRejectionItem_materialRejectionId_fkey" FOREIGN KEY ("materialRejectionId") REFERENCES "MaterialRejection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRejectionItem" ADD CONSTRAINT "MaterialRejectionItem_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRejectionItem" ADD CONSTRAINT "MaterialRejectionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ProcurementDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_replacementDeliveryId_fkey" FOREIGN KEY ("replacementDeliveryId") REFERENCES "ProcurementDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementRequest" ADD CONSTRAINT "ProcurementReplacementRequest_materialRejectionId_fkey" FOREIGN KEY ("materialRejectionId") REFERENCES "MaterialRejection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementItem" ADD CONSTRAINT "ProcurementReplacementItem_replacementRequestId_fkey" FOREIGN KEY ("replacementRequestId") REFERENCES "ProcurementReplacementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementItem" ADD CONSTRAINT "ProcurementReplacementItem_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementItem" ADD CONSTRAINT "ProcurementReplacementItem_materialRejectionItemId_fkey" FOREIGN KEY ("materialRejectionItemId") REFERENCES "MaterialRejectionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementReplacementItem" ADD CONSTRAINT "ProcurementReplacementItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSupplier" ADD CONSTRAINT "ProductSupplier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSupplier" ADD CONSTRAINT "ProductSupplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorInvoice" ADD CONSTRAINT "VendorInvoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorInvoice" ADD CONSTRAINT "VendorInvoice_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorInvoiceItem" ADD CONSTRAINT "VendorInvoiceItem_vendorInvoiceId_fkey" FOREIGN KEY ("vendorInvoiceId") REFERENCES "VendorInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorInvoiceItem" ADD CONSTRAINT "VendorInvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPayment" ADD CONSTRAINT "VendorPayment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentAllocation" ADD CONSTRAINT "VendorPaymentAllocation_vendorPaymentId_fkey" FOREIGN KEY ("vendorPaymentId") REFERENCES "VendorPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPaymentAllocation" ADD CONSTRAINT "VendorPaymentAllocation_vendorInvoiceId_fkey" FOREIGN KEY ("vendorInvoiceId") REFERENCES "VendorInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReturn" ADD CONSTRAINT "VendorReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReturn" ADD CONSTRAINT "VendorReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReturnItem" ADD CONSTRAINT "VendorReturnItem_vendorReturnId_fkey" FOREIGN KEY ("vendorReturnId") REFERENCES "VendorReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReturnItem" ADD CONSTRAINT "VendorReturnItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPayable" ADD CONSTRAINT "SupplierPayable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPayable" ADD CONSTRAINT "SupplierPayable_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowState" ADD CONSTRAINT "WorkflowState_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionPlan" ADD CONSTRAINT "ProductionPlan_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionPlan" ADD CONSTRAINT "ProductionPlan_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionPlan" ADD CONSTRAINT "ProductionPlan_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_productionPlanId_fkey" FOREIGN KEY ("productionPlanId") REFERENCES "ProductionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "SalesOrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionStatusHistory" ADD CONSTRAINT "ProductionStatusHistory_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspection" ADD CONSTRAINT "QCInspection_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspection" ADD CONSTRAINT "QCInspection_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchItem" ADD CONSTRAINT "DispatchItem_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "Dispatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchItem" ADD CONSTRAINT "DispatchItem_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "SalesOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "SalesInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "SalesOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "CustomerPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "SalesInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerLedger" ADD CONSTRAINT "CustomerLedger_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAmendment" ADD CONSTRAINT "OrderAmendment_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentRequest" ADD CONSTRAINT "RecruitmentRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentCandidate" ADD CONSTRAINT "RecruitmentCandidate_recruitmentRequestId_fkey" FOREIGN KEY ("recruitmentRequestId") REFERENCES "RecruitmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentInterview" ADD CONSTRAINT "RecruitmentInterview_recruitmentRequestId_fkey" FOREIGN KEY ("recruitmentRequestId") REFERENCES "RecruitmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentInterview" ADD CONSTRAINT "RecruitmentInterview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "RecruitmentCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentRequestTimeline" ADD CONSTRAINT "RecruitmentRequestTimeline_recruitmentRequestId_fkey" FOREIGN KEY ("recruitmentRequestId") REFERENCES "RecruitmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_financeStartedById_fkey" FOREIGN KEY ("financeStartedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_financeCompletedById_fkey" FOREIGN KEY ("financeCompletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_history" ADD CONSTRAINT "brand_analysis_history_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "brand_analysis_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_history" ADD CONSTRAINT "brand_analysis_history_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTarget" ADD CONSTRAINT "SalesTarget_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionShiftEntry" ADD CONSTRAINT "ProductionShiftEntry_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionScrapEntry" ADD CONSTRAINT "ProductionScrapEntry_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGoods" ADD CONSTRAINT "FinishedGoods_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGoods" ADD CONSTRAINT "FinishedGoods_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGoods" ADD CONSTRAINT "FinishedGoods_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevationSession" ADD CONSTRAINT "ElevationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
