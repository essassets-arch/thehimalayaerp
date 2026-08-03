Generated from repository inspection.
Repository revision: HEAD
Generated date: 2026-08-02T13:12:38.912Z
Scope: finance Module
Confidence: Medium

# FINANCE Module Documentation

## Purpose
Manages the finance operations for the business.

## Endpoints
- GET /finance/invoices/:id\n- POST /finance/invoices/:id/action\n- POST /finance/invoices/:id/post\n- POST /finance/invoices/:id/cancel\n- POST /finance/invoices/:id/void\n- GET /finance/ledger/:customerId\n- GET /finance/payments/sales-recorded\n- GET /finance/payments/delivered-orders\n- GET /finance/payments/:id\n- POST /finance/payments/sales-record\n- POST /finance/payments/:id/submit-verification\n- POST /finance/payments/:id/verify\n- POST /finance/payments/:id/allocate\n- POST /finance/payments/:id/bounce

## UI Routes
- /finance/brand-analysis\n- /finance/invoices\n- /finance/invoices/[id]\n- /finance/ledger\n- /finance/payment-verification\n- /finance/payments/create\n- /finance/payments\n- /finance/payments/[id]\n- /finance/purchase-orders\n- /finance/purchase-orders/[id]/close\n- /finance/reports\n- /finance/salary/history\n- /finance/salary/history/[payrollId]/salary-slip\n- /finance/salary/paid\n- /finance/salary/pending\n- /finance/salary/processing\n- /finance/salary-disbursement\n- /finance/salary-history\n- /finance/salary-verification\n- /finance/[[...slug]]\n- /finance-executive/[[...slug]]
