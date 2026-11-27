# MODULE IMPACT ANALYSIS
**System-Wide Evaluation of Security Remediations on Enterprise Workflows**

| System | Himalaya ERP (`https://thehimalaya.cloud`) |
| :--- | :--- |
| **Audit Status** | Second-Pass Operational & Architectural Assessment |
| **Primary Directive** | PRESERVE ALL EXISTING ERP WORKFLOWS & HISTORICAL RECORDS |

---

## 1. Executive Summary

Enterprise Resource Planning (ERP) applications connect interdependent business units. A modification in authentication, tenant scoping, or permission resolution can have cascading effects across sales quotes, manufacturing work orders, warehouse inventory, and bank transfers.

This document systematically analyzes the potential operational impact of each recommended security fix across **14 core ERP modules** to guarantee that zero business disruption occurs upon deployment.

---

## 2. Comprehensive Module Impact Matrix

| Module | Affected Remediations | Risk Level Without Plan | Required Mitigation / Compatibility Strategy | Operational Impact |
| :--- | :--- | :--- | :--- | :--- |
| **1. Authentication** | `SEC-AUTH-001`<br>`SEC-AUTH-002` | High | Ensure all 25 users have valid bcrypt hashes in PostgreSQL before removing static table. Preserve current JWTs during rollover. | **Zero Downtime** |
| **2. Super Admin** | `SEC-AUTH-001`<br>`SEC-RBAC-001` | Medium | Verify Super Admin role maintains explicit bypass in `PermissionsGuard` and `RolesGuard`. | **Preserved Full Control** |
| **3. RBAC System** | `SEC-RBAC-001`<br>`SEC-RBAC-002` | High | Decouple `user.read` from administrative read permissions (`hr.employees.read`, `productionreports.read`). Maintain baseline `user.read` for user profile lookups only. | **Hardened Access** |
| **4. Sales & CRM** | `SEC-TENANT-002`<br>`SEC-API-001` | Medium | When filtering `listOrders()` by company, ensure `customer.companyId` is linked cleanly. Sales reps retain access to their assigned quotations and leads. | **Zero Order Disruption** |
| **5. Procurement** | `SEC-DB-002`<br>`SEC-DB-001` | Low | Remove `POST /procurement/admin/sync-schema`. Ensure PO indent linking and supplier catalogs remain untouched. | **Zero PO Disruption** |
| **6. Store & Raw Materials** | `SEC-VPS-003`<br>`SEC-TENANT-001` | High | Remove `DELETE FROM "RawMaterial"` from deployment scripts to prevent inventory record wipeout. Store managers retain stock transfer and GRN workflows. | **100% Inventory Safety** |
| **7. Production & Planning** | `SEC-DB-001`<br>`SEC-RBAC-003` | High | Remove automated dummy work order creation (`WO-AUTO-...`) on boot. Restrict machine deletion to Plant Head while allowing operators to log downtime. | **Clean Machine Registry** |
| **8. Quality Control (QC)** | `SEC-RBAC-002`<br>`SEC-API-001` | Low | Ensure QC failure reports and inspection certificates can still upload photos via authenticated file endpoints. | **Uninterrupted QC Testing** |
| **9. Dispatch & Logistics** | `SEC-RBAC-004`<br>`SEC-API-002` | Medium | Maintain POD upload flows while requiring valid JWT. Keep vehicle tracking and delivery gate pass generation active. | **Continuous Dispatch** |
| **10. Attendance & Biometric** | `SEC-DB-001`<br>`SEC-TENANT-001` | High | Stop startup script from overriding `attendance.companyId`. Staff GPS clock-in and punch history remain 100% intact. | **Zero Clock-in Loss** |
| **11. Payroll & Finance** | `SEC-RBAC-001` | High | Enforce 3-step workflow (HR prepare → Super Admin approve → Finance disburse). Preserve all historical salary slips and UTR records. | **Compliant Payroll** |
| **12. Customer Management** | `SEC-TENANT-001`<br>`SEC-TENANT-002` | Medium | Maintain single-tenant customer data scoping. Prevent cross-company leakage while ensuring sales team customer lookups function smoothly. | **Confidentiality Preserved** |
| **13. Employee Records** | `SEC-AUTH-003`<br>`SEC-RBAC-002` | High | When updating PII encryption key, run an isolated migration script to re-encrypt existing Aadhaar/PAN fields without data corruption. | **100% PII Integrity** |
| **14. Financial Reporting** | `SEC-RBAC-001`<br>`SEC-VPS-001` | Medium | Restrict ledger, balance sheet, and AR registers to Finance Managers and Super Admin. Rotate Hostinger SMTP password safely. | **Secure Auditing** |

---

## 3. Detailed Workflow Walkthroughs

### 3.1 Order-to-Cash (O2C) Workflow
- **Path:** Lead Generation → Quotation Approval → Sales Order → Production Plan → Work Order → QC Inspection → Dispatch Gate Pass → Invoice.
- **Verification:** 
  - `SEC-TENANT-002` fix: Adds `where: { customer: { companyId } }` to `SalesOrder` queries for non-sales roles. 
  - The sales workflow relies on relational joins between `Quotation`, `SalesOrder`, and `Customer`. Because `Customer.companyId` already exists, linking through customer ensures that Plant Heads, Store Managers, and Finance Executives can view all orders belonging to their company without seeing competitor orders.

### 3.2 Procure-to-Pay (P2P) Workflow
- **Path:** Purchase Indent → Vendor Quotation → Purchase Order Approval → Store GRN → Material Quality Check → Finance Invoice Matching → Payment Disbursement.
- **Verification:**
  - Removing `POST /procurement/admin/sync-schema` has zero effect on daily procurement operations because that endpoint was an obsolete manual workaround.
  - All existing Purchase Orders, Indents, and Vendor records remain untouched.

### 3.3 Hire-to-Retire & Payroll Workflow
- **Path:** Employee Onboarding → Biometric/GPS Attendance → Monthly Attendance Freeze → Payroll Batch Generation → Super Admin Audit & Approval → Finance Bank Transfer → Salary Slip Generation.
- **Verification:**
  - Enforcing `@Roles('Super Admin')` on payroll approval ensures compliance with corporate financial governance.
  - Self-service endpoints (`GET /payroll/me`) continue to permit individual staff members to download their own salary slips without exposing company-wide registers.

---

## 4. Architectural Compatibility Verification

1. **Prisma ORM Compatibility:** None of the proposed fixes require dropping tables or destroying columns. Any schema adjustments are purely additive (adding indexes or formalizing existing columns into tracked migrations).
2. **Next.js & Frontend Parity:** Frontend API routes continue forwarding through the existing proxy architecture; security headers and token cookies are synchronized transparently without requiring frontend rewrites.
3. **Database Concurrency:** Eliminating startup table locks (`FOR UPDATE` queries and unmanaged DDL) eliminates database connection starvation and improves API response times under load.
