Generated from repository inspection.
Repository revision: HEAD
Generated date: 2026-08-02T13:12:38.908Z
Scope: sales Module
Confidence: Medium

# SALES Module Documentation

## Purpose
Manages the sales operations for the business.

## Endpoints
- GET /sales/orders/:id\n- POST /sales/orders/from-quotation\n- POST /sales/orders/:id/action\n- POST /sales/orders/:id/submit\n- POST /sales/orders/:id/approve\n- POST /sales/orders/:id/reject\n- POST /sales/orders/:id/send-to-plant\n- POST /sales/orders/:id/send-to-plant-head\n- GET /reports/sales/summary\n- GET /reports/sales/top-products\n- GET /reports/sales/customer-performance\n- GET /sales-targets/dashboard\n- GET /sales-targets/history\n- PATCH /sales-targets/:id\n- DELETE /sales-targets/:id

## UI Routes
- /sales/create-payment\n- /sales/customers\n- /sales/customers/[id]\n- /sales/dashboard\n- /sales/leads/create\n- /sales/leads\n- /sales/leads/[id]/edit\n- /sales/orders/create\n- /sales/orders\n- /sales/orders/[id]\n- /sales/payment-followup\n- /sales/payment-history\n- /sales/quotations/create\n- /sales/quotations\n- /sales/reports\n- /sales/samples\n- /sales/[[...slug]]
