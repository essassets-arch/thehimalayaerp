# 00 — System Baseline Snapshot

## 1. Environment & Version Information

- **Git Branch**: `main`
- **Git Commit SHA**: `f3f1d20f11899b76357dac4166350edfdeb3eb1f`
- **Node.js Version**: `v20.16.0`
- **npm Version**: `10.8.1`
- **NestJS Core Version**: `^11.0.1`
- **Prisma ORM Version**: `^5.22.0`
- **Target Database URL**: PostgreSQL (`himalaya_erp_dev` / `himalaya_erp_test`)

---

## 2. Codebase & Schema Statistics

- **Controllers Count**: 43
- **Services Count**: 47
- **Test Spec Files Count**: 30
- **Prisma Models Count**: 116
- **Seeded Roles Count**: 79
- **Seeded Unique Permissions Count**: 1
- **Migration Folders Count**: 2

---

## 3. Migration Directories List

- `prisma/migrations/20260802141633_init`
- `prisma/migrations/20260802142048_add_createdby_vendor`

---

## 4. Git Uncommitted Status Snapshot

```text
M backend/package.json
 D backend/prisma/migrations/20260728190000_unified_crm_sales_lifecycle/migration.sql
 D backend/prisma/migrations/20260728203000_invoice_commercial_snapshot/migration.sql
 D backend/prisma/migrations/20260728204500_payment_verification/migration.sql
 D backend/prisma/migrations/20260728210000_work_order_item_traceability/migration.sql
 D backend/prisma/migrations/20260728213000_lead_detailed_items/migration.sql
 D backend/prisma/migrations/20260728214500_lead_company_gst_details/migration.sql
 D backend/prisma/migrations/20260728230000_grant_plant_head_sales_order_read/migration.sql
 D backend/prisma/migrations/20260728233000_plant_head_pending_planning/migration.sql
 D backend/prisma/migrations/20260729152000_link_customer_payment_to_sales_order/migration.sql
 D backend/prisma/migrations/20260729154000_add_customer_payment_proof/migration.sql
 D backend/prisma/migrations/20260729160000_grant_finance_role_permissions/migration.sql
 D backend/prisma/migrations/20260729173000_persist_material_request_workflow/migration.sql
 D backend/prisma/migrations/20260729180000_material_request_full_backend_state/migration.sql
 D backend/prisma/migrations/20260729190000_recruitment_workflow/migration.sql
 D backend/prisma/migrations/20260729203000_add_employee_registration/migration.sql
 D backend/prisma/migrations/20260729220000_add_dynamic_payroll/migration.sql
 D backend/prisma/migrations/20260729233000_add_salary_slip_sharing/migration.sql
 D backend/prisma/migrations/20260730010000_procure_to_pay_core/migration.sql
 D backend/prisma/migrations/20260730020000_vendor_invoice_and_payment/migration.sql
 D backend/prisma/migrations/20260730030000_procurement_final_alignment/migration.sql
 D backend/prisma/migrations/20260730110000_procurement_delivery_rejection_replacement/migration.sql
 D backend/prisma/migrations/20260730150000_add_brand_analysis_workflow/migration.sql
 D backend/prisma/migrations/20260730160000_remove_legacy_brand_analysis/migration.sql
 D backend/prisma/migrations/20260731120000_customer_complaint_management/migration.sql
 M backend/prisma/migrations/migration_lock.toml
 M backend/prisma/schema.prisma
 M backend/prisma/seed.ts
 M backend/src/app.controller.spec.ts
 M backend/src/app.controller.ts
 M backend/src/app.module.ts
 M backend/src/common/decorators/current-user.decorator.ts
 M backend/src/common/decorators/permissions.decorator.ts
 M backend/src/common/filters/all-exceptions.filter.ts
 M backend/src/common/guards/jwt-auth.guard.ts
 M backend/src/common/guards/permissions.guard.ts
 M backend/src/common/guards/roles.guard.ts
 M backend/src/common/utils/rbac.util.ts
 M backend/src/modules/attachments/attachments.controller.spec.ts
 M backend/src/modules/attachments/attachments.controller.ts
 M backend/src/modules/attachments/attachments.service.spec.ts
 M backend/src/modules/audit/audit.controller.ts
 M backend/src/modules/audit/audit.service.spec.ts
 M backend/src/modules/auth/auth.controller.spec.ts
 M backend/src/modules/auth/auth.controller.ts
 M backend/src/modules/auth/auth.module.ts
 M backend/src/modules/auth/auth.service.spec.ts
 M backend/src/modules/auth/auth.service.ts
 M backend/src/modules/auth/strategies/jwt.strategy.ts
 M backend/src/modules/brand-analysis/brand-analysis-upload.controller.ts
 M backend/src/modules/brand-analysis/brand-analysis.controller.ts
 M backend/src/modules/comments/comments.controller.spec.ts
 M backend/src/modules/comments/comments.controller.ts
 M backend/src/modules/comments/comments.service.spec.ts
 M backend/src/modules/crm/crm-insights.controller.ts
 M backend/src/modules/crm/leads.controller.ts
 M backend/src/modules/crm/leads.service.ts
 M backend/src/modules/crm/sales-reminders.controller.ts
 M backend/src/modules/customer-complaints/customer-complaints.controller.spec.ts
 M backend/src/modules/customer-complaints/customer-complaints.controller.ts
 M backend/src/modules/customer-complaints/customer-complaints.service.spec.ts
 M backend/src/modules/customers/customers.controller.spec.ts
 M backend/src/modules/customers/customers.controller.ts
 M backend/src/modules/customers/customers.service.spec.ts
 M backend/src/modules/dispatch/dispatch.controller.ts
 M backend/src/modules/dispatch/dispatch.service.ts
 M backend/src/modules/dispatch/dto/create-dispatch.dto.ts
 M backend/src/modules/employees/employees.controller.ts
 M backend/src/modules/finance/invoices.controller.ts
 M backend/src/modules/finance/ledger.controller.ts
 M backend/src/modules/finance/payments.controller.ts
 M backend/src/modules/health/health.controller.spec.ts
 M backend/src/modules/health/health.controller.ts
 M backend/src/modules/inventory/inventory.controller.ts
 M backend/src/modules/material-requests/material-requests.controller.ts
 M backend/src/modules/material-requests/material-requests.service.ts
 M backend/src/modules/notifications/notifications.controller.spec.ts
 M backend/src/modules/notifications/notifications.controller.ts
 M backend/src/modules/notifications/notifications.service.spec.ts
 M backend/src/modules/payroll/payroll.controller.ts
 M backend/src/modules/payroll/payroll.service.ts
 M backend/src/modules/plant-head/plant-head.controller.ts
 M backend/src/modules/plant-head/plant-head.service.ts
 M backend/src/modules/procurement/procurement-closure.service.ts
 M backend/src/modules/procurement/procurement.controller.ts
 M backend/src/modules/procurement/procurement.service.ts
 M backend/src/modules/production/production-testing.controller.ts
 M backend/src/modules/production/production-workflow.controller.ts
 M backend/src/modules/production/production-workflow.service.ts
 M backend/src/modules/production/production.controller.spec.ts
 M backend/src/modules/production/production.controller.ts
 M backend/src/modules/production/production.module.ts
 M backend/src/modules/production/production.service.spec.ts
 M backend/src/modules/products/products.controller.ts
 M backend/src/modules/qc/qc.controller.ts
 M backend/src/modules/qc/qc.service.ts
 M backend/src/modules/quotations/quotations.controller.ts
 M backend/src/modules/recruitment/recruitment.controller.ts
 M backend/src/modules/recruitment/recruitment.service.ts
 M backend/src/modules/replacements/replacements.controller.spec.ts
 M backend/src/modules/replacements/replacements.controller.ts
 M backend/src/modules/replacements/replacements.service.spec.ts
 M backend/src/modules/replacements/replacements.service.ts
 M backend/src/modules/sales-reports/sales-reports.controller.ts
 M backend/src/modules/sales-returns/sales-returns.controller.spec.ts
 M backend/src/modules/sales-returns/sales-returns.controller.ts
 M backend/src/modules/sales-returns/sales-returns.service.spec.ts
 M backend/src/modules/sales-returns/sales-returns.service.ts
 M backend/src/modules/sales-target/sales-target.controller.ts
 M backend/src/modules/sales/mappers/sales-order.mapper.ts
 M backend/src/modules/sales/sales.controller.ts
 M backend/src/modules/sales/sales.service.ts
 M backend/src/modules/samples/samples.controller.spec.ts
 M backend/src/modules/samples/samples.controller.ts
 M backend/src/modules/samples/samples.service.spec.ts
 M backend/src/modules/samples/samples.service.ts
 M backend/src/modules/store-reports/store-reports.controller.ts
 M backend/src/modules/store-reports/store-reports.module.ts
 M backend/src/modules/store-reports/store-reports.service.ts
 M backend/src/modules/suppliers/suppliers.controller.ts
 M backend/src/modules/users/users.controller.ts
 M backend/src/modules/users/users.service.spec.ts
 M backend/src/modules/users/users.service.ts
 M backend/src/modules/warehouses/warehouses.controller.ts
 M backend/src/modules/work-orders/work-orders.controller.spec.ts
 M backend/src/modules/work-orders/work-orders.controller.ts
 M backend/src/modules/work-orders/work-orders.service.spec.ts
 M backend/src/modules/work-orders/work-orders.service.ts
 M backend/src/modules/workflow/workflow.controller.ts
 M backend/src/modules/workflow/workflow.service.ts
 M backend/test/dispatch.e2e-spec.ts
 M backend/test/jest-e2e.json
 M backend/test/procurement.e2e-spec.ts
 M package-lock.json
?? .github/
?? analysis.json
?? backend/.env.test
?? backend/prisma/migrations/20260802141633_init/
?? backend/prisma/migrations/20260802142048_add_createdby_vendor/
?? backend/src/common/guards/custom-throttler.guard.ts
?? backend/src/common/guards/elevation.guard.ts
?? backend/src/common/types/
?? backend/test/mocks/
?? backend/test/security.e2e-spec.ts
?? backend/test/setup-env.ts
?? docs/01-SYSTEM-OVERVIEW.md
?? docs/02-USERS-ROLES-PERMISSIONS.md
?? docs/03-FRONTEND-ROUTES.md
?? docs/04-BACKEND-API-INVENTORY.md
?? docs/05-DATABASE-SCHEMA.md
?? docs/06-END-TO-END-WORKFLOWS.md
?? docs/07-STATUS-STATE-MACHINES.md
?? docs/08-FRONTEND-BACKEND-DATA-MAP.md
?? docs/09-NOTIFICATION-SYSTEM.md
?? docs/10-PRODUCTION-READINESS-AUDIT.md
?? docs/11-GAP-ANALYSIS.md
?? docs/12-PRODUCTION-ROADMAP.md
?? docs/13-FINAL-EXECUTIVE-OVERVIEW.md
?? docs/14-TRACEABILITY-MATRIX.md
?? docs/15-KNOWN-ISSUES.md
?? docs/16-PRODUCTION-CHECKLIST.md
?? docs/README.md
?? docs/audit/
?? docs/modules/
?? docs/phase-e/
?? docs/security-phase-2-final/
?? docs/security/
```
