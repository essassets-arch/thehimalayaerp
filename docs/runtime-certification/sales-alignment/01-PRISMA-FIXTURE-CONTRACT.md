# Prisma Fixture Contract: Sales Alignment

This document outlines the strict schema requirements for generating valid test fixtures for the Sales workflows in the Himalaya ERP Browser Certification suite. All test records MUST adhere to these generated Prisma types, required fields, and valid enum values.

## Core Models

### 1. Company
- **Required Fields**: `name`, `version` (default 1)
- **Auto-generated**: `id`, `publicId`, `createdAt`, `updatedAt`
- **Optional**: `createdById`, `updatedById`, `deletedAt`
- **Ownership**: The root entity. Most records require a `companyId`.

### 2. User
- **Required Fields**: `email`, `password`, `name`, `roleId`, `companyId`, `isActive` (default true)
- **Auto-generated**: `id`, `publicId`, `createdAt`, `updatedAt`
- **Optional Fields**: `failedLoginAttempts`, `lockedUntil`, `createdById`, `updatedById`, `deletedAt`
- **Unique**: `email`, `publicId`

### 3. Employee
- **Required Fields**: `companyId`, `employeeCode`, `firstName`, `lastName`, `fullName`, `dateOfBirth`, `gender`, `jobTitle`, `departmentId`, `workLocationId`, `employmentType`, `joiningDate`, `status` (default ACTIVE), `workEmail`, `phoneNumber`, `residentialAddress`, `emergencyContactName`, `emergencyContactPhone`, `emergencyRelationship`, `panNumber`, `aadhaarNumberEncrypted`, `aadhaarLastFour`, `aadhaarHash`, `bankName`, `accountHolderName`, `bankAccountType`, `bankAccountEncrypted`, `bankAccountLastFour`, `bankAccountHash`, `ifscCode`, `baseSalary`
- **Enums**: 
  - `Gender`: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
  - `EmployeeStatus`: DRAFT, ACTIVE, ON_PROBATION, CONFIRMED, ON_LEAVE, SUSPENDED, RESIGNED, TERMINATED, RETIRED, INACTIVE
  - `BankAccountType`: SAVINGS, CURRENT, SALARY, OTHER
- **Unique Constraints**: `publicId`, `userId`, `employeeCode`, `workEmail`, `panNumber`, `aadhaarHash`, `bankAccountHash`

### 4. Role & Permission
- **Role Required Fields**: `name`, `code`
- **Permission Required Fields**: `name`, `code`
- **RolePermission Required**: `roleId`, `permissionId` (Unique constraint on combination)

### 5. Product
- **Required Fields**: `companyId`, `name`, `unit`, `unitPrice`, `minimumStock` (default 0), `isAutoReorderEnabled` (default false), `isActive` (default true)
- **Optional Fields**: `sku`, `description`, `category`, `reorderQuantity`, `reorderUnit`, `leadTimeDays`, `preferredVendorId`

### 6. Customer
- **Required Fields**: `companyId`, `companyName`, `status` (default ACTIVE), `creditStatus` (default GOOD)
- **Enums**: `CustomerStatus` (ACTIVE, INACTIVE, CREDIT_HOLD)
- **Optional Fields**: `alternatePhone`, `billingAddress`, `branchId`, `contactPerson`, `creditLimit`, `creditDays`, `email`, `gstin`, `notes`, `pan`, `paymentTerms`, `phone`, `shippingAddress`
- **Unique**: `customerCode`, `[companyId, gstin]`

## Sales Specific Models

### 7. Lead
- **Required Fields**: `leadNumber`, `companyName`, `contactPerson`, `createdById`
- **Enums**: `LeadSource` (WEBSITE, REFERRAL, COLD_CALL, EXHIBITION, OTHER)
- **Optional Fields**: `groupName`, `projectName`, `email`, `phone`, `gstName`, `gstNumber`, `address`, `source`, `productInterest`, `detailedItems`, `estimatedQuantity`, `unit`, `workflowStateId`, `assignedToId`, `customerId`, `convertedCustomerId`, `convertedAt`, `convertedById`, `nextReminderAt`, `lostReason`, `remarks`, `companyId`

### 8. SampleRequest
- **Required Fields**: `sampleNumber`, `companyId`, `status` (default CREATED), `requestedDate`
- **Enums**: `SampleStatus` (CREATED, PENDING_DISPATCH, DISPATCHED, DELIVERED, TESTING, APPROVED, REJECTED, RETURN_REQUIRED, RETURN_REQUESTED, RETURN_IN_TRANSIT, RETURNED, COMPLETED)
- **Optional**: `leadId`, `customerId`, `expectedDeliveryDate`, `testingDeadline`, `returnDeadline`, `dispatchDate`, `deliveredAt`

### 9. Quotation & QuotationItem
- **Quotation Required Fields**: `quotationNumber`, `subtotal`, `discount`, `tax`, `total`
- **QuotationItem Required Fields**: `quotationId`, `productId`, `quantity`, `unitPrice`, `discount`, `tax`, `lineTotal`
- **Relations**: `companyId`, `workflowStateId`, `leadId`, `customerId`, `parentQuotationId`, `createdById`
- **Unique**: `quotationNumber`

### 10. SalesOrder & SalesOrderItem
- **SalesOrder Required Fields**: `orderNumber`, `customerId`, `orderDate`, `subtotal`, `discountAmount`, `taxableAmount`, `taxAmount`, `freightAmount`, `totalAmount`, `currency`, `status`, `createdById`
- **Enums**: `SalesOrderStatus` (DRAFT, PENDING_APPROVAL, CONFIRMED, SENT_TO_PLANT, SENT_TO_PLANT_HEAD, PLANT_APPROVED, READY_FOR_PRODUCTION, IN_PRODUCTION, READY_FOR_DISPATCH, COMPLETED, CANCELLED)
- **SalesOrderItem Required Fields**: `salesOrderId`, `productId`, `productNameSnapshot`, `orderedQuantity`, `unit`, `unitPrice`, `discountAmount`, `taxableAmount`, `taxRate`, `taxAmount`, `lineTotal`
- **Unique Constraints**: `orderNumber`, `quotationId`

### 11. SalesOrderHistory
- **Required Fields**: `salesOrderId`, `createdAt`

### 12. AuditLog
- **Required Fields**: `action`, `entityType`, `entityId`
- **Optional**: `actorUserId`, `companyId`, `branchId`, `before`, `after`, `requestId`, `ipAddress`, `userAgent`

---
*Note: This contract must be strictly followed when generating tests in `frontend/tests/browser/certification/helpers/sales-fixture-factory.ts`.*
