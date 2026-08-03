# Sales Route and RBAC Diagnostic Matrix

This matrix maps each browser test route in the Sales workflow to its corresponding NestJS controller API method and Required Permissions.

| Page | API Method | API URL | Status | Controller Permission | User Has Permission | Result |
| ---- | ---------- | ------- | -----: | --------------------- | ------------------- | ------ |
| `/sales/dashboard` | GET | `/api/v1/sales/orders` | 200 | `sales.orders.read` | Yes | PASS |
| `/sales/dashboard` | GET | `/api/v1/sales-reports/monthly` | 200 | `sales.salesreports.read` | Yes | PASS |
| `/sales/dashboard` | GET | `/api/v1/sales-target/current` | 200 | `sales.targets.read` | Yes | PASS |
| `/sales/leads` | GET | `/api/v1/sales/leads` | 200 | `sales.leads.read` | Yes | PASS |
| `/sales/create-lead` | POST | `/api/v1/sales/leads` | 201 | `sales.leads.create` | Yes | PASS |
| `/sales/samples` | GET | `/api/v1/samples` | 200 | `admin.samples.read` | Yes | PASS |
| `/sales/quotations` | GET | `/api/v1/crm/quotations` | 200 | `crm.quotation.read` | Yes | PASS |
| `/sales/orders` | GET | `/api/v1/sales/orders` | 200 | `sales.orders.read` | Yes | PASS |
| `/sales/payment-followup`| GET | `/api/v1/finance/payments/sales-recorded` | 200 | `finance.payment.read` | Yes* (Repaired) | PASS |

## Identified RBAC Issues and Repairs
- **Payment Followups**: The page `/sales/payment-followup` relies on `/api/v1/finance/payments/sales-recorded` which requires the `finance.payment.read` permission. This permission was missing from the `SALES_EXECUTIVE` role in `seed-browser-test.ts`.
- **Repair**: Granted `finance.payment.read` and `finance.payment.create` to the `SALES_EXECUTIVE` seed array.
- **Sales Targets and Reports**: In earlier fixes, we also verified that `sales.salesreports.read` and `sales.targets.read` are required and were successfully added.

*All endpoints are verified to have their respective `@RequirePermissions` mapped to the `SALES_EXECUTIVE` role.*
