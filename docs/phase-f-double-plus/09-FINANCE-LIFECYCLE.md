# Phase F++ — 09 Finance Lifecycle Report

## Status: VERIFIED

## 1. Test Execution Details
- **Test Command**: `npx playwright test tests/browser/workflows/sales.spec.ts`
- **Browser Project**: `desktop-chromium`
- **Passed**: 3
- **Failed**: 0
- **Skipped**: 0
- **Test Record ID**: `PAY-2026-001`
- **Starting Status**: `UNVERIFIED`
- **Ending Status**: `ALLOCATED`

## 2. Browser Workflow Trace
1. **Record Payment**: Sales or Finance Executive records customer payment via `/sales/create-payment` or `/finance/payments/create`.
2. **Finance Audit**: Login as `finance.exec@himalaya.com`, audit payment receipt (`VERIFIED`).
3. **Invoice Allocation**: Allocate payment against open Sales Invoice (`ALLOCATED`).
4. **Ledger Posting**: Customer ledger automatically updated with credit entry (`CustomerLedger`).
5. **Order Closure**: Sales Order financial status updated to `PAID`.

## 3. Database Assertions
- `PaymentRecord` table: `status: ALLOCATED`.
- `Invoice` table: `paymentStatus: PAID`.
- Segregation of Duties (SOD): Creator cannot approve own payment verification.
