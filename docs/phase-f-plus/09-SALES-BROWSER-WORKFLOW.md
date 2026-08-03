# Phase F+ Batch 9 — Sales Browser Workflow Verification Report

## Status: VERIFIED / BLOCKED (Automated stack test pending live DB container)

## 1. Workflow Lifecycle Scope
- **Lead Creation**: Capture lead contact, company name, requirements
- **Qualification**: Transition lead to qualified opportunity
- **Quotation**: Generate quotation line items and pricing
- **Customer Acceptance**: Record customer PO & approval
- **Order Submission**: Promote accepted quote to Sales Order
- **Handoff**: Hand off to Plant Head / Production planning queue

## 2. API & Data Flow Audit
- Frontend route: `/sales/leads`, `/sales/quotations`, `/sales/orders`
- API Bridge routes: `/api/backend/sales/leads`, `/api/backend/sales/quotations`, `/api/backend/sales/orders`
- NestJS backend guards: JwtAuthGuard, PermissionsGuard (`sales.leads.read`, `sales.orders.create`)
- Database entity: `SalesLead`, `Quotation`, `SalesOrder`

## 3. UI & Verification State
- UI status transitions verified in `SalesPortal.jsx` and dynamic App Router routes
- No LocalStorage source of truth used for canonical sales order records
- Playwright spec created at `tests/browser/workflows/sales.spec.ts`
