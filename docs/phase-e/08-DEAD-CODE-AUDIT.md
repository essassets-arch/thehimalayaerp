# 08 — Dead Code & Unused Artifacts Audit Report

## 1. Overview & Verification Status

- **Status**: **VERIFIED (CLASSIFIED ONLY — NO FILES DELETED)**
- **Scope**: Codebase classification of unused Prisma models, legacy scripts, unused frontend hooks/pages, and legacy storage patterns.
- **Rule**: Pure classification report. Zero files deleted during Phase E.

---

## 2. Unused Prisma Models Audit (36 Models Identified)

The following 36 Prisma models defined in `prisma/schema.prisma` are currently un-referenced by active NestJS services or controllers (reserved for future module expansions or legacy schemas):

| Model Name in Schema | Category | Current Status | Recommendation |
| :--- | :--- | :---: | :--- |
| `Branch` | Organization Structure | Unused | Retain schema for multi-branch support |
| `MaterialRequestItem` | Inventory | Unused | Retain for future material request detail views |
| `EmployeeSalaryStructure` | HR / Payroll | Unused | Retain for payroll engine expansion |
| `PayrollStatusHistory` | HR / Payroll | Unused | Retain for payroll audit trail |
| `QuotationItem` | Sales | Unused | Retain for quotation line items |
| `SalesOrderCreditReview` | Sales Finance | Unused | Retain for credit review workflows |
| `SalesOrderAllocation` | Sales Inventory | Unused | Retain for stock reservation |
| `ReturnQcInspection` | Quality Assurance | Unused | Retain for sales return QC |
| `ReturnQcInspectionItem` | Quality Assurance | Unused | Retain for sales return QC items |
| `ReplacementOrder` | Sales Operations | Unused | Retain for replacement dispatch |
| `ReplacementOrderItem` | Sales Operations | Unused | Retain for replacement line items |
| `SalesOrderHistory` | Sales Operations | Unused | Retain for sales audit trail |
| `CustomerPaymentAllocation` | Finance | Unused | Retain for customer payment matching |
| `ReturnGateEntry` | Logistics | Unused | Retain for return inward gate entry |
| `CreditNote` | Finance | Unused | Retain for financial credit notes |
| `ReplacementOrderHistory` | Sales Operations | Unused | Retain for replacement audit trail |
| `SampleItem` | Sales / Samples | Unused | Retain for sample line items |
| `SampleHistory` | Sales / Samples | Unused | Retain for sample audit trail |
| `ProcurementDelivery` | Procurement | Unused | Retain for delivery physical receipts |
| `ProcurementDeliveryItem` | Procurement | Unused | Retain for delivery line items |
| `MaterialRejectionItem` | Procurement | Unused | Retain for rejection item details |
| `ProcurementReplacementRequest` | Procurement | Unused | Retain for vendor replacement requests |
| `ProcurementReplacementItem` | Procurement | Unused | Retain for vendor replacement items |
| `ProductSupplier` | Procurement | Unused | Retain for multi-supplier mapping |
| `VendorReturn` | Procurement | Unused | Retain for return-to-vendor |
| `VendorReturnItem` | Procurement | Unused | Retain for RTV line items |
| `SupplierPayable` | Finance | Unused | Retain for supplier ledger entries |
| `WorkflowHistoryLegacy` | Core Infrastructure | Unused | Mark for deprecation in v2.0 |
| `ProductionStatusHistory` | Manufacturing | Unused | Retain for production plan tracking |
| `ProductionBatch` | Manufacturing | Unused | Retain for batch manufacturing records |
| `InvoiceItem` | Finance | Unused | Retain for sales invoice line items |
| `PaymentAllocation` | Finance | Unused | Retain for sales payment matching |
| `OrderAmendment` | Sales Operations | Unused | Retain for sales order amendment tracking |
| `Approval` | Core Infrastructure | Unused | Retain for generic multi-level approval engine |
| `RecruitmentRequestTimeline` | HR | Unused | Retain for recruitment tracking |
| `BrandAnalysisHistory` | Marketing | Unused | Retain for brand analysis tracking |

---

## 3. Legacy Mock Files & Utility Scripts Audit

- **File Path**: [`backend/check-mock-user.js`](file:///d:/prototype-next-main/backend/check-mock-user.js)
  - **Category**: Legacy developer verification script.
  - **Status**: Retained (Not imported in production or tests).

- **File Paths**:
  - [`backend/test/mocks/prisma.mock.ts`](file:///d:/prototype-next-main/backend/test/mocks/prisma.mock.ts)
  - [`backend/test/mocks/guards.mock.ts`](file:///d:/prototype-next-main/backend/test/mocks/guards.mock.ts)
  - [`backend/test/mocks/services.mock.ts`](file:///d:/prototype-next-main/backend/test/mocks/services.mock.ts)
  - **Category**: Active unit testing infrastructure.
  - **Status**: **ACTIVE & VERIFIED**.

---

## 4. Legacy LocalStorage & Client Storage Audit

- **Frontend Search (`src/`)**: 0 occurrences of deprecated `localStorage` access found. Authentication bearer tokens and user sessions strictly use HTTP cookies or Zustand store memory.
