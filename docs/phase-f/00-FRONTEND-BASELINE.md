# 00 — Frontend Baseline Snapshot Report

## 1. Environment & Version Control Snapshot

- **Current Branch**: `main`
- **Commit SHA**: `f3f1d20f11899b76357dac4166350edfdeb3eb1f`
- **Node.js Version**: `v20.16.0`
- **npm Version**: `10.8.1`
- **Next.js Version**: `15.5.20`
- **React Version**: `19.1.0`
- **Workspace Target Directory**: [`frontend/`](file:///d:/prototype-next-main/frontend)

---

## 2. Codebase Inventory Metrics

- **Total Frontend Files**: `1043` files
- **App Router Pages**: `0` page components
- **Next.js API Bridge Routes**: `0` API routes
- **UI Components**: `0` components
- **Frontend Services & Client Libraries**: `0` files
- **State Stores & Contexts**: `0` files

---

## 3. Package Scripts & Configurations

```json
{
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test:workflow": "npx tsx scripts/test-workflow.ts",
  "test:sales": "npx tsx scripts/test-sales.ts",
  "test:sales:memory": "npx tsx scripts/test-sales-memory.ts",
  "test:ess-o2c": "tsx scripts/ESS-All-O2C-Flow-Test.ts",
  "test:payroll": "tsx scripts/test-payroll-workflow.ts"
}
```

---

## 4. Git Workspace Status

```text
M eslint.config.mjs
 M package.json
 D prisma/migrations/20260728190000_unified_crm_sales_lifecycle/migration.sql
 D prisma/migrations/20260728203000_invoice_commercial_snapshot/migration.sql
 D prisma/migrations/20260728204500_payment_verification/migration.sql
 D prisma/migrations/20260728210000_work_order_item_traceability/migration.sql
 D prisma/migrations/20260728213000_lead_detailed_items/migration.sql
 D prisma/migrations/20260728214500_lead_company_gst_details/migration.sql
 D prisma/migrations/20260728230000_grant_plant_head_sales_order_read/migration.sql
 D prisma/migrations/20260728233000_plant_head_pending_planning/migration.sql
 D prisma/migrations/20260729152000_link_customer_payment_to_sales_order/migration.sql
 D prisma/migrations/20260729154000_add_customer_payment_proof/migration.sql
 D prisma/migrations/20260729160000_grant_finance_role_permissions/migration.sql
 D prisma/migrations/20260729173000_persist_material_request_workflow/migration.sql
 D prisma/migrations/20260729180000_material_request_full_backend_state/migration.sql
 D prisma/migrations/20260729190000_recruitment_workflow/migration.sql
 D prisma/migrations/20260729203000_add_employee_registration/migration.sql
 D prisma/migrations/20260729220000_add_dynamic_payroll/migration.sql
 D prisma/migrations/20260729233000_add_salary_slip_sharing/migration.sql
 D prisma/migrations/20260730010000_procure_to_pay_core/migration.sql
 D prisma/migrations/20260730020000_vendor_invoice_and_payment/migration.sql
 D prisma/migrations/20260730030000_procurement_final_alignment/migration.sql
 D prisma/migrations/20260730110000_procurement_delivery_rejection_replacement/migration.sql
 D prisma/migrations/20260730150000_add_brand_analysis_workflow/migration.sql
 D prisma/migrations/20260730160000_remove_legacy_brand_analysis/migration.sql
 D prisma/migrations/20260731120000_customer_complaint_management/migration.sql
 M prisma/migrations/migration_lock.toml
 M prisma/schema.prisma
 M prisma/seed.ts
 M src/app.controller.spec.ts
 M src/app.controller.ts
 M src/app.module.ts
 M src/common/decorators/current-user.decorator.ts
 M src/common/decorators/permissions.decorator.ts
 M src/common/filters/all-exceptions.filter.ts
 M src/common/guards/jwt-auth.guard.ts
 M src/common/guards/permissions.guard.ts
 M src/common/guards/roles.guard.ts
 M src/common/interceptors/idempotency.interceptor.ts
 M src/common/utils/rbac.util.ts
 M src/modules/attachments/attachments.controller.spec.ts
 M src/modules/attachments/attachments.controller.ts
 M src/modules/attachments/attachments.service.spec.ts
 M src/modules/audit/audit.controller.ts
 M src/modules/audit/audit.service.spec.ts
 M src/modules/auth/auth.controller.spec.ts
 M src/modules/auth/auth.controller.ts
 M src/modules/auth/auth.module.ts
 M src/modules/auth/auth.service.spec.ts
 M src/modules/auth/auth.service.ts
 M src/modules/auth/strategies/jwt-refresh.strategy.ts
 M src/modules/auth/strategies/jwt.strategy.ts
 M src/modules/brand-analysis/brand-analysis-upload.controller.ts
 M src/modules/brand-analysis/brand-analysis.controller.ts
 M src/modules/comments/comments.controller.spec.ts
 M src/modules/comments/comments.controller.ts
 M src/modules/comments/comments.service.spec.ts
 M src/modules/crm/crm-insights.controller.ts
 M src/modules/crm/leads.controller.ts
 M src/modules/crm/leads.service.ts
 M src/modules/crm/sales-reminders.controller.ts
 M src/modules/customer-complaints/customer-complaints.controller.spec.ts
 M src/modules/customer-complaints/customer-complaints.controller.ts
 M src/modules/customer-complaints/customer-complaints.service.spec.ts
 M src/modules/customers/customers.controller.spec.ts
 M src/modules/customers/customers.controller.ts
 M src/modules/customers/customers.service.spec.ts
 M src/modules/dispatch/dispatch.controller.ts
 M src/modules/dispatch/dispatch.service.ts
 M src/modules/dispatch/dto/create-dispatch.dto.ts
 M src/modules/employees/employees.controller.ts
 M src/modules/finance/credit.service.ts
 M src/modules/finance/invoices.controller.ts
 M src/modules/finance/ledger.controller.ts
 M src/modules/finance/payments.controller.ts
 M src/modules/health/health.controller.spec.ts
 M src/modules/health/health.controller.ts
 M src/modules/inventory/inventory.controller.ts
 M src/modules/material-requests/material-requests.controller.ts
 M src/modules/material-requests/material-requests.service.ts
 M src/modules/notifications/notifications.controller.spec.ts
 M src/modules/notifications/notifications.controller.ts
 M src/modules/notifications/notifications.service.spec.ts
 M src/modules/payroll/payroll.controller.ts
 M src/modules/payroll/payroll.service.ts
 M src/modules/payroll/salary-slip.pdf.ts
 M src/modules/plant-head/plant-head.controller.ts
 M src/modules/plant-head/plant-head.service.ts
 M src/modules/procurement/procurement-closure.service.ts
 M src/modules/procurement/procurement.controller.ts
 M src/modules/procurement/procurement.service.ts
 M src/modules/production/production-testing.controller.ts
 M src/modules/production/production-workflow.controller.ts
 M src/modules/production/production-workflow.service.ts
 M src/modules/production/production.controller.spec.ts
 M src/modules/production/production.controller.ts
 M src/modules/production/production.module.ts
 M src/modules/production/production.service.spec.ts
 M src/modules/products/products.controller.ts
 M src/modules/qc/qc.controller.ts
 M src/modules/qc/qc.service.ts
 M src/modules/quotations/quotations.controller.ts
 M src/modules/recruitment/recruitment.controller.ts
 M src/modules/recruitment/recruitment.service.ts
 M src/modules/replacements/replacements.controller.spec.ts
 M src/modules/replacements/replacements.controller.ts
 M src/modules/replacements/replacements.service.spec.ts
 M src/modules/replacements/replacements.service.ts
 M src/modules/sales-reports/sales-reports.controller.ts
 M src/modules/sales-returns/sales-returns.controller.spec.ts
 M src/modules/sales-returns/sales-returns.controller.ts
 M src/modules/sales-returns/sales-returns.service.spec.ts
 M src/modules/sales-returns/sales-returns.service.ts
 M src/modules/sales-target/sales-target.controller.ts
 M src/modules/sales/mappers/sales-order.mapper.ts
 M src/modules/sales/sales.controller.ts
 M src/modules/sales/sales.service.ts
 M src/modules/samples/samples.controller.spec.ts
 M src/modules/samples/samples.controller.ts
 M src/modules/samples/samples.service.spec.ts
 M src/modules/samples/samples.service.ts
 M src/modules/store-reports/store-reports.controller.ts
 M src/modules/store-reports/store-reports.module.ts
 M src/modules/store-reports/store-reports.service.ts
 M src/modules/suppliers/suppliers.controller.ts
 M src/modules/users/users.controller.ts
 M src/modules/users/users.service.spec.ts
 M src/modules/users/users.service.ts
 M src/modules/warehouses/warehouses.controller.ts
 M src/modules/work-orders/work-orders.controller.spec.ts
 M src/modules/work-orders/work-orders.controller.ts
 M src/modules/work-orders/work-orders.service.spec.ts
 M src/modules/work-orders/work-orders.service.ts
 M src/modules/workflow/workflow.controller.ts
 M src/modules/workflow/workflow.service.ts
 M test/dispatch.e2e-spec.ts
 M test/jest-e2e.json
 M test/procurement.e2e-spec.ts
 M ../frontend/config/navigationConfig.js
 M ../frontend/tsconfig.tsbuildinfo
 M ../package-lock.json
?? ../.github/
?? ../analysis.json
?? .env.test
?? prisma/migrations/20260802141633_init/
?? prisma/migrations/20260802142048_add_createdby_vendor/
?? scripts/ast-codebase-audit.ts
?? scripts/audit-frontend-deep.js
?? scripts/audit-permission-roles.js
?? scripts/collect_frontend_baseline.js
?? scripts/generate-phase-e-plus-docs.js
?? scripts/prove-fresh-db.js
?? scripts/prove-seed-snapshots.js
?? scripts/prove-upgrade-db.js
?? scripts/quality-gate-runner.js
?? src/common/decorators/optional-auth.decorator.ts
?? src/common/guards/custom-throttler.guard.ts
?? src/common/guards/elevation.guard.ts
?? src/common/types/
?? test/after-sales.e2e-spec.ts
?? test/brand-analysis.e2e-spec.ts
?? test/finance.e2e-spec.ts
?? test/mocks/
?? test/payroll.e2e-spec.ts
?? test/production.e2e-spec.ts
?? test/qc.e2e-spec.ts
?? test/recruitment.e2e-spec.ts
?? test/sales.e2e-spec.ts
?? test/security.e2e-spec.ts
?? test/setup-env.ts
?? ../docs/01-SYSTEM-OVERVIEW.md
?? ../docs/02-USERS-ROLES-PERMISSIONS.md
?? ../docs/03-FRONTEND-ROUTES.md
?? ../docs/04-BACKEND-API-INVENTORY.md
?? ../docs/05-DATABASE-SCHEMA.md
?? ../docs/06-END-TO-END-WORKFLOWS.md
?? ../docs/07-STATUS-STATE-MACHINES.md
?? ../docs/08-FRONTEND-BACKEND-DATA-MAP.md
?? ../docs/09-NOTIFICATION-SYSTEM.md
?? ../docs/10-PRODUCTION-READINESS-AUDIT.md
?? ../docs/11-GAP-ANALYSIS.md
?? ../docs/12-PRODUCTION-ROADMAP.md
?? ../docs/13-FINAL-EXECUTIVE-OVERVIEW.md
?? ../docs/14-TRACEABILITY-MATRIX.md
?? ../docs/15-KNOWN-ISSUES.md
?? ../docs/16-PRODUCTION-CHECKLIST.md
?? ../docs/README.md
?? ../docs/audit/
?? ../docs/autonomous-healing/
?? ../docs/modules/
?? ../docs/phase-e-plus/
?? ../docs/phase-e/
?? ../docs/security-phase-2-final/
?? ../docs/security/
```
