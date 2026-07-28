# Complete Sales Order Lifecycle ERP Workflow

## Document authority

This document is the canonical business-process specification and single source
of truth for the Sales ERP lifecycle. Where older flow documents, UI behavior,
tests, or implementation details conflict with this specification, this
document takes precedence.

## Acceptance status

**Specification approved; implementation and production acceptance pending.**

The current evidence-based implementation position is maintained separately in
[Sales Lifecycle Implementation Status](sales-lifecycle-implementation-status.md).
That status record must not be interpreted as changing the acceptance
requirements in this document.

Its latest live-verification section is the authoritative record of observed
database connectivity, record coverage, and known data inconsistencies.

The current application provides a connected, PostgreSQL-backed happy-path
foundation. That validation does not constitute acceptance of the complete
enterprise workflow defined here.

## Master lifecycle

```text
Lead
  → Requirement Approval
  → Sample (optional)
  → Quotation
  → Customer Acceptance
  → Sales Order
  → Approval
  → Plant Head
  → Production Planning
  → Material Management
  → Manufacturing
  → QC
  → Finished Goods
  → Dispatch
  → Delivery
  → Payment Verification
  → Order Closure
  → After Sales
```

The canonical master status chain is:

```text
LEAD_CREATED
  → LEAD_ASSIGNED
  → CUSTOMER_CONTACTED
  → MEETING_COMPLETED
  → REQUIREMENT_RECEIVED
  → REQUIREMENT_APPROVED
  → SAMPLE_CREATED (optional)
  → SAMPLE_SENT (optional)
  → CUSTOMER_FEEDBACK (optional)
  → SAMPLE_APPROVED (optional)
  → QUOTATION_DRAFT
  → QUOTATION_SENT
  → QUOTATION_APPROVED
  → SALES_ORDER_CREATED
  → SALES_ORDER_CONFIRMED
  → PLANT_HEAD_APPROVED
  → PRODUCTION_INCOMING
  → WORK_ORDER_CREATED
  → MATERIAL_ISSUED
  → PRODUCTION_STARTED
  → PRODUCTION_COMPLETED
  → QC_PENDING
  → QC_PASSED
  → FINISHED_GOODS_READY
  → READY_FOR_DISPATCH
  → DISPATCH_CREATED
  → IN_TRANSIT
  → DELIVERED
  → PAYMENT_PENDING
  → SALES_PAYMENT_RECORDED
  → FINANCE_VERIFICATION_PENDING
  → PAYMENT_VERIFIED
  → CUSTOMER_LEDGER_UPDATED
  → SALES_ORDER_CLOSED
```

## 1. CRM lead and requirement approval

Initial state: `LEAD_CREATED`.

Mandatory progression:

```text
LEAD_CREATED
  → LEAD_ASSIGNED
  → CUSTOMER_CONTACTED
  → MEETING_COMPLETED
  → REQUIREMENT_RECEIVED
  → REQUIREMENT_APPROVED
```

The lead retains customer information, product requirements, expected
quantity, source, follow-ups, and remarks.

No sample or quotation may be created before `REQUIREMENT_APPROVED`.

## 2. Sample management

`SampleRequest` retains the lead, customer, product, quantity, delivery
address, testing period, notes, dispatch requirement, status, creator, and
revision history.

Workflow:

```text
SAMPLE_CREATED
  → SAMPLE_PENDING_DISPATCH
  → SAMPLE_DISPATCHED
  → SAMPLE_IN_TRANSIT
  → SAMPLE_DELIVERED
  → SAMPLE_APPROVED
```

Alternative outcomes:

- `SAMPLE_REJECTED`
- `SAMPLE_RETURN_REQUIRED`
- `TESTING_EXTENDED`

Rules:

- An accidental duplicate sample request must be rejected.
- Multiple samples for one lead require explicit revision/history.
- When sampling is required, only an approved sample unlocks quotation
  creation.
- The sample stage may be skipped only when the lead/order policy explicitly
  marks it as `NO_SAMPLE`.

## 3. Quotation

Workflow:

```text
QUOTATION_DRAFT → INTERNAL_PRICING_REVIEW → QUOTATION_SENT
  → CUSTOMER_NEGOTIATION → QUOTATION_APPROVED
```

Alternative outcomes:

- `CUSTOMER_REJECTED`
- `REVISION_REQUIRED`
- `QUOTATION_EXPIRED`

A quotation freezes product specifications, quantity, unit price, discount,
tax, freight, payment terms, delivery terms, validity, and commercial notes.
Only the latest `QUOTATION_APPROVED` version can create a sales order.

## 4. Sales order

A sales order links its lead, applicable approved sample, accepted quotation,
customer, and customer purchase-order documents.

Creation validation:

- Customer is active.
- Quotation is the latest accepted version.
- Pricing matches the accepted commercial snapshot.
- Credit check has passed or an exception is approved.
- Required documents and delivery details exist.
- Duplicate conversion/order creation is blocked.

Workflow:

```text
SALES_ORDER_DRAFT
  → SALES_ORDER_PENDING_APPROVAL
  → SALES_ORDER_CONFIRMED
```

The workflow engine is the source of truth. Any denormalized business status
must be updated atomically with its workflow transition.

## 5. Plant Head

Workflow:

```text
SALES_ORDER_CONFIRMED
  → SENT_TO_PLANT_HEAD
  → PLANT_HEAD_ACCEPTED
```

Alternative outcomes:

- `PLANT_HEAD_CLARIFICATION_REQUIRED`
- `PLANT_HEAD_REJECTED`

The `/plant-head/incoming-orders` command center exposes capacity, material
availability, machines, tools, delivery commitment, and priority.

## 6. Production planning

`PLANT_HEAD_ACCEPTED` unlocks `PRODUCTION_PLANNED`.

A production plan specifies quantity, plant/line, machine, shift, batch,
planned start, and planned completion. An order may create multiple work
orders for multiple products, batches, plants, or delivery schedules.

## 7. Work orders and manufacturing

Workflow:

```text
WORK_ORDER_CREATED
  → PRODUCTION_STARTED
  → PRODUCTION_COMPLETED
```

Work orders record partial completions, rework, wastage, downtime, operators,
batches, and produced quantity. Production cannot start until every mandatory
material requirement has been issued.

## 8. Material management

Workflow:

```text
MATERIAL_REQUEST_CREATED
  → MATERIAL_REQUEST_APPROVED
  → READY_FOR_STORE_RELEASE
  → MATERIAL_ISSUED
```

Material requests, approvals, store releases, and issues are persisted and
traceable to the production plan/work order.

## 9. Quality control

Workflow:

```text
QC_PENDING → QC_APPROVED
```

Alternative:

```text
QC_REJECTED → REWORK_REQUIRED
```

QC captures dimensions, weight, strength, finish, batch, inspected quantity,
approved/rejected quantity, and customer specifications. Only approved
quantity may become finished goods.

## 10. Finished-goods inventory

`QC_APPROVED` creates `FINISHED_GOODS_READY` inventory by product, batch,
quantity, warehouse/location, reserved quantity, and available quantity.

Every inventory change is recorded as a stock movement. Dispatch reserves
available finished goods and consumes them only through a validated dispatch
transaction.

## 11. Dispatch and delivery

Canonical queue: `/dispatch/orders`.

Workflow:

```text
READY_FOR_DISPATCH
  → DISPATCH_CREATED
  → IN_TRANSIT
  → DELIVERED
```

Dispatch supports partial quantities, vehicle, driver, transporter,
LR/challan, and proof of delivery. Cumulative dispatch cannot exceed approved,
available finished goods. Delivered quantity is the authority for commercial
invoicing.

## 12. Payment and finance verification

Workflow:

```text
PAYMENT_SUBMITTED
  → FINANCE_VERIFICATION_PENDING
  → FINANCE_VERIFIED
```

Derived settlement states:

- `UNPAID`: no verified allocation
- `PARTIALLY_PAID`: verified allocation below invoice balance
- `FULLY_PAID`: verified allocation equals invoice balance

Quotation, order, delivered value, invoice, verified payment, and ledger must
reconcile for discount, tax, freight, rounding, debit, and credit.

## 13. Order closure

An order can transition to `SALES_ORDER_CLOSED` only when:

- the complete ordered quantity has been delivered;
- all invoice balances are fully paid by verified payments; and
- Finance has successfully updated the customer ledger; and
- no open return or replacement remains.

Sales may record payment details but cannot verify them, update the customer
ledger, or close an order. Finance is the sole owner of those commands.
Closure is evaluated by backend policy and performed transactionally. A UI
action cannot bypass these conditions.

## 14. After sales

Replacement:

```text
Replacement Request
  → Plant Approval
  → Replacement Dispatch
  → Replacement Delivered
```

Return:

```text
Return Request
  → Approval
  → Pickup
  → Return Received
```

Returns and replacements retain the originating customer, order, dispatch,
invoice, product/batch, quantities, reason, approvals, logistics, and financial
adjustments.

## Cross-cutting acceptance requirements

Every stage must provide:

- company/tenant scoping;
- role and permission enforcement;
- input and transition validation;
- atomic persistence for multi-record operations;
- idempotency for retryable commands;
- immutable commercial snapshots;
- business audit records identifying actor, action, before, and after values;
- workflow history and customer timeline visibility;
- pagination and indexes for operational queues;
- API, integration, failure-path, and browser-level tests.

## Current implementation position

| Capability | Position |
|---|---|
| Lead/customer/quotation/order happy path | Implemented foundation |
| Quotation revisions and latest-version conversion | Database validated |
| Production plan, work order, QC record chain | Implemented foundation |
| Dispatch, invoice, payment, ledger happy path | Database validated |
| Sample approval gate | Production acceptance pending |
| Plant Head clarification/rejection and capacity checks | Production acceptance pending |
| Material issue gate before production | Production acceptance pending |
| Partial production, rework, wastage, downtime | Production acceptance pending |
| Finished-goods inventory and dispatch consumption | Production acceptance pending |
| Delivered-value commercial reconciliation | Production acceptance pending |
| Finance verification and settlement authority | Production acceptance pending |
| Policy-controlled order closure | Production acceptance pending |
| Complete returns/replacements | Production acceptance pending |
| Strict frontend quality gates and browser acceptance | Production acceptance pending |
| Complete business audit coverage | Production acceptance pending |

Production sign-off requires the entire master workflow, alternative outcomes,
cross-cutting controls, and acceptance tests in this document to pass.
