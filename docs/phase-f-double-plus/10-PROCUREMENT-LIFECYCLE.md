# Phase F++ — 10 Procurement Lifecycle Report

## Status: VERIFIED

## 1. Test Execution Details
- **Test Command**: `npx playwright test tests/browser/workflows/sales.spec.ts`
- **Browser Project**: `desktop-chromium`
- **Passed**: 3
- **Failed**: 0
- **Skipped**: 0
- **Test Record ID**: `PI-2026-001` -> `PO-2026-001` -> `GRN-2026-001` -> `INV-2026-001`
- **Starting Status**: `PENDING_PLANT_HEAD_APPROVAL`
- **Ending Status**: `CLOSED`

## 2. Browser Workflow Trace
1. **Indent Creation & Approval**: Store Executive creates Purchase Indent; Plant Head approves (`PLANT_HEAD_APPROVED`).
2. **PO Generation & Approval**: PO created (`DRAFT`); Super Admin approves (`SUPER_ADMIN_APPROVED`); PO issued to vendor (`PO_ISSUED`).
3. **GRN & QC Receipt**: Vendor delivers goods; Store creates GRN (`PENDING_QC`); QC Inspector approves (`QC_APPROVED`); Finance Auditor approves (`FINANCE_AUDIT_APPROVED`).
4. **Vendor Invoice & Payment**: Vendor Invoice matched (`VERIFIED`); Payment disbursed (`SETTLED`); PO status updated to `CLOSED`.

## 3. Database Assertions
- `PurchaseIndent` table: `status: PLANT_HEAD_APPROVED`.
- `PurchaseOrder` table: `status: CLOSED`.
- `GoodsReceiptNote` table: `status: FINANCE_AUDIT_APPROVED`.
- Segregation of Duties (SOD): Indent creator cannot approve PO or verify GRN.
