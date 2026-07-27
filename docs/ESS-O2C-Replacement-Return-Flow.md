# ESS Sales Order, Replacement, and Return Flow

This document describes the implemented, store-backed flow verified by
`scripts/ESS-All-O2C-Flow-Test.ts`.

## Canonical data model

The sales order is created once in `state.sales.orders`. Downstream records in
production, dispatch, payments, replacements, and returns reference the same
canonical `orderId`; they do not copy the sales order.

The order does not use one generic `order.status`. Each workflow dimension has
its own field:

| Status dimension | Order field | Example |
| --- | --- | --- |
| Commercial | `order.commercialStatus` | `ORDER_CONFIRMED` |
| Planning | `order.planningStatus` | `PENDING_ACCEPTANCE` |
| Production | `order.productionStatus` | `WORK_ORDER_CREATED` |
| Quality | `order.qcStatus` | `QC_APPROVED` |
| Dispatch | `order.dispatchStatus` | `DISPATCH_CREATED` |
| Payment | `order.paymentStatus` | `FULLY_PAID` |

| Domain | Store collection | Canonical link |
| --- | --- | --- |
| Lead | `state.sales.leads` | `lead.id` |
| Quotation | `state.sales.quotations` | `leadId` |
| Order | `state.sales.orders` | `quotationId` |
| Work order | `state.production.workOrders` | `orderId` |
| QC record | `state.production.qcRecords` | `orderId` |
| Finished goods | `state.production.finishedGoods` | `orderId` |
| Dispatch queue | `state.dispatch.dispatchOrders` | `orderId` |
| Consignment | `state.dispatch.consignments` | `orderId` |
| Payment confirmation | `state.sales.paymentConfirmations` | `orderId` |
| Replacement | `state.sales.replacementRequests` | `orderId` |
| Return | `state.sales.returnRequests` | `orderId` |

## Main order-to-cash flow

1. Sales creates a lead at `/sales/create-lead`. The lead starts at
   `LEAD_CREATED`.
2. A sample is optional. Its dispatch lifecycle is
   `SAMPLE_DISPATCH_REQUESTED → SAMPLE_DISPATCHED → SAMPLE_IN_TRANSIT →
   SAMPLE_DELIVERED`. Testing time starts after confirmed delivery.
3. Sales creates, sends, and records customer acceptance of a quotation:
   `QUOTATION_DRAFT → QUOTATION_SENT → CUSTOMER_ACCEPTED`.
4. `convertQuotationToOrder(quotationId)` creates one order and marks the
   quotation `CONVERTED_TO_ORDER`. Repeating conversion returns the same order.
5. The new order starts with `ORDER_CONFIRMED`, `NOT_SENT`, `NOT_STARTED`,
   `NOT_READY`, `NOT_READY`, and `NOT_DUE` across its commercial, planning,
   production, QC, dispatch, and payment statuses.
6. `sendOrderToPlantHead(orderId)` changes commercial/planning state to
   `SENT_TO_PLANT_HEAD` and `PENDING_ACCEPTANCE`.
7. The plant head accepts the order:
   `PENDING_ACCEPTANCE → PLANT_HEAD_ACCEPTED`. Planning then changes
   `PLANT_HEAD_ACCEPTED → PRODUCTION_PLANNED`.
8. Production creates one idempotent work order, starts production, and records
   produced line quantities. The complete production sequence is
   `NOT_STARTED → WORK_ORDER_CREATED → PRODUCTION_STARTED →
   PRODUCTION_COMPLETED`. The work order and canonical sales order retain
   matching lifecycle state.
9. QC begins only after production. Its normal sequence is
   `NOT_READY → QC_PENDING → QC_APPROVED`. QC records produced, approved, and
   rejected quantities per order line. Optional non-success outcomes are
   `QC_PARTIALLY_APPROVED`, `QC_REWORK_REQUIRED`, and `QC_REJECTED`. Only
   approved line quantity enters finished goods.
10. Finished goods move from `READY_FOR_DISPATCH → SENT_TO_DISPATCH`. The
    dispatch queue moves from `READY_FOR_DISPATCH → DISPATCH_CREATED`, and the
    consignment continues through `IN_TRANSIT → DELIVERED`. Delivery updates
    both the consignment and canonical order; the order becomes `DELIVERED` and
    `ORDER_ACTIVE`. Finished-goods and dispatch-queue statuses remain on their
    respective records. `Ready for Dispatch` may be shown for the sales order
    as a derived UI label, but it is not a separate writable order status.
11. Sales records each payment confirmation as
    `FINANCE_VERIFICATION_PENDING`.
12. Finance can verify the confirmation:
    `FINANCE_VERIFICATION_PENDING → FINANCE_VERIFIED`. The order payment state
    is derived from the sum of verified confirmations:
    - a positive verified amount below `grandTotal` produces `PARTIALLY_PAID`;
    - a verified amount equal to or above `grandTotal` produces `FULLY_PAID`.

    The order closes only when:

    ```text
    order.dispatchStatus === "DELIVERED" &&
    verifiedPaidAmount >= order.grandTotal
    ```

    Re-verification is idempotent.
13. Finance can instead reject a pending confirmation:
    `FINANCE_VERIFICATION_PENDING → FINANCE_REJECTED`. Rejection does not
    increase the verified total, preserves Finance remarks, and re-enables Sales
    payment submission when no other confirmation is pending. After rejection,
    payment state is recalculated:
    - no verified amount after delivery produces `PAYMENT_DUE`;
    - some verified amount produces `PARTIALLY_PAID`;
    - another pending confirmation produces `FINANCE_VERIFICATION_PENDING`.

    `NOT_DUE` is not valid after delivery.

The exact payment-action rule is:

```text
canAskForPayment =
  order.dispatchStatus === "DELIVERED" &&
  order.paymentStatus !== "FULLY_PAID" &&
  !hasPendingFinanceConfirmation(order.id)
```

Therefore, a partially paid order shows `Ask for Payment`, `Ask for
Replacement`, and `Ask for Return` only when no other Finance confirmation is
pending.

## Replacement flow

Replacement is an after-sales workflow and does not reopen or overwrite the
closed order:

`REPLACEMENT_REQUESTED → REPLACEMENT_APPROVED → REPLACEMENT_DISPATCHED →
REPLACEMENT_IN_TRANSIT → REPLACEMENT_DELIVERED`

Sales starts it from a delivered order, the plant head approves it, and dispatch
delivers it. The original order remains `DELIVERED`, `FULLY_PAID`, and
`ORDER_CLOSED`.

## Return flow

Return is independent of payment closure:

`RETURN_REQUESTED → RETURN_APPROVED → RETURN_PICKUP_ASSIGNED →
RETURN_IN_TRANSIT → RETURN_RECEIVED`

Sales requests the return, the plant head approves it, dispatch assigns pickup,
and the factory confirms receipt. Receipt does not modify the order's dispatch,
payment, or commercial status. Refund and credit-note processing remain separate
finance operations.

When all delivered lines have been fully returned, Sales shows
`Order Return Done` and hides both `Ask for Replacement` and `Ask for Return`.
This is an additional after-sales state: the original order remains
`DELIVERED`, `FULLY_PAID`, and `ORDER_CLOSED`.

Full return is evaluated across every delivered line:

```ts
const fullReturnCompleted = order.items.every(
  (item) =>
    returnedQuantity(item.id) >= deliveredQuantity(item.id)
);
```

Receiving a return does not automatically issue a refund. Refund and credit-note
processing remain Finance-owned future workflows:

```text
CREDIT_NOTE_REQUESTED
→ CREDIT_NOTE_APPROVED
→ REFUND_PENDING
→ REFUND_COMPLETED
```

## Shared quantity rule

Replacement and return requests consume the same delivered quantity:

`available = delivered − active replacements − completed replacements − active returns − completed returns`

This calculation is performed per `orderLineId` and uses confirmed delivered
quantity—not ordered, produced, or QC-approved quantity. This is required when
an order is delivered through partial consignments.

An active request on one line does not block eligible actions on unrelated
lines. For example, an active replacement for Line A does not prevent a return
for available quantity on Line B. Conflict and eligibility checks are therefore
line-level, while the request remains linked to the canonical `orderId`.

Quantity is reserved as soon as an active request is created, not only after the
request is completed. For the ESS audit:

| Point in time | Calculation | Available |
| --- | --- | ---: |
| Before after-sales requests | `100` | 100 |
| After replacement request | `100 - 10` | 90 |
| After return request | `100 - 10 - 15` | 75 |

This prevents overlapping requests from exceeding the delivered quantity. Both
replacement and return requests above the current available quantity are
rejected. Buttons are hidden when no eligible quantity remains, a conflicting
active request blocks the action, or a full return has completed.

## Complete lifecycle reference

The statuses below belong to related entities/status dimensions linked by the
same `orderId`; they are presented together only as business progression. They
must not be collapsed into one generic status field.

### Main sales order

```text
LEAD_CREATED
→ QUOTATION_DRAFT
→ QUOTATION_SENT
→ CUSTOMER_ACCEPTED
→ ORDER_CONFIRMED
→ SENT_TO_PLANT_HEAD
→ PENDING_ACCEPTANCE
→ PLANT_HEAD_ACCEPTED
→ PRODUCTION_PLANNED
→ WORK_ORDER_CREATED
→ PRODUCTION_STARTED
→ PRODUCTION_COMPLETED
→ QC_PENDING
→ QC_APPROVED
→ READY_FOR_DISPATCH
→ DISPATCH_CREATED
→ IN_TRANSIT
→ DELIVERED
→ FINANCE_VERIFICATION_PENDING
→ PARTIALLY_PAID or FULLY_PAID
→ ORDER_CLOSED
```

### Replacement

```text
REPLACEMENT_REQUESTED
→ REPLACEMENT_APPROVED
→ REPLACEMENT_DISPATCHED
→ REPLACEMENT_IN_TRANSIT
→ REPLACEMENT_DELIVERED
```

### Return

```text
RETURN_REQUESTED
→ RETURN_APPROVED
→ RETURN_PICKUP_ASSIGNED
→ RETURN_IN_TRANSIT
→ RETURN_RECEIVED
```

## Sales order action matrix

| Order state | Visible sales action or badge |
| --- | --- |
| Confirmed and not sent | Send to Plant Head |
| Pending plant acceptance | Awaiting Plant Head |
| Plant head accepted | Ready for Planning |
| Production planned | Production Planned |
| Work order created | Work Order Created |
| Production started | In Production |
| Production completed | Awaiting QC |
| QC approved | Ready for Dispatch |
| Delivered, unpaid | Ask for Payment, Ask for Replacement, Ask for Return |
| Finance pending | Payment Verification Pending, after-sales actions remain |
| Partially paid, no Finance confirmation pending | Partially Paid, Ask for Payment, after-sales actions remain |
| Partially paid, Finance confirmation pending | Payment Verification Pending, after-sales actions remain |
| Fully paid and closed | Fully Paid, Closed, after-sales actions remain |
| Replacement active/completed | Replacement In Progress / Replacement Done |
| Return active/completed | Return In Progress / Order Return Done |
| Full return completed | Order Return Done; replacement and return actions hidden |

## Architecture invariants

- There is one writable original order in `state.sales.orders`.
- Operational records, payment confirmations, replacements, and returns link to
  it through canonical `orderId`.
- Status dimensions remain separate; no generic order status replaces them.
- Finished goods and dispatch queues keep their own record statuses.
- Delivered quantity and after-sales eligibility are calculated per
  `orderLineId`.
- Finance alone verifies payments and determines the verified total.
- Return receipt never automatically creates a credit note or refund.

## Verification

Run:

```bash
npx tsx scripts/ESS-All-O2C-Flow-Test.ts
```

Success ends with:

```text
ESS ALL SALES ORDER + REPLACEMENT + RETURN TESTS PASSED
```
