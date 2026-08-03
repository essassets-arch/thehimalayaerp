# 03. API Security Map

This document outlines the final mapping of NestJS controllers to their globally enforced permissions after the automated security hardening pass.

All private routes are now protected by `JwtAuthGuard` and `PermissionsGuard` at the controller level.

## Sales and CRM
- `/sales/customers` → `sales.customers.read`, `sales.customers.create`, `sales.customers.update`
- `/sales/orders` → `sales.orders.read`, `sales.orders.create`, `sales.orders.update`, `sales.orders.approve`
- `/sales-targets` → `sales.targets.read`, `sales.targets.create`, `sales.targets.update`, `sales.targets.delete`
- `/quotations` → `crm.quotation.read`, `crm.quotation.create`, `crm.quotation.update`
- `/leads` → Various lead management permissions

## Production and Inventory
- `/production/plans` → `production.plan.read`, `production.plan.create`, `production.plan.approve`
- `/production/work-orders` → `production.workorder.read`, `production.workorder.start`, `production.workorder.complete`
- `/inventory` → `inventory.read`, `inventory.transaction.create`
- `/qc` → `qc.inspections.read`, `qc.inspections.start`, `qc.inspections.approve`

## Procurement and Finance
- `/procurement/purchase-orders` → `procurement.po.read`, `procurement.po.create`, `procurement.po.approve`
- `/finance/invoices` → `finance.invoice.read`, `finance.invoice.create`
- `/finance/payments` → `finance.payment.read`, `finance.payment.record`, `finance.payment.verify`

## HR and Payroll
- `/hr/employees` → `hr.employees.read`, `hr.employees.create`, `hr.employees.update`
- `/hr/recruitment-requests` → `hr.recruitment.requests.read.all`, `hr.recruitment.requests.create`, `hr.recruitment.requests.process`
- `/hr/payroll` → `hr.payroll.read`, `hr.payroll.prepare`, `superadmin.payroll.approve`, `finance.payroll.process`
- `/hr/salary-slips` → `salary_slips.read_all`, `salary_slips.read_own`
- `/hr/salary-slips/shared/:token` → `@Public()` (Publicly accessible with cryptographic token verification)

## Admin
- `/users` → `user.read`, `user.create`
- `/audit-logs` → `admin.audit.read`
