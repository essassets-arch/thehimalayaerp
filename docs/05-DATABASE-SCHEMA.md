Generated from repository inspection.
Repository revision: HEAD
Generated date: 2026-08-02T13:10:47.609Z
Scope: Database Schema
Confidence: High

# 5. Database Schema

## Models
### DocumentSequence
- Fields: 7

### IdSequence
- Fields: 3

### Company
- Fields: 31

### Branch
- Fields: 14

### Role
- Fields: 12

### Permission
- Fields: 11

### RolePermission
- Fields: 6

### User
- Fields: 28

### RefreshSession
- Fields: 9

### Customer
- Fields: 32

### Lead
- Fields: 38

### AuditLog
- Fields: 13

### IdempotencyRecord
- Fields: 9

### Product
- Fields: 40

### Warehouse
- Fields: 10

### InventoryTransaction
- Fields: 12

### Supplier
- Fields: 22

### MaterialRequest
- Fields: 20

### MaterialRequestItem
- Fields: 13

### PurchaseIndent
- Fields: 21

### PurchaseIndentItem
- Fields: 10

### PurchaseIndentStatusHistory
- Fields: 11

### Department
- Fields: 9

### WorkLocation
- Fields: 9

### Employee
- Fields: 57

### EmployeeDraft
- Fields: 9

### EmployeeDocument
- Fields: 18

### PayrollPeriod
- Fields: 12

### EmployeeSalaryStructure
- Fields: 18

### EmployeeMonthlyAttendanceSummary
- Fields: 20

### PayrollRecord
- Fields: 63

### PayrollAdjustment
- Fields: 9

### SalaryPayment
- Fields: 14

### SalarySlip
- Fields: 16

### SalarySlipShare
- Fields: 11

### PayrollStatusHistory
- Fields: 9

### Quotation
- Fields: 28

### QuotationItem
- Fields: 12

### SalesOrder
- Fields: 49

### SalesOrderItem
- Fields: 22

### SalesOrderCreditReview
- Fields: 13

### SalesOrderAllocation
- Fields: 12

### CustomerComplaint
- Fields: 25

### SalesReturn
- Fields: 31

### SalesReturnItem
- Fields: 20

### ReturnQcInspection
- Fields: 9

### ReturnQcInspectionItem
- Fields: 4

### ReplacementRequest
- Fields: 26

### ReplacementRequestItem
- Fields: 11

### ReplacementOrder
- Fields: 20

### ReplacementOrderItem
- Fields: 7

### SalesOrderHistory
- Fields: 4

### SalesInvoice
- Fields: 21

### CustomerPaymentAllocation
- Fields: 4

### ReturnGateEntry
- Fields: 4

### CreditNote
- Fields: 4

### ReplacementOrderHistory
- Fields: 4

### LegacyMigrationReference
- Fields: 7

### SampleRequest
- Fields: 34

### SampleItem
- Fields: 11

### SampleHistory
- Fields: 7

### PurchaseOrder
- Fields: 31

### PurchaseOrderItem
- Fields: 14

### PurchaseOrderStatusHistory
- Fields: 9

### GoodsReceiptNote
- Fields: 20

### GoodsReceiptNoteItem
- Fields: 9

### GRNStatusHistory
- Fields: 8

### ProcurementDelivery
- Fields: 27

### ProcurementDeliveryItem
- Fields: 13

### MaterialRejection
- Fields: 23

### MaterialRejectionItem
- Fields: 12

### ProcurementReplacementRequest
- Fields: 25

### ProcurementReplacementItem
- Fields: 13

### ProductSupplier
- Fields: 11

### VendorInvoice
- Fields: 17

### VendorInvoiceItem
- Fields: 8

### VendorPayment
- Fields: 12

### VendorPaymentAllocation
- Fields: 6

### VendorReturn
- Fields: 10

### VendorReturnItem
- Fields: 6

### SupplierPayable
- Fields: 10

### WorkflowDefinition
- Fields: 5

### WorkflowState
- Fields: 21

### WorkflowTransition
- Fields: 10

### WorkflowHistory
- Fields: 10

### WorkflowHistoryLegacy
- Fields: 10

### LeadActivity
- Fields: 9

### FollowUp
- Fields: 9

### ProductionPlan
- Fields: 15

### WorkOrder
- Fields: 38

### ProductionStatusHistory
- Fields: 8

### ProductionBatch
- Fields: 6

### QCInspection
- Fields: 13

### Dispatch
- Fields: 27

### DispatchItem
- Fields: 7

### InvoiceItem
- Fields: 14

### CustomerPayment
- Fields: 17

### PaymentAllocation
- Fields: 7

### CustomerLedger
- Fields: 13

### OrderAmendment
- Fields: 8

### Approval
- Fields: 13

### Attachment
- Fields: 10

### Comment
- Fields: 10

### Notification
- Fields: 10

### RecruitmentRequest
- Fields: 37

### RecruitmentCandidate
- Fields: 19

### RecruitmentInterview
- Fields: 18

### RecruitmentRequestTimeline
- Fields: 12

### BrandAnalysisRequest
- Fields: 42

### BrandAnalysisHistory
- Fields: 10

### SalesTarget
- Fields: 13

### ProductionTestingRecord
- Fields: 11

### ProductionShiftEntry
- Fields: 12

### ProductionScrapEntry
- Fields: 12

### FinishedGoods
- Fields: 13


## Enums
### CustomerStatus
- Values: ACTIVE, INACTIVE, CREDIT_HOLD

### EmployeeStatus
- Values: DRAFT, ACTIVE, ON_PROBATION, CONFIRMED, ON_LEAVE, SUSPENDED, RESIGNED, TERMINATED, RETIRED, INACTIVE

### Gender
- Values: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY

### BankAccountType
- Values: SAVINGS, CURRENT, SALARY, OTHER

### EmployeeDocumentType
- Values: AADHAAR_CARD, PAN_CARD, BANK_PASSBOOK, CANCELLED_CHEQUE, RESUME, PASSPORT, DRIVING_LICENCE, EDUCATION_CERTIFICATE, EXPERIENCE_CERTIFICATE, APPOINTMENT_LETTER, SALARY_SLIP, POLICE_VERIFICATION, MEDICAL_CERTIFICATE, PHOTOGRAPH, SIGNATURE, OTHER

### EmployeeDocumentStatus
- Values: UPLOADED, VERIFIED, REJECTED, EXPIRED

### PayrollPeriodStatus
- Values: OPEN, ATTENDANCE_LOCKED, PAYROLL_PROCESSING, PAYROLL_COMPLETED, CLOSED

### PayrollStatus
- Values: DRAFT, READY_FOR_SUBMISSION, PENDING_SUPER_ADMIN_APPROVAL, SUPER_ADMIN_APPROVED, REJECTED, ON_HOLD, CORRECTION_REQUIRED, SENT_TO_FINANCE, PAYMENT_PROCESSING, SALARY_PAID, PAYMENT_FAILED, CANCELLED

### PayrollAdjustmentType
- Values: BONUS, INCENTIVE, OVERTIME, ARREARS, REIMBURSEMENT, OTHER_EARNING, LEAVE_DEDUCTION, LOAN_DEDUCTION, ADVANCE_DEDUCTION, TAX_DEDUCTION, OTHER_DEDUCTION

### SalaryPaymentMode
- Values: BANK_TRANSFER, NEFT, RTGS, IMPS, UPI, CHEQUE, CASH, OTHER

### SalesOrderStatus
- Values: DRAFT, PENDING_APPROVAL, CONFIRMED, SENT_TO_PLANT, SENT_TO_PLANT_HEAD, PLANT_APPROVED, READY_FOR_PRODUCTION, IN_PRODUCTION, READY_FOR_DISPATCH, COMPLETED, CANCELLED

### QcStatus
- Values: PENDING, PASSED, PARTIAL, FAILED, REWORK, APPROVED

### DispatchStatus
- Values: PENDING_DISPATCH, DISPATCH_DRAFT, DISPATCH_APPROVED, READY_FOR_PICKUP, VEHICLE_ASSIGNED, LOADING_IN_PROGRESS, DISPATCHED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, POD_RECEIVED, DISPATCH_CLOSED

### PaymentStatus
- Values: SUBMITTED, UNDER_VERIFICATION, VERIFIED, REJECTED, RECEIVED, PARTIALLY_ALLOCATED, ALLOCATED, BOUNCED

### ReturnStatus
- Values: REQUESTED, UNDER_REVIEW, APPROVED, REJECTED, PICKUP_PENDING, PICKUP_ASSIGNED, IN_TRANSIT, GATE_RECEIVED, QC_PENDING, QC_COMPLETED, CREDIT_NOTE_PENDING, CREDIT_NOTE_ISSUED, REFUND_PENDING, CLOSED, CANCELLED

### ReplacementRequestStatus
- Values: REQUESTED, UNDER_REVIEW, APPROVED, REJECTED

### ReplacementOrderStatus
- Values: ORDER_CREATED, PRODUCTION_REQUIRED, READY_FOR_DISPATCH, DISPATCHED, IN_TRANSIT, DELIVERED, POD_CONFIRMED, CLOSED, CANCELLED

### InvoiceStatus
- Values: DRAFT, POSTED, PARTIALLY_PAID, PAID, VOID, CANCELLED

### LeadSource
- Values: WEBSITE, REFERRAL, COLD_CALL, EXHIBITION, OTHER

### CreditReviewResult
- Values: PASSED, HOLD, REJECTED

### SalesAllocationType
- Values: FINISHED_GOODS_RESERVATION, PRODUCTION_REQUIRED

### ComplaintStatus
- Values: DRAFT, PENDING_SUPER_ADMIN, APPROVED, REJECTED

### ReturnReasonCode
- Values: DEFECTIVE, WRONG_ITEM, DAMAGE_IN_TRANSIT, OTHER

### ReturnResolutionType
- Values: CREDIT_NOTE, REFUND, REPLACEMENT

### ReturnInspectionResult
- Values: GOOD, REWORKABLE, DEFECTIVE

### ReplacementReasonCode
- Values: DEFECTIVE, WRONG_ITEM, DAMAGE_IN_TRANSIT, OTHER

### SampleStatus
- Values: CREATED, PENDING_DISPATCH, DISPATCHED, DELIVERED, TESTING, APPROVED, REJECTED, RETURN_REQUIRED, RETURN_REQUESTED, RETURN_IN_TRANSIT, RETURNED, COMPLETED

### ProcurementDeliveryStatus
- Values: PENDING_VERIFICATION, VERIFIED, PARTIALLY_RECEIVED, COMPLETED, CANCELLED

### MaterialRejectionStatus
- Values: SUBMITTED, UNDER_REVIEW, REPLACEMENT_EXPECTED, REPLACEMENT_RECEIVED, RESOLVED, REJECTED

### RejectionResolutionType
- Values: REPLACED, CREDIT_NOTE, REFUND, WAIVED

### ProcurementReplacementStatus
- Values: PENDING_FINANCE, APPROVED, REJECTED, IN_TRANSIT, COMPLETED, CLOSED

### ProductionPlanStatus
- Values: PENDING_PLANNING, DRAFT, UNDER_REVIEW, APPROVED, RELEASED, IN_PROGRESS, COMPLETED, CANCELLED

### ProductionStatus
- Values: IN_PRODUCTION, QC_PENDING, QC_FAILED, REWORK_IN_PROGRESS, READY_FOR_DISPATCH, DISPATCHED

### QCResult
- Values: PASS, FAIL

### WorkOrderStatus
- Values: CREATED, MATERIAL_PENDING, READY, CANCELLED, STARTED, PARTIALLY_COMPLETED, COMPLETED, QC_PENDING, QC_APPROVED, READY_FOR_DISPATCH, DISPATCHED, CLOSED

### ApprovalStatus
- Values: PENDING, APPROVED, REJECTED, CANCELLED

### NotificationStatus
- Values: UNREAD, READ, ARCHIVED

### RecruitmentPriority
- Values: LOW, MEDIUM, HIGH, URGENT

### EmploymentType
- Values: PERMANENT, CONTRACT, TEMPORARY, APPRENTICE, INTERN, TRAINEE, CONSULTANT, PART_TIME

### RecruitmentRequestStatus
- Values: DRAFT, OPEN, RETURNED_FOR_CORRECTION, HR_PROCESSING, CANDIDATES_SOURCED, INTERVIEWS_SCHEDULED, CANDIDATES_SELECTED, OFFER_IN_PROGRESS, PARTIALLY_FULFILLED, FULFILLED, ON_HOLD, REJECTED, WITHDRAWN, PENDING

### RecruitmentCandidateStatus
- Values: SOURCED, SCREENING, SHORTLISTED, REJECTED, INTERVIEW_SCHEDULED, INTERVIEWED, SELECTED, OFFERED, OFFER_ACCEPTED, OFFER_REJECTED, JOINED, NO_SHOW

### InterviewStatus
- Values: SCHEDULED, COMPLETED, RESCHEDULED, CANCELLED

### InterviewResult
- Values: PENDING, SELECTED, REJECTED, NEXT_ROUND, ON_HOLD

### BrandAnalysisRequestStatus
- Values: DRAFT, PENDING_SUPER_ADMIN_APPROVAL, SUPER_ADMIN_APPROVED, SUPER_ADMIN_REJECTED, FINANCE_ANALYSIS_IN_PROGRESS, FINANCE_ANALYSIS_COMPLETED, CANCELLED

### BrandAnalysisRecommendation
- Values: RECOMMENDED, NOT_RECOMMENDED, FURTHER_REVIEW_REQUIRED

### TargetPeriod
- Values: Monthly, Quarterly, Yearly

### SalesTargetStatus
- Values: ACTIVE, CANCELLED, COMPLETED
