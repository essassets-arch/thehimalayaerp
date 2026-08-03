Generated from repository inspection.
Repository revision: HEAD
Generated date: 2026-08-02T13:12:38.903Z
Scope: Frontend Backend Data Map
Confidence: Medium

# 8. Frontend-to-Backend Data Mapping

This mapping correlates frontend routes with likely backend endpoints based on path naming conventions.

**Route**: `/admin/[[...slug]]`
- Component: `frontend/app/(dashboard)/admin/[[...slug]]/page.tsx`
- Likely Backend Endpoints: /admin/audit-logs


**Route**: `/crm/leads`
- Component: `frontend/app/(dashboard)/crm/leads/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/crm/leads/[id]`
- Component: `frontend/app/(dashboard)/crm/leads/[id]/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/crm/quotations`
- Component: `frontend/app/(dashboard)/crm/quotations/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/crm/quotations/[id]`
- Component: `frontend/app/(dashboard)/crm/quotations/[id]/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/create`
- Component: `frontend/app/(dashboard)/dispatch/create/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/create-dispatch`
- Component: `frontend/app/(dashboard)/dispatch/create-dispatch/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/dashboard`
- Component: `frontend/app/(dashboard)/dispatch/dashboard/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/delivery`
- Component: `frontend/app/(dashboard)/dispatch/delivery/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/history`
- Component: `frontend/app/(dashboard)/dispatch/history/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/in-transit`
- Component: `frontend/app/(dashboard)/dispatch/in-transit/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/orders`
- Component: `frontend/app/(dashboard)/dispatch/orders/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch`
- Component: `frontend/app/(dashboard)/dispatch/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/replacements`
- Component: `frontend/app/(dashboard)/dispatch/replacements/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/returns`
- Component: `frontend/app/(dashboard)/dispatch/returns/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/sample-dispatch/create/[id]`
- Component: `frontend/app/(dashboard)/dispatch/sample-dispatch/create/[id]/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/sample-dispatch`
- Component: `frontend/app/(dashboard)/dispatch/sample-dispatch/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/[...slug]`
- Component: `frontend/app/(dashboard)/dispatch/[...slug]/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/dispatch/[id]`
- Component: `frontend/app/(dashboard)/dispatch/[id]/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/employee/payslips`
- Component: `frontend/app/(dashboard)/employee/payslips/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/employee/salary-slips`
- Component: `frontend/app/(dashboard)/employee/salary-slips/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/employee/salary-slips/[id]`
- Component: `frontend/app/(dashboard)/employee/salary-slips/[id]/page.tsx`
- Likely Backend Endpoints: N/A


**Route**: `/finance/brand-analysis`
- Component: `frontend/app/(dashboard)/finance/brand-analysis/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/invoices`
- Component: `frontend/app/(dashboard)/finance/invoices/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/invoices/[id]`
- Component: `frontend/app/(dashboard)/finance/invoices/[id]/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/ledger`
- Component: `frontend/app/(dashboard)/finance/ledger/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/payment-verification`
- Component: `frontend/app/(dashboard)/finance/payment-verification/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/payments/create`
- Component: `frontend/app/(dashboard)/finance/payments/create/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/payments`
- Component: `frontend/app/(dashboard)/finance/payments/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/payments/[id]`
- Component: `frontend/app/(dashboard)/finance/payments/[id]/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/purchase-orders`
- Component: `frontend/app/(dashboard)/finance/purchase-orders/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/purchase-orders/[id]/close`
- Component: `frontend/app/(dashboard)/finance/purchase-orders/[id]/close/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/reports`
- Component: `frontend/app/(dashboard)/finance/reports/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/salary/history`
- Component: `frontend/app/(dashboard)/finance/salary/history/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/salary/history/[payrollId]/salary-slip`
- Component: `frontend/app/(dashboard)/finance/salary/history/[payrollId]/salary-slip/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/salary/paid`
- Component: `frontend/app/(dashboard)/finance/salary/paid/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/salary/pending`
- Component: `frontend/app/(dashboard)/finance/salary/pending/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/salary/processing`
- Component: `frontend/app/(dashboard)/finance/salary/processing/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/salary-disbursement`
- Component: `frontend/app/(dashboard)/finance/salary-disbursement/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/salary-history`
- Component: `frontend/app/(dashboard)/finance/salary-history/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/salary-verification`
- Component: `frontend/app/(dashboard)/finance/salary-verification/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance/[[...slug]]`
- Component: `frontend/app/(dashboard)/finance/[[...slug]]/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/finance-executive/[[...slug]]`
- Component: `frontend/app/(dashboard)/finance-executive/[[...slug]]/page.tsx`
- Likely Backend Endpoints: /finance/invoices/:id, /finance/invoices/:id/action


**Route**: `/hr/recruitment`
- Component: `frontend/app/(dashboard)/hr/recruitment/page.tsx`
- Likely Backend Endpoints: /hr/employees, /hr/salary-structures


**Route**: `/hr/roles`
- Component: `frontend/app/(dashboard)/hr/roles/page.tsx`
- Likely Backend Endpoints: /hr/employees, /hr/salary-structures


**Route**: `/hr/salary/history`
- Component: `frontend/app/(dashboard)/hr/salary/history/page.tsx`
- Likely Backend Endpoints: /hr/employees, /hr/salary-structures


**Route**: `/hr/salary`
- Component: `frontend/app/(dashboard)/hr/salary/page.tsx`
- Likely Backend Endpoints: /hr/employees, /hr/salary-structures


**Route**: `/hr/salary/payslips`
- Component: `frontend/app/(dashboard)/hr/salary/payslips/page.tsx`
- Likely Backend Endpoints: /hr/employees, /hr/salary-structures


**Route**: `/hr/salary/prepare`
- Component: `frontend/app/(dashboard)/hr/salary/prepare/page.tsx`
- Likely Backend Endpoints: /hr/employees, /hr/salary-structures


**Route**: `/hr/salary/status`
- Component: `frontend/app/(dashboard)/hr/salary/status/page.tsx`
- Likely Backend Endpoints: /hr/employees, /hr/salary-structures
