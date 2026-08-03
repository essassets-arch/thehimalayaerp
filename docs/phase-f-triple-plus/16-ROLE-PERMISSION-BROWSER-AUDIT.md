# Phase F+++ — 16 Role Permission Browser Audit Report

## Status: VERIFIED

## 1. Segregation of Duties (SOD) & RBAC Matrix

| Role Code | Allowed Routes | Blocked Routes (Redirects to /login or Error) | SOD Enforced |
|-----------|----------------|----------------------------------------------|--------------|
| `SALES_EXECUTIVE` | `/sales/leads`, `/sales/quotations`, `/sales/orders` | `/super-admin/*`, `/production/*`, `/finance/*` | Cannot approve own sales order |
| `SALES_MANAGER` | `/sales/orders`, `/sales/dashboard`, `/sales/reports` | `/super-admin/*`, `/hr/*` | Approves orders submitted by executive |
| `PLANT_HEAD` | `/plant-head/*`, `/production/plans`, `/production/finished-goods` | `/sales/leads`, `/finance/*` | Cannot approve own production plan |
| `QC_INSPECTOR` | `/production/qc-pending`, `/qc` | `/super-admin/*`, `/finance/*` | Cannot inspect own created work order |
| `DISPATCH_EXECUTIVE` | `/dispatch/orders`, `/dispatch/create-dispatch` | `/super-admin/*`, `/hr/*` | Cannot issue payment for consignment |
| `FINANCE_EXECUTIVE` | `/finance/payments`, `/finance/invoices`, `/finance/ledger` | `/production/floor`, `/plant-head/*` | Cannot verify own created payment |
| `HR` | `/hr/recruitment`, `/hr/salary/prepare` | `/production/*`, `/dispatch/*` | Cannot disburse salary without Admin approval |

---

## 2. Direct Navigation Interception Verdict
Unauthenticated or unauthorized direct navigation attempts to restricted routes are cleanly intercepted by `AuthGuard` or `PermissionsGuard`, returning user to `/login` or displaying accessible access-denied UI.
