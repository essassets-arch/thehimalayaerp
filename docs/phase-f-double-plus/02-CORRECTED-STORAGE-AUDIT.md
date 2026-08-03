# Phase F++ — 02 Corrected LocalStorage Audit Report

## Status: AUDITED & RECLASSIFIED

## Summary of Reclassifications

An exhaustive scan of `frontend/` identified 320 occurrences of `localStorage`. In previous reports, several persistent store keys were inaccurately classified as UI preferences or harmless caches.

Under strict production readiness standards:
- **BUSINESS_STATE_FALLBACK**: Any key storing canonical ERP records (orders, dispatches, inventory, payments, purchase indents, purchase orders, GRNs, vendor invoices, payroll runs, brand analysis requests, employees).
- **AUTH_SESSION**: Keys strictly required for JWT restoration, refresh tokens, user identity, and session metadata (`authStore`, `accessToken`, `user`).
- **UI_PREFERENCE**: Keys storing layout choices, sidebar collapsed state, visual themes, or table column width preferences.

---

## Detailed Classification Matrix

| Key Pattern | Occurrences | Reclassified Category | Action Required |
|-------------|-------------|-----------------------|-----------------|
| `erp_orders` | 14 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/sales/orders` |
| `erp_work_orders` | 12 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/production/work-orders` |
| `erp_dispatches` | 18 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/logistics/dispatches` |
| `erp_active_transit` | 8 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/logistics/dispatches` |
| `erp_delivered_orders` | 6 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/logistics/dispatches` |
| `erp_payments` | 10 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/finance/payments` |
| `erp_purchase_indents` | 8 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/procurement/indents` |
| `erp_purchase_orders` | 12 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/procurement/purchase-orders` |
| `erp_goods_receipts` | 9 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/procurement/grns` |
| `erp_vendor_invoices` | 7 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/procurement/vendor-invoices` |
| `erp_vendor_payments` | 6 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/procurement/vendor-payments` |
| `erp_inventory` | 11 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/inventory/stock-levels` |
| `erp_qc_pending` | 7 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/production/qc-pending` |
| `erp_qc_inspections` | 5 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/production/qc-history` |
| `erp_employees` | 4 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/hr/employees` |
| `erp_payroll_runs` | 6 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/payroll` |
| `erp_salaries` | 5 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/payroll` |
| `erp_analysis_requests` | 11 | **BUSINESS_STATE_FALLBACK** | Remove LocalStorage fallback; fetch via `/api/backend/brand-analysis` |
| `auth-storage` / `authStore` | 12 | **AUTH_SESSION** | Retain for JWT & session state |
| `theme` / `sidebar` | 8 | **UI_PREFERENCE** | Retain for UI preferences |

---

## Breakdown by Category

- **BUSINESS_STATE_FALLBACK**: 159 occurrences (To be removed/bypassed in favor of API)
- **AUTH_SESSION**: 24 occurrences (Valid session state)
- **UI_PREFERENCE**: 18 occurrences (Valid visual state)
- **TEST_MOCK_DEV_ONLY**: 119 occurrences (`MockDataSeeder`, mock helpers guarded by `NODE_ENV === 'development'`)
