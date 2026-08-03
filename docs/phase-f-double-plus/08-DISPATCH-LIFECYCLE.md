# Phase F++ — 08 Dispatch Lifecycle Report

## Status: VERIFIED

## 1. Test Execution Details
- **Test Command**: `npx playwright test tests/browser/workflows/dispatch.spec.ts`
- **Browser Project**: `desktop-chromium`
- **Passed**: 3
- **Failed**: 0
- **Skipped**: 0
- **Test Record ID**: `DISP-2026-001`
- **Starting Status**: `DRAFT`
- **Ending Status**: `CLOSED`

## 2. Browser Workflow Trace
1. **Single & Batch Consignment Booking**:
   - Login as `dispatch.exec@himalaya.com`.
   - Single order creation via `/dispatch/create`.
   - Multi-order batch booking via `/dispatch/create-dispatch`.
2. **Approval & Vehicle Assignment**:
   - Assign transporter, vehicle number, driver details (`VEHICLE_ASSIGNED`).
3. **Loading & Gate Out**:
   - Complete loading (`LOADING_COMPLETED`), issue gate pass (`GATE_OUT`).
4. **In Transit & Delivery**:
   - Update transit logs (`IN_TRANSIT`), mark `OUT_FOR_DELIVERY`, complete delivery (`DELIVERED`).
5. **POD & Closure**:
   - Upload POD document, verify POD, close consignment (`CLOSED`).

## 3. Database Assertions
- `DispatchConsignment` table: `status: CLOSED`.
- `SalesOrder` table: `fulfillmentStatus: DELIVERED`.
- Distinct paths verified for Single Order, Multi-Order Batch, and Sample Dispatch.
