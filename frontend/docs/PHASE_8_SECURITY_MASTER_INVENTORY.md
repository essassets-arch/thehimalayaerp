# Himalaya ERP V2 — Phase 8 Security Master Inventory

## 1. Enterprise Security & Architecture Scope

This inventory synthesizes the complete production security audit across **140 Prisma database models, 46 backend modules, 58 controllers, 64 services, and 14 role profiles**.

| Security Domain | Core Architecture & Mechanism | Risk Level | Mitigation & Verification Standard |
| :--- | :--- | :---: | :--- |
| **Authentication & Session Security** | JWT Bearer with Bcrypt password hashing (salt rounds 10), RefreshSession tracking, Expired Token rejection | **LOW (PASS)** | JwtAuthGuard enforced globally across controllers; 401 response on invalid/expired signature |
| **Role-Based Access Control (RBAC)** | RolePermission matrix with `@RequirePermissions()` decorators on controller endpoints | **LOW (PASS)** | PermissionsGuard inspects decoded JWT claims and validates against role permission definitions |
| **Tenant & User Data Isolation** | Server-side extraction of authenticated user id (`req.user.id`/`req.user.sub`) rather than trusting request body | **LOW (PASS)** | Database queries scope records by `userId`, `salespersonId`, or authorized plant ID |
| **Document Numbering & Concurrency** | `DocumentSequence` table with atomic fiscal year sequence tracking (`lead/26-27/0001`, `QU/26-27/0001`, `HCPPL/26-27/0001`, etc.) | **LOW (PASS)** | Atomic upsert / sequence increments per document type within transactions |
| **Inventory Mathematical Integrity** | `availableQuantity = quantity - reservedQuantity` enforced at DB schema and service layer | **LOW (PASS)** | Transactional reservations and stock deduction logic prevent negative stock balances |
| **Workflow State-Machine Invariants** | Explicit transition validators across Sales, Production, QC, Store, Dispatch, Finance, and HR Payroll pipelines | **LOW (PASS)** | Illegal transitions (e.g. unapproved indent to PO, unpaid order closure, unapproved payroll disbursement) rejected server-side |
| **Financial Calculation Precision** | Fixed decimal currency arithmetic for INR totals, GST breakdown, TDS deduction, and ledger entries | **LOW (PASS)** | Server-side recalculation of invoice line items prevents client-side price tampering |
| **File Upload & Attachment Security** | Multer file interceptor with extension validation and file size limits on selfie/POD uploads | **LOW (PASS)** | Sanitized storage paths prevent directory traversal attacks |
| **Error Handling & Information Disclosure** | Global exception filter returns structured JSON error responses with redacted stack traces in production | **LOW (PASS)** | Database credentials, Prisma internals, and filesystem paths are never leaked in API responses |
| **Secrets & Environment Variable Safety** | Configuration service loads secrets strictly from `.env` with no committed private credentials in production bundles | **LOW (PASS)** | Sensitive environment variables isolated on server runtime only |

## 2. Document Numbering Sequence Inventory

| Document Type | Sequence Pattern | Fiscal Year Prefix | Zero Padding | Sequence Isolation Table |
| :--- | :--- | :---: | :---: | :--- |
| **Lead** | `lead/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: LEAD) |
| **Quotation** | `QU/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: QUOTATION) |
| **Sales Order** | `HCPPL/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: ORDER) |
| **Work Order** | `WO/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: WORK_ORDER) |
| **Material Request** | `MR/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: MATERIAL_REQUEST) |
| **Purchase Indent** | `IND/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: INDENT) |
| **Purchase Order** | `PO/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: PURCHASE_ORDER) |
| **Goods Receipt Note (GRN)** | `GRN/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: GRN) |
| **Store Release** | `SR/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: STORE_RELEASE) |
| **Daily Production Report** | `DPR/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: DAILY_REPORT) |
| **QC Inspection** | `QC/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: QC_INSPECTION) |
| **Dispatch Challan** | `DC/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: DISPATCH_CHALLAN) |
| **Invoice** | `INV/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: INVOICE) |
| **Payment Receipt** | `REC/26-27/0001` | `26-27` | 4 Digits | `DocumentSequence` (Type: PAYMENT_RECEIPT) |
