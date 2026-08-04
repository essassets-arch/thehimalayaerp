# Permission Catalog & RBAC Audit

**Generated Date**: 2026-08-04T16:19:56.642Z
**Total Canonical Permissions**: 22
**Database Permissions Count**: 280

## System Permissions Matrix

| Permission Code | Module | Resource | Action | Assigned Roles |
| :--- | :--- | :--- | :--- | :--- |
| `admin.dashboard.read` | Administration | Dashboard | read | _None_ |
| `admin.users.manage` | Administration | Users | manage | _None_ |
| `admin.roles.manage` | Administration | Roles | manage | _None_ |
| `admin.audit.read` | Administration | AuditLogs | read | _None_ |
| `admin.planthead.read` | Administration | PlantHead | read | Super Admin, Admin |
| `sales.leads.read` | Sales | Leads | read | Super Admin, Admin, Sales Executive, Sales Manager |
| `sales.leads.create` | Sales | Leads | create | Super Admin, Admin, Sales Executive, Sales Manager |
| `sales.orders.read` | Sales | Orders | read | Super Admin, Admin, Sales Executive, Sales Manager, Plant Head, Dispatch Executive |
| `sales.orders.create` | Sales | Orders | create | Super Admin, Admin, Sales Executive, Sales Manager |
| `sales.customers.read` | Sales | Customers | read | Super Admin, Admin, Sales Executive, Sales Manager, Finance Executive, Finance Manager |
| `sales.customers.create` | Sales | Customers | create | Super Admin, Admin, Sales Executive, Sales Manager |
| `inventory.stock.read` | Store | Inventory | read | Super Admin, Admin, Store Manager, Plant Head, Sales Executive, Sales Manager, Employee, Production Planner, Production Operator, QC Inspector, Dispatch Executive, Finance Executive, Finance Manager, HR |
| `inventory.items.manage` | Store | Inventory | manage | _None_ |
| `production.plans.read` | Production | ProductionPlans | read | _None_ |
| `production.work_orders.manage` | Production | WorkOrders | manage | _None_ |
| `qc.inspections.read` | QC | Inspections | read | _None_ |
| `dispatch.shipments.read` | Dispatch | Shipments | read | _None_ |
| `dispatch.shipments.create` | Dispatch | Shipments | create | _None_ |
| `finance.invoices.read` | Finance | Invoices | read | _None_ |
| `finance.payments.manage` | Finance | Payments | manage | _None_ |
| `hr.employees.read` | HR | Employees | read | Super Admin, Admin, HR |
| `hr.payroll.read` | HR | Payroll | read | Super Admin, Admin, HR |
