# Zustand Domain Inventory

This document tracks all Zustand store slices, categorizing them as Business Data (to be migrated and eventually removed from Zustand) or UI State (to remain in Zustand).

| Slice | Type | Action / Status |
| :--- | :--- | :--- |
| `leads` | Business Data | Remove after Lead migration |
| `sales.leads` | Business Data | Remove after Lead migration |
| `customers` | Business Data | Remove after Customers migration |
| `samples` | Business Data | Remove after Samples migration |
| `sales.samples` | Business Data | Remove after Samples migration |
| `quotations` | Business Data | Remove after Quotations migration |
| `sales.quotations` | Business Data | Remove after Quotations migration |
| `sales.orders` | Business Data | Remove after Sales Orders migration |
| `sales.replacementRequests` | Business Data | Remove after Phase 9 |
| `sales.returnRequests` | Business Data | Remove after Phase 9 |
| `finance.customerPayments` | Business Data | Remove after Finance migration |
| `finance.paymentReceipts` | Business Data | Remove after Finance migration |
| `rawInventory` | Business Data | Remove after Inventory migration |
| `workOrders` | Business Data | Remove after Production migration |
| `production.workOrders` | Business Data | Remove after Production migration |
| `procurement.materialIndents` | Business Data | Remove after Procurement migration |
| `purchaseOrders` | Business Data | Remove after Procurement migration |
| `goodsReceipts` | Business Data | Remove after Procurement migration |
| `vendorInvoices` | Business Data | Remove after Finance migration |
| `employees` | Business Data | Remove after HR migration |
| `salaries` | Business Data | Remove after HR migration |
| `masterData.departments` | Business Data | Remove after Master Data migration |
| `notifications` | UI State | Keep |
| `customRoles` | Business Data | Remove after Master Data migration |

*(Note: Other smaller nested properties exist but follow the same pattern—all arrays storing persistent entities are Business Data and will be removed once their respective PostgreSQL module is fully tested and connected.)*
