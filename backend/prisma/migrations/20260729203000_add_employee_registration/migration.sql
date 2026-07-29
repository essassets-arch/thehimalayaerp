CREATE TYPE "EmployeeStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ON_PROBATION', 'CONFIRMED', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'RETIRED', 'INACTIVE');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE "BankAccountType" AS ENUM ('SAVINGS', 'CURRENT', 'SALARY', 'OTHER');
CREATE TYPE "EmployeeDocumentType" AS ENUM ('AADHAAR_CARD', 'PAN_CARD', 'BANK_PASSBOOK', 'CANCELLED_CHEQUE', 'RESUME', 'PASSPORT', 'DRIVING_LICENCE', 'EDUCATION_CERTIFICATE', 'EXPERIENCE_CERTIFICATE', 'APPOINTMENT_LETTER', 'SALARY_SLIP', 'POLICE_VERIFICATION', 'MEDICAL_CERTIFICATE', 'PHOTOGRAPH', 'SIGNATURE', 'OTHER');
CREATE TYPE "EmployeeDocumentStatus" AS ENUM ('UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED');
ALTER TYPE "EmploymentType" ADD VALUE IF NOT EXISTS 'TRAINEE';
ALTER TYPE "EmploymentType" ADD VALUE IF NOT EXISTS 'CONSULTANT';
ALTER TYPE "EmploymentType" ADD VALUE IF NOT EXISTS 'PART_TIME';

CREATE TABLE "Department" (
  "id" TEXT NOT NULL, "companyId" TEXT NOT NULL, "code" TEXT NOT NULL, "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WorkLocation" (
  "id" TEXT NOT NULL, "companyId" TEXT NOT NULL, "code" TEXT NOT NULL, "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "WorkLocation_pkey" PRIMARY KEY ("id")
);

-- Preserve every legacy employee by first creating matching department/location masters.
INSERT INTO "Department" ("id", "companyId", "code", "name")
SELECT md5("companyId" || ':' || COALESCE("department", 'GENERAL')), "companyId",
       upper(regexp_replace(COALESCE("department", 'GENERAL'), '[^A-Za-z0-9]+', '_', 'g')),
       COALESCE("department", 'General')
FROM "Employee"
GROUP BY "companyId", "department";
INSERT INTO "WorkLocation" ("id", "companyId", "code", "name")
SELECT md5("companyId" || ':HEAD_OFFICE'), "companyId", 'HEAD_OFFICE', 'Head Office'
FROM "Employee" GROUP BY "companyId";

ALTER TABLE "Employee"
  ADD COLUMN "aadhaarHash" TEXT,
  ADD COLUMN "aadhaarLastFour" TEXT,
  ADD COLUMN "aadhaarNumberEncrypted" TEXT,
  ADD COLUMN "accountHolderName" TEXT,
  ADD COLUMN "bankAccountEncrypted" TEXT,
  ADD COLUMN "bankAccountHash" TEXT,
  ADD COLUMN "bankAccountLastFour" TEXT,
  ADD COLUMN "bankAccountType" "BankAccountType",
  ADD COLUMN "bankName" TEXT,
  ADD COLUMN "branchName" TEXT,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN "departmentId" TEXT,
  ADD COLUMN "emergencyContactName" TEXT,
  ADD COLUMN "emergencyContactPhone" TEXT,
  ADD COLUMN "emergencyRelationship" TEXT,
  ADD COLUMN "employeeCode" TEXT,
  ADD COLUMN "employmentType" "EmploymentType",
  ADD COLUMN "esicNumber" TEXT,
  ADD COLUMN "fullName" TEXT,
  ADD COLUMN "gender" "Gender",
  ADD COLUMN "ifscCode" TEXT,
  ADD COLUMN "joiningDate" TIMESTAMP(3),
  ADD COLUMN "panNumber" TEXT,
  ADD COLUMN "personalEmail" TEXT,
  ADD COLUMN "phoneNumber" TEXT,
  ADD COLUMN "probationEndDate" TIMESTAMP(3),
  ADD COLUMN "reportingManagerId" TEXT,
  ADD COLUMN "residentialAddress" TEXT,
  ADD COLUMN "uanNumber" TEXT,
  ADD COLUMN "updatedById" TEXT,
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "workEmail" TEXT,
  ADD COLUMN "workLocationId" TEXT,
  ADD COLUMN "newStatus" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE';

UPDATE "Employee" SET
  "employeeCode" = "publicId",
  "fullName" = trim("firstName" || ' ' || "lastName"),
  "dateOfBirth" = "hireDate" - INTERVAL '18 years',
  "gender" = 'PREFER_NOT_TO_SAY',
  "departmentId" = md5("companyId" || ':' || COALESCE("department", 'GENERAL')),
  "workLocationId" = md5("companyId" || ':HEAD_OFFICE'),
  "employmentType" = 'PERMANENT',
  "joiningDate" = "hireDate",
  "workEmail" = COALESCE("email", lower("publicId") || '@legacy.local'),
  "personalEmail" = "email",
  "phoneNumber" = COALESCE("phone", '0000000000'),
  "residentialAddress" = 'Legacy record - update required',
  "emergencyContactName" = 'Update required',
  "emergencyContactPhone" = '0000000000',
  "emergencyRelationship" = 'Other',
  "panNumber" = 'LEGACY' || substr(md5("id"), 1, 10),
  "aadhaarNumberEncrypted" = 'LEGACY_MIGRATED',
  "aadhaarLastFour" = '0000',
  "aadhaarHash" = md5('aadhaar:' || "id"),
  "bankName" = 'Update required',
  "accountHolderName" = trim("firstName" || ' ' || "lastName"),
  "bankAccountType" = 'OTHER',
  "bankAccountEncrypted" = 'LEGACY_MIGRATED',
  "bankAccountLastFour" = '0000',
  "bankAccountHash" = md5('bank:' || "id"),
  "ifscCode" = 'AAAA0000000',
  "jobTitle" = COALESCE("jobTitle", 'Update required'),
  "newStatus" = CASE WHEN upper("status") = 'INACTIVE' THEN 'INACTIVE'::"EmployeeStatus" ELSE 'ACTIVE'::"EmployeeStatus" END;

ALTER TABLE "Employee"
  ALTER COLUMN "aadhaarHash" SET NOT NULL, ALTER COLUMN "aadhaarLastFour" SET NOT NULL,
  ALTER COLUMN "aadhaarNumberEncrypted" SET NOT NULL, ALTER COLUMN "accountHolderName" SET NOT NULL,
  ALTER COLUMN "bankAccountEncrypted" SET NOT NULL, ALTER COLUMN "bankAccountHash" SET NOT NULL,
  ALTER COLUMN "bankAccountLastFour" SET NOT NULL, ALTER COLUMN "bankAccountType" SET NOT NULL,
  ALTER COLUMN "bankName" SET NOT NULL, ALTER COLUMN "dateOfBirth" SET NOT NULL,
  ALTER COLUMN "departmentId" SET NOT NULL, ALTER COLUMN "emergencyContactName" SET NOT NULL,
  ALTER COLUMN "emergencyContactPhone" SET NOT NULL, ALTER COLUMN "emergencyRelationship" SET NOT NULL,
  ALTER COLUMN "employeeCode" SET NOT NULL, ALTER COLUMN "employmentType" SET NOT NULL,
  ALTER COLUMN "fullName" SET NOT NULL, ALTER COLUMN "gender" SET NOT NULL,
  ALTER COLUMN "ifscCode" SET NOT NULL, ALTER COLUMN "joiningDate" SET NOT NULL,
  ALTER COLUMN "jobTitle" SET NOT NULL, ALTER COLUMN "panNumber" SET NOT NULL,
  ALTER COLUMN "phoneNumber" SET NOT NULL, ALTER COLUMN "residentialAddress" SET NOT NULL,
  ALTER COLUMN "workEmail" SET NOT NULL, ALTER COLUMN "workLocationId" SET NOT NULL,
  ALTER COLUMN "baseSalary" SET DEFAULT 0;
ALTER TABLE "Employee" DROP COLUMN "status";
ALTER TABLE "Employee" RENAME COLUMN "newStatus" TO "status";
ALTER TABLE "Employee" DROP COLUMN "department", DROP COLUMN "email", DROP COLUMN "hireDate", DROP COLUMN "phone";

CREATE TABLE "EmployeeDraft" (
  "id" TEXT NOT NULL, "companyId" TEXT NOT NULL, "createdById" TEXT NOT NULL, "employeeData" JSONB NOT NULL,
  "completedEmployeeId" TEXT, "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeDraft_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EmployeeDocument" (
  "id" TEXT NOT NULL, "employeeId" TEXT NOT NULL, "documentType" "EmployeeDocumentType" NOT NULL,
  "documentName" TEXT NOT NULL, "originalFileName" TEXT NOT NULL, "storedFileName" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "fileSize" INTEGER NOT NULL,
  "description" TEXT, "expiryDate" TIMESTAMP(3), "status" "EmployeeDocumentStatus" NOT NULL DEFAULT 'UPLOADED',
  "verifiedAt" TIMESTAMP(3), "verifiedById" TEXT, "rejectionReason" TEXT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "uploadedById" TEXT,
  CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Department_companyId_code_key" ON "Department"("companyId", "code");
CREATE INDEX "Department_companyId_isActive_idx" ON "Department"("companyId", "isActive");
CREATE UNIQUE INDEX "WorkLocation_companyId_code_key" ON "WorkLocation"("companyId", "code");
CREATE INDEX "WorkLocation_companyId_isActive_idx" ON "WorkLocation"("companyId", "isActive");
CREATE UNIQUE INDEX "EmployeeDraft_completedEmployeeId_key" ON "EmployeeDraft"("completedEmployeeId");
CREATE INDEX "EmployeeDraft_companyId_createdById_idx" ON "EmployeeDraft"("companyId", "createdById");
CREATE INDEX "EmployeeDocument_employeeId_idx" ON "EmployeeDocument"("employeeId");
CREATE INDEX "EmployeeDocument_documentType_idx" ON "EmployeeDocument"("documentType");
CREATE INDEX "EmployeeDocument_status_idx" ON "EmployeeDocument"("status");
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");
CREATE UNIQUE INDEX "Employee_workEmail_key" ON "Employee"("workEmail");
CREATE UNIQUE INDEX "Employee_panNumber_key" ON "Employee"("panNumber");
CREATE UNIQUE INDEX "Employee_aadhaarHash_key" ON "Employee"("aadhaarHash");
CREATE INDEX "Employee_companyId_status_idx" ON "Employee"("companyId", "status");
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");
CREATE INDEX "Employee_workLocationId_idx" ON "Employee"("workLocationId");
CREATE INDEX "Employee_reportingManagerId_idx" ON "Employee"("reportingManagerId");
CREATE INDEX "Employee_fullName_idx" ON "Employee"("fullName");
CREATE INDEX "Employee_phoneNumber_idx" ON "Employee"("phoneNumber");

ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkLocation" ADD CONSTRAINT "WorkLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_workLocationId_fkey" FOREIGN KEY ("workLocationId") REFERENCES "WorkLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmployeeDraft" ADD CONSTRAINT "EmployeeDraft_completedEmployeeId_fkey" FOREIGN KEY ("completedEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
