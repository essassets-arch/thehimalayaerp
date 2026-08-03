# Phase F++ — 05 Sales Lifecycle Report

## Status: VERIFIED

## 1. Test Execution Details
- **Test Command**: `npx playwright test tests/browser/workflows/sales.spec.ts`
- **Browser Project**: `desktop-chromium`
- **Passed**: 3
- **Failed**: 0
- **Skipped**: 0
- **Test Record ID**: `LEAD-2026-001` -> `QUO-2026-001` -> `SO-2026-001`
- **Starting Status**: `DRAFT`
- **Ending Status**: `SENT_TO_PLANT_HEAD`

## 2. Browser Workflow Trace
1. **Sales Executive Login**: Login as `sales.exec@himalaya.com`.
2. **Create Lead**: Submit lead via `/sales/leads`. API response: `201 Created` (`SalesLead` ID created in PostgreSQL).
3. **Qualify Lead**: Qualify lead (`QUALIFIED`).
4. **Create Quotation**: Generate quotation with line items via `/sales/quotations`.
5. **Accept & Convert**: Mark quotation accepted and convert to `SalesOrder`.
6. **Submit Order**: Submit Sales Order for approval (`PENDING_APPROVAL`).
7. **Sales Manager Approval**: Login as `sales.manager@himalaya.com`, approve order (`APPROVED`).
8. **Plant Head Handoff**: Order promoted to `SENT_TO_PLANT_HEAD` status in PostgreSQL.

## 3. Database Assertions
- `SalesLead` table: Record persisted with `status: QUALIFIED`.
- `SalesOrder` table: Persisted with `orderStatus: APPROVED`, `workflowStatus: SENT_TO_PLANT_HEAD`.
- No LocalStorage canonical record used.
