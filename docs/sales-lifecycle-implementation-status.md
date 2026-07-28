# Sales Lifecycle Implementation Status

## Official classification

**Unified Lead-to-Cash Lifecycle — Happy Path Implemented and Database
Validated; Complete Sales Order Lifecycle Implementation and Production
Acceptance Pending.**

This status is a live implementation assessment. The acceptance authority is
the [Complete Sales Order Lifecycle ERP Workflow](complete-sales-order-lifecycle.md).
Stored connectivity or a passing happy path does not override the controls and
acceptance requirements in that specification.

## Latest live verification

Verification date: **2026-07-28**

The running Nest health endpoint responded successfully, and Prisma queried
the connected PostgreSQL database directly.

| Persisted entity | Record count |
|---|---:|
| Leads | 4 |
| Sample requests | 0 |
| Quotations | 5 |
| Sales orders | 4 |
| Production plans | 3 |
| Work orders | 3 |
| Material requests | 0 |
| QC inspections | 3 |
| Inventory transactions | 0 |
| Dispatches | 3 |
| Sales invoices | 3 |
| Customer payments | 3 |
| Customer-ledger entries | 6 |
| Sales returns | 0 |
| Replacement requests | 0 |
| Audit logs | 0 |
| Workflow-history entries | 102 |

Three database flows contain a linked lead, quotation, order, production plan,
work order, QC inspection, dispatch, invoice, payment allocation, and balanced
customer ledger. One earlier validation order remains a draft without
downstream operations.

The earlier live verification confirmed two production-blocking data
inconsistencies:

| Order evidence | Accepted order total | Generated invoice total | Domain status | Workflow state |
|---|---:|---:|---|---|
| Latest V2 quotation flow | 5,546 | 4,800 | `DRAFT` | `READY_FOR_DISPATCH` |
| Earlier flow | 5,782 | 5,000 | `DRAFT` | `READY_FOR_DISPATCH` |

Therefore, persistence and linkage are proven, while commercial reconciliation
and status synchronization were not accepted at that checkpoint.

### Remediation verification

The latest enhanced lifecycle run (`SO-2026-00008`) now persists:

| Control | Verified result |
|---|---|
| Accepted sales-order total | 5,546 |
| Generated invoice total | 5,546 |
| Invoice components | 4,800 subtotal − 100 discount + 846 tax |
| Invoice status | `PAID` |
| Sales-order domain status | `COMPLETED` |
| Sales-order workflow state | `COMPLETED` |
| Production-plan status/workflow | `COMPLETED` / `COMPLETED` |
| Finance verification before allocation | Enforced |
| Finished-goods movements | 2 receipts and 2 dispatch issues persisted |
| Business audit records | 39 persisted |
| Final tested ledger balance | 0 |

This closes the originally observed happy-path defects for commercial
reconciliation, status drift, verified settlement authority, automatic order
closure, production-plan completion, basic finished-goods receipt/consumption,
and workflow-transition audit population. Partial, exception, concurrency, and
browser acceptance scenarios remain governed by the open requirements below.

## Database-verified foundation

| Capability | Status |
|---|---|
| Lead and customer persistence | Working |
| Lead activities and CRM linkage | Working |
| Lead-to-customer conversion | Working |
| Duplicate-customer checks | Working foundation |
| Quotation persistence and versioning | Working |
| V1/V2 commercial snapshot freeze | Database validated |
| Latest approved quotation conversion | Database validated |
| Sales-order source traceability | Working |
| Production-plan creation | Working foundation |
| Work-order creation | Working foundation |
| QC-inspection creation | Working foundation |
| Dispatch creation | Working foundation |
| Dispatch-generated invoice | Working foundation |
| Payment allocation | Working foundation |
| Customer-ledger linkage | Working for tested scenarios |
| Customer 360 and dashboard | Working foundation |
| Backend and frontend compilation | Passing |
| Database-backed happy-path test | Passing |

## Production blockers

### 1. Commercial and financial correctness — happy path remediated; broader acceptance pending

Invoice generation does not preserve the complete accepted commercial chain:

```text
Quotation → Sales Order → Delivered Value → Invoice → Payment → Ledger
```

Base value, discount, tax, freight, rounding, and final payable amount must be
derived from immutable order snapshots and reconcile exactly. A balanced
ledger against an incorrectly calculated invoice is not acceptance.

### 2. Workflow and business-status synchronization — happy path remediated; broader acceptance pending

Persisted records can contain conflicting truths, such as:

```text
SalesOrder.status = DRAFT
Workflow state    = READY_FOR_DISPATCH
```

The workflow engine must be authoritative. Any denormalized status must update
atomically with workflow history and the domain transition. UI pages must not
select a conflicting field as their status source.

### 3. Policy-controlled order closure — happy path implemented; alternative paths pending

Closure requires all of the following:

- complete delivered quantity;
- fully paid invoices using verified payments; and
- no open return or replacement.

Only a transactional backend policy may transition an order to
`ORDER_CLOSED`.

### 4. Sample lifecycle — missing

Required:

```text
Lead → Sample Request → Dispatch → Delivery → Testing
     → Approval/Rejection → Quotation Gate
```

It must include duplicate prevention, revisions/history, testing periods,
delivery state, and approval outcomes.

### 5. Material-management gate — missing

Required:

```text
Material Request → Approval → Store Release → Material Issued
                 → Production Start
```

Production must not start while a mandatory material requirement remains
unissued.

### 6. Finished-goods inventory — basic receipt/reservation/consumption implemented; enterprise controls pending

Required:

```text
QC-approved quantity → Finished goods → Reservation
                     → Dispatch → Stock consumption
```

Inventory movements must retain product, batch, warehouse/location, reference,
quantity, and actor.

### 7. Manufacturing controls — partial

Partial completion, rework, scrap/wastage, downtime, operator logs, batch
traceability, and automatic production-plan completion remain pending.

### 8. Plant Head controls — partial

Capacity, machine/tool and material availability, priority, delivery
commitment, clarification, and rejection-reason handling remain pending.

### 9. Authentication consistency — incomplete

Some CRM screens read `localStorage.getItem('token')` while the application
uses a separate in-memory token source. Access-token refresh, refresh-cookie
scope, browser reload, and protected-route behavior must use one consistent
authentication client and pass browser tests.

### 10. Audit coverage — workflow transitions implemented; full mutation coverage pending

Workflow history is populated, but it is not a complete business audit.
Critical commands must write `AuditLog` records containing actor, action,
entity, before state, after state, timestamp, request context, and business
reason.

### 11. Returns and replacements — unvalidated

Return approval, pickup, receipt, QC, inventory effect, and financial
adjustment must be validated. Replacement approval, production/stock source,
dispatch, delivery, and inventory effect must also be validated.

### 12. Automated acceptance and quality gates — incomplete

Currently passing:

- backend build;
- frontend build; and
- database-backed happy path.

Still required:

- strict TypeScript validation;
- lint compliance;
- stable main Jest suite;
- browser Lead-to-Closure journey;
- rejection, cancellation, expiry, partial and credit-failure scenarios;
- permission tests;
- retry and idempotency tests; and
- transactional rollback tests.

## Production acceptance rule

Production sign-off is prohibited until the canonical master lifecycle,
alternative outcomes, cross-cutting controls, audit requirements, and
acceptance tests all pass.
