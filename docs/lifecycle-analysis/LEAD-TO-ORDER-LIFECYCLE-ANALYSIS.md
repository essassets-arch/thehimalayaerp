# Lead-to-Order Lifecycle Audit & Bug Analysis Report

**Project Root:** `D:\prototype-next-main`  
**Date:** August 4, 2026  
**Auditor:** Antigravity AI Code Analyzer  
**Scope:** Read-only analysis of lifecycle replication, status transition validation, backend protections, database constraints, and data inconsistencies.

---

## A. Executive Summary

This audit evaluates the reliability and integrity of the Lead-to-Order lifecycle within the Himalaya ERP codebase. The analysis reveals that the core state transition machinery, backend APIs, and database constraints have significant gaps that allow data corruption, invalid transitions, and duplicate records.

1. **State Machine Porousness:** The custom workflow transition engine contains a fallback mechanism that completely bypasses `fromStateId` validation if *any* transition with the requested action name exists in the workflow definition. This allows terminal entities to be reopened, statuses to move backward arbitrarily (e.g., from `COMPLETED` or `CANCELLED` back to `IN_PRODUCTION`), and stages to be bypassed entirely.
2. **Concurrency & Race Conditions:** Critical business processes—including Sales Order conversion, Dispatch creation, and Production planning—lack database-level locking (`SELECT ... FOR UPDATE`), idempotency guarantees, or unique constraints on child models. Concurrent duplicate clicks or retries can successfully generate multiple orders for the same quotation, multiple production plans for the same order, and duplicate dispatches exceeding the ordered quantity.
3. **Mismatched Portals & Inconsistent Data:** Dual paths exist for completing QC and posting finished goods. Approving QC via the Production Floor portal updates a Work Order's `productionStatus` and inserts a `FinishedGoods` record but fails to write an inventory `IN` transaction. Conversely, approving via the QC Inspections portal updates the Work Order's `status` and records the inventory `IN` transaction but fails to write a `FinishedGoods` record. This leaves the system in a fractured state with inconsistent inventory totals.
4. **Authentication and Isolation Gaps:** Entire controllers (Leads, Samples, Plant Head) are marked with the `@Public()` decorator. This disables `JwtAuthGuard` and `PermissionsGuard`, allowing unauthenticated public clients to bypass RBAC and retrieve or modify business records. These endpoints fall back to hardcoded mock user/company IDs if authorization headers are missing.

---

## B. Actual Current Lifecycle

The table below outlines the exact status flows and representations found in the application:

| Entity | System Representation | Key Status Strings / Enum Values |
| :--- | :--- | :--- |
| **Lead** | `Lead` model + `LEAD` Workflow | `NEW`, `CONTACTED`, `REQUIREMENT_IDENTIFIED`, `QUOTATION_SENT`, `NEGOTIATION`, `WON`, `LOST` |
| **Sample** | `SampleRequest` + `SampleStatus` Enum | `CREATED`, `PENDING_DISPATCH`, `DISPATCHED`, `DELIVERED`, `TESTING`, `APPROVED`, `REJECTED`, `RETURN_REQUIRED`, `RETURN_REQUESTED`, `RETURN_IN_TRANSIT`, `RETURNED`, `COMPLETED` |
| **Quotation** | `Quotation` + `QUOTATION` Workflow | `NEW`, `DRAFT`, `INTERNAL_REVIEW`, `SENT`, `NEGOTIATION`, `APPROVED`, `CONVERTED_TO_SO`, `REJECTED`, `EXPIRED`, `CANCELLED`, `SUPERSEDED` |
| **Sales Order** | `SalesOrder` + `SalesOrderStatus` Enum | `DRAFT`, `PENDING_APPROVAL`, `CONFIRMED`, `SENT_TO_PLANT`, `SENT_TO_PLANT_HEAD`, `PLANT_APPROVED`, `READY_FOR_PRODUCTION`, `IN_PRODUCTION`, `READY_FOR_DISPATCH`, `COMPLETED`, `CANCELLED` |
| **Production Plan** | `ProductionPlan` + `ProductionPlanStatus` Enum | `PENDING_PLANNING`, `DRAFT`, `UNDER_REVIEW`, `APPROVED`, `RELEASED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| **Work Order** | `WorkOrder` + `WorkOrderStatus` Enum | `CREATED`, `MATERIAL_PENDING`, `READY`, `CANCELLED`, `STARTED`, `PARTIALLY_COMPLETED`, `COMPLETED`, `QC_PENDING`, `QC_APPROVED`, `READY_FOR_DISPATCH`, `DISPATCHED`, `CLOSED` |
| **QC Inspection** | `QCInspection` + `QcStatus` Enum | `PENDING`, `PASSED`, `PARTIAL`, `FAILED`, `REWORK`, `APPROVED` |
| **Finished Goods** | `FinishedGoods` + `status` String | `AVAILABLE`, `READY_FOR_DISPATCH`, `DISPATCHED` |
| **Dispatch** | `Dispatch` + `DispatchStatus` Enum | `PENDING_DISPATCH`, `DISPATCH_DRAFT`, `DISPATCH_APPROVED`, `READY_FOR_PICKUP`, `VEHICLE_ASSIGNED`, `LOADING_IN_PROGRESS`, `DISPATCHED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `POD_RECEIVED`, `DISPATCH_CLOSED` |
| **Invoice** | `SalesInvoice` + `InvoiceStatus` Enum | `DRAFT`, `POSTED`, `PARTIALLY_PAID`, `PAID`, `VOID`, `CANCELLED` |
| **Payment** | `CustomerPayment` + `PaymentStatus` Enum | `SUBMITTED`, `UNDER_VERIFICATION`, `VERIFIED`, `REJECTED`, `RECEIVED`, `PARTIALLY_ALLOCATED`, `ALLOCATED`, `BOUNCED` |
| **Return** | `SalesReturn` + `ReturnStatus` Enum | `REQUESTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `PICKUP_PENDING`, `PICKUP_ASSIGNED`, `IN_TRANSIT`, `GATE_RECEIVED`, `QC_PENDING`, `QC_COMPLETED`, `CREDIT_NOTE_PENDING`, `CREDIT_NOTE_ISSUED`, `REFUND_PENDING`, `CLOSED`, `CANCELLED` |
| **Replacement** | `ReplacementRequest` + `ReplacementRequestStatus` Enum | `REQUESTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED` |

---

## C. Intended vs Actual Behavior

### 1. Quotation Generation
* **Intended:** A Lead can have one active Quotation; creating a new one should either supersede it or block until cancelled/rejected. The "Generate Quotation" button should disappear from the Lead once a quotation is active.
* **Actual:** A single Lead can generate multiple parallel active quotations (e.g., Lead `LD-2026-00004` has three active quotations: `QT-2026-00021`, `QT-2026-00022`, and `QT-2026-00023` in the database). The frontend button fails to disappear because `Quotation` lacks a `status` field, causing `quotation.status` to resolve to `undefined` and fail visibility checks.
* **Risk:** High. Confusion on pricing, stale quotations, and sales reps converting outdated prices.

### 2. Quotation-to-Order Conversion
* **Intended:** A quotation can only be converted into one Sales Order. Conversion must be atomic and prevent double conversion on parallel clicks.
* **Actual:** `SalesOrder` has `sourceQuotationId` and `quotationId` fields. The unique constraint is placed on `quotationId`, but `convertToSalesOrder` only sets `sourceQuotationId`. The lack of a unique constraint on `sourceQuotationId` means the database permits multiple Sales Orders to reference the same quotation.
* **Risk:** Critical. Financial and order duplication where a customer receives and is invoiced for multiple orders off a single quote.

### 3. Production Planning
* **Intended:** Each Sales Order has a single Production Plan routing through the factory.
* **Actual:** `ProductionPlan` has no uniqueness constraint on `salesOrderId`. Plans can be automatically created when an order is sent to the plant head *and* manually generated via the Production portal. Sales Order `SO-2026-00007` has two active plans (`PP-00001` and `PP-2026-00006`) in the database.
* **Risk:** High. Double production floor work, excessive raw material procurement, and manufacturing duplication.

### 4. QC & Inventory Postings
* **Intended:** Passing QC updates the Work Order status, logs a single inventory transaction, and updates the Finished Goods registry.
* **Actual:** Approving QC in the Production portal calls `ProductionWorkflowService.passQC`, which updates the Work Order's `productionStatus` to `READY_FOR_DISPATCH` and creates `FinishedGoods` but logs *no* inventory transaction. Approving in the QC portal calls `QcService.processAction('APPROVE')`, which updates the Work Order's `status` to `QC_APPROVED` and logs an inventory `IN` transaction, but creates *no* `FinishedGoods` record.
* **Risk:** Critical. Physical stock exists in one registry but is absent in the other. Dispatching items with missing `IN` transactions will drive inventory quantities negative.

### 5. Dispatch Quantity Validations
* **Intended:** Dispatch quantities cannot exceed the ordered quantity or QC-approved quantity.
* **Actual:** Warnings are logged to the console, but the backend explicitly allows dispatches to proceed when quantities exceed stock or QC limits. Lack of database-level concurrency locks allows parallel dispatch requests to bypass remaining-quantity checks.
* **Risk:** Critical. Shipping more inventory than ordered, inventory count corruption, and cargo leakages.

### 6. Returns & Replacements Eligibility
* **Intended:** Returns or replacements can be requested for any delivered item.
* **Actual:** Delivered quantity is calculated by filtering dispatches with status in `['DELIVERED', 'COMPLETED']`. Final statuses such as `POD_RECEIVED` or `DISPATCH_CLOSED` are omitted. Consequently, once a dispatch reaches POD confirmation or is closed, the system calculates delivered quantity as 0, rejecting return/replacement requests.
* **Risk:** High. Blocked returns/replacements for customers who have already verified receipt of goods, breaking customer service workflows.

---

## D. Confirmed Bugs

### Bug ID: BUG-001 — Porous Workflow Engine Transition Bypass
* **Severity:** **CRITICAL**
* **Entity:** All Workflow Entities (SalesOrder, Quotation, ProductionPlan, WorkOrder, QCInspection, Dispatch, SalesInvoice, CustomerPayment)
* **User-Visible Symptom:** Statuses can move backward (e.g., from `COMPLETED` or `CANCELLED` back to `IN_PRODUCTION`). Completed/cancelled records can be modified or re-run.
* **Technical Root Cause:** `WorkflowService.processAction` contains a fallback (lines 101–143) that checks if *any* transition with the requested action name exists in the workflow definition if no direct transition from the current state is found. If found, it uses that transition, ignoring the `fromStateId` mismatch. It also has a hardcoded map that directly sets the next state, bypassing the transition matrix entirely.
* **File:** [workflow.service.ts](file:///D:/prototype-next-main/backend/src/modules/workflow/workflow.service.ts#L101-L143)
* **Reproduction Steps:** Submit a POST request to `/api/v1/sales/orders/:id/action` with `{ "action": "CANCEL" }` on an order that is already in `COMPLETED` state. The engine matches the `CANCEL` action defined for `DRAFT` state and cancels the order.
* **Business Damage:** Total compromise of data history, auditing, and financial records. Bypasses segregation of duties.

### Bug ID: BUG-002 — Quotation double-conversion via sourceQuotationId
* **Severity:** **CRITICAL**
* **Entity:** SalesOrder, Quotation
* **User-Visible Symptom:** Clicking "Convert to Order" multiple times in rapid succession or executing parallel API requests creates multiple Sales Orders for a single quotation.
* **Technical Root Cause:** The `SalesOrder` schema defines a unique constraint on `quotationId`, but the service `convertToSalesOrder` only sets the non-unique `sourceQuotationId` field when creating the order. Additionally, the existing order check (`tx.salesOrder.findFirst`) does not lock the quotation row, causing a race condition under concurrent requests.
* **File:** [quotations.service.ts](file:///D:/prototype-next-main/backend/src/modules/quotations/quotations.service.ts#L430-L433)
* **Reproduction Steps:** Send two concurrent POST requests to `/api/v1/quotations/:id/convert`. Both see no existing order under Read Committed transaction isolation, create separate Sales Orders, and leave `quotationId` null.
* **Business Damage:** Incorrect billing, double shipment, duplicate material allocation.

### Bug ID: BUG-003 — Mismatched QC Portals & Inconsistent Inventory Posting
* **Severity:** **CRITICAL**
* **Entity:** WorkOrder, FinishedGoods, InventoryTransaction
* **User-Visible Symptom:** Approving QC in the production portal lets the order proceed to dispatch but does not update stock counts in reports. Approving in the QC portal updates stock counts but fails to register finished goods.
* **Technical Root Cause:** Dual implementations of QC approval exist. `ProductionWorkflowService.passQC` updates `productionStatus` and writes `FinishedGoods` but does not log `InventoryTransaction`. `QcService.processAction` updates `status` and logs `InventoryTransaction` but does not write `FinishedGoods`.
* **Files:** 
  * [production-workflow.service.ts](file:///D:/prototype-next-main/backend/src/modules/production/production-workflow.service.ts#L352-L431)
  * [qc.service.ts](file:///D:/prototype-next-main/backend/src/modules/qc/qc.service.ts#L146-L221)
* **Reproduction Steps:** Complete a job, then call `/api/v1/production/:id/qc-pass`. Note that `FinishedGoods` is updated but no `InventoryTransaction` with type `IN` is registered.
* **Business Damage:** Severe mismatch in warehouse inventory audits, negative stock balances during delivery, stock count inflation.

### Bug ID: BUG-004 — Return/Replacement Delivered Quantity Mismatch
* **Severity:** **HIGH**
* **Entity:** SalesReturn, ReplacementRequest
* **User-Visible Symptom:** Trying to return or replace an item from an order that is already fully delivered and confirmed (POD received / Closed) fails with a quantity validation error.
* **Technical Root Cause:** Quantity validation in both services filters delivered dispatches using `['DELIVERED', 'COMPLETED']`. Final dispatch statuses like `POD_RECEIVED` or `DISPATCH_CLOSED` are excluded, resulting in a delivered quantity of 0.
* **Files:**
  * [sales-returns.service.ts](file:///D:/prototype-next-main/backend/src/modules/sales-returns/sales-returns.service.ts#L32-L40)
  * [replacements.service.ts](file:///D:/prototype-next-main/backend/src/modules/replacements/replacements.service.ts#L32-L40)
* **Reproduction Steps:** Confirm delivery and upload a POD, changing dispatch status to `POD_RECEIVED`. Attempt to post a return request. The API throws a BadRequestException stating that requested quantity exceeds delivered quantity.
* **Business Damage:** Broken after-sales workflow; unable to process returns or replacements for completed orders.

### Bug ID: BUG-005 — Class-Level @Public() Security Bypass
* **Severity:** **HIGH**
* **Entity:** Lead, Sample, PlantHead Dashboard
* **User-Visible Symptom:** Direct API requests to crm/leads, samples, and plant-head endpoints bypass authentication, exposing business data to the public.
* **Technical Root Cause:** `@Public()` decorator is placed at the class level of controllers. This bypasses the route guards. Since `req.user` is undefined for unauthenticated requests, the controllers fall back to hardcoded IDs.
* **Files:**
  * [leads.controller.ts](file:///D:/prototype-next-main/backend/src/modules/crm/leads.controller.ts#L18)
  * [samples.controller.ts](file:///D:/prototype-next-main/backend/src/modules/samples/samples.controller.ts#L24)
  * [plant-head.controller.ts](file:///D:/prototype-next-main/backend/src/modules/plant-head/plant-head.controller.ts#L17)
* **Reproduction Steps:** Submit a GET request to `/api/v1/crm/leads` without an Authorization bearer token. The API returns all leads under company `d039cfa4-e78b-4138-adfc-1b0f14cffa91`.
* **Business Damage:** Complete exposure of CRM leads, samples, and plant analytics to public networks.

---

## E. Duplicate Record Analysis

The table below breaks down which duplicate records in the database represent valid business processes and which represent system defects:

| Scenario | Database Status | Analysis |
| :--- | :--- | :--- |
| **Multiple Quotations per Lead** | **Accidental Duplication** | Generating quotations creates separate active quotation records without deprecating or cancelling older ones. Under lead `5bafc007-ae5a-45be-b843-e8946cfcf52f`, three parallel quotations exist (`QT-2026-00021`, `QT-2026-00022`, `QT-2026-00023`). |
| **Quotation Revisions** | **Valid Revision Workflow** | Revisions are handled via the `duplicateVersion` method, which appends version suffixes (e.g. `-V2`) and transitions original records to the `SUPERSEDED` state. |
| **Multiple Orders per Quotation** | **Accidental Duplication** | Multiple sales orders can point to the same quotation because the conversion method leaves the unique `quotationId` field null and populates the non-unique `sourceQuotationId` field. |
| **Multiple Production Plans** | **Accidental Duplication** | Due to a lack of database constraints, plans can be automatically generated when an order is sent to the plant head *and* manually generated via the Production portal. Order `SO-2026-00007` has two active plans (`PP-00001` and `PP-2026-00006`). |
| **Multiple Work Orders** | **Accidental Duplication** | There is no uniqueness check on `salesOrderItemId` in the manual work order generation path, allowing users to spawn duplicate work orders for the same item. |
| **Multiple Dispatches** | **Valid Partial Dispatches** | Valid dispatches are supported for partial deliveries. However, a lack of locking on `DispatchService.createDispatch` allows concurrent double submissions to exceed order quantities. |
| **Multiple Invoices** | **Valid Billing Model** | One invoice is created automatically per dispatch. Mismatches only occur if duplicate dispatches are created. |
| **Multiple Payments** | **Valid Financial Model** | Multiple payments are permitted per order to support installment payments. |

---

## F. Status Transition Analysis

Below is the state transition matrix showing allowed next actions and backend validation rules:

| Entity | Current Status | Available Frontend Actions | Statuses Backend Accepts | Invalid Transitions Possible? | Terminal State Enforced? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Lead** | `NEW` | Mark Contacted, Mark Lost | `CONTACTED`, `LOST` | Yes, can skip directly to any state using `targetStateCodeMap` | No, `LOST` can transition back to `CONTACTED` |
| **Quotation** | `DRAFT` | Submit for Review, Cancel | `INTERNAL_REVIEW`, `CANCELLED`, `SENT` | Yes, can skip review | No, `CANCELLED` can be processed to `SENT` |
| **Quotation** | `APPROVED` | Convert to Sales Order | `CONVERTED_TO_SO` | Yes, can convert multiple times | No, can convert after conversion |
| **Sales Order** | `DRAFT` | Submit for Approval, Cancel | `PENDING_APPROVAL`, `CANCELLED` | Yes, porous engine fallback | No, `CANCELLED` can be submitted |
| **Sales Order** | `READY_FOR_DISPATCH` | Complete (Close Order) | `COMPLETED` | Yes, can close without full payment or delivery | No, `COMPLETED` can be cancelled |
| **Work Order** | `CREATED` | Accept, Reject, Request Materials | `READY`, `CANCELLED`, `MATERIAL_PENDING` | Yes, bypass checks | No, `CANCELLED` can be started |
| **QC Inspection** | `PENDING` | Start Inspection, Approve, Reject | `IN_PROGRESS`, `APPROVED`, `FAILED` | Yes, bypasses `IN_PROGRESS` | No, `FAILED` can be approved |
| **Dispatch** | `IN_TRANSIT` | Confirm Delivery | `DELIVERED` | Yes, bypasses transit updates | No |

---

## G. Frontend Button Analysis

The table below catalogs the visibility, stale state, and duplication risks of critical user interface elements:

| Page | Button | Entity | Current Visibility Condition | Disabled Condition | API Endpoint Called | Can Be Repeated? | Observed Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Leads Page** | Generate Quotation | Lead | `quoState.state !== 'COMPLETED'` | None | `POST /api/v1/quotations` | Yes | **HIGH.** `quoState.state` checks `quotation.status` which is `undefined`. Button remains visible, allowing duplicate quotation generation. |
| **Quotation Detail** | Convert to Order | Quotation | `status === 'APPROVED'` | `isPending` | `POST /api/v1/quotations/:id/convert` | Yes | **CRITICAL.** If double-clicked, creates multiple orders since `sourceQuotationId` lacks a unique constraint. |
| **Order Detail** | Send to Plant Head | SalesOrder | `status === 'CONFIRMED'` | `isSubmitting` | `POST /api/v1/sales/orders/:id/send-to-plant-head` | Yes | **HIGH.** Double click generates multiple production plans because the endpoint lacks concurrency control. |
| **Production Plans** | Create Work Order | ProductionPlan | `status === 'APPROVED'` | None | `POST /api/v1/production/work-orders` | Yes | **MEDIUM.** Can generate duplicate work orders for the same sales order items. |
| **QC Pending Page** | QC Pass | WorkOrder | `activeTab === 'pending'` | `isMutating` | `POST /api/v1/production/:id/qc-pass` | No | **CRITICAL.** Updates `productionStatus` and creates Finished Goods but misses `InventoryTransaction`. |
| **QC Detail Page** | Approve | QCInspection | `status === 'IN_PROGRESS'` | `isSubmitting` | `POST /api/v1/qc/inspections/:id/approve` | No | **CRITICAL.** Logs `InventoryTransaction` but misses `FinishedGoods` updates. |
| **Dispatch Page** | Confirm Delivery | Dispatch | `['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(status)` | `isPending` | `POST /api/v1/logistics/dispatches/:id/deliver` | No | **HIGH.** Immediately completes the Sales Order status even for partial deliveries. |

---

## H. API Protection Analysis

An evaluation of NestJS endpoints reveals the following protection details:

| HTTP Method & Route | Controller & Service Method | Required Role/Permission | Status Validation | Quantity Checks | Transaction | Idempotency Key | Tenant Validation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /crm/leads` | `LeadsController.createLead` | None (`@Public()`) | None | None | No | No | None (uses fallback company ID) |
| `POST /quotations/:id/convert` | `QuotationsController.convertToSalesOrder` | `crm.quotations.convert`, `sales.orders.create` | Checks allowedCodes; auto-approves if not APPROVED | None | Yes | No | Checks `createdById` scope |
| `POST /sales/orders/:id/action` | `SalesController.processAction` | `sales.orders.update` | Bypassed by porous workflow engine | None | Yes | Yes (in interceptor, header required) | Checks `createdById` scope |
| `POST /production/:id/qc-pass` | `ProductionWorkflowController.qcPass` | `production.qc.approve` | Checks `allowedStatuses` | `dto.approvedQuantity <= workOrder.quantity` | Yes | No | None |
| `POST /qc/inspections/:id/approve` | `QcController.approveInspection` | `qc.inspection.approve` | Checks status is `IN_PROGRESS` | None (reads full WO qty) | Yes | No | Mapped via company ID |
| `POST /logistics/dispatches` | `DispatchController.createDispatch` | `logistics.dispatches.create` | None | `alreadyDispatched + qty <= orderedQuantity` (warning only for QC) | Yes | Yes | Scope-checked |
| `POST /sales-returns` | `SalesReturnsController.requestReturn` | `sales.returns.create` | Checks dispatch is `DELIVERED`/`COMPLETED` | `requestedQty <= availableForReturn` | Yes | Yes | Scope-checked |

---

## I. Database Protection Analysis

Prisma schemas and database constraints have been analyzed for key models:

* **Lead:** Unique constraint on `leadNumber`. No unique constraint on `customerId` or `convertedCustomerId`.
* **Quotation:** Unique constraint on `quotationNumber`. Index on `leadId`. No unique constraint on `leadId`, allowing multiple quotations per lead.
* **SalesOrder:** Unique constraint on `orderNumber` and `quotationId`. Index on `customerId`. 
  * *Missing Protection:* `sourceQuotationId` is not constrained to be unique. This allows duplicate Sales Orders to point to the same quotation because `convertToSalesOrder` leaves `quotationId` null.
* **ProductionPlan:** Unique constraint on `planNumber`. Index on `salesOrderId`. No unique constraint on `salesOrderId`, allowing duplicate production plans.
* **WorkOrder:** Unique constraint on `workOrderNumber`. Index on `salesOrderItemId`. No unique constraint on `salesOrderItemId`, allowing duplicate work orders per order item.
* **QCInspection:** No uniqueness constraints on `workOrderId`. Allows duplicate inspection requests.
* **FinishedGoods:** Unique constraint on `workOrderId`. Prevents duplicate finished goods records, but does not prevent duplicate approvals since `upsert` is used.
* **Dispatch:** Unique constraint on `dispatchNo`. No uniqueness constraints on `salesOrderId` to support valid partial dispatches.
  * *Missing Protection:* No unique constraint on `DispatchItem(dispatchId, salesOrderItemId)`. This allows duplicate items to be added to the same dispatch.

---

## J. Root-Cause Map

| Issue | Primary Root Cause | Secondary Root Cause | Affected Files | Affected Tables | Severity | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Workflow Transition Bypass** | `Incorrect State Transition logic` | `Porous workflow engine fallback` | `workflow.service.ts` | `WorkflowTransition`, `WorkflowHistory` | **CRITICAL** | Confirmed |
| **Quotation Double Conversion** | `Incorrect database relationship` | `Missing unique constraint` | `quotations.service.ts`, `schema.prisma` | `SalesOrder` | **CRITICAL** | Confirmed |
| **Inconsistent QC Stock Updates** | `Duplicate/competing services` | `Mismatched API responsibilities` | `production-workflow.service.ts`, `qc.service.ts` | `FinishedGoods`, `InventoryTransaction` | **CRITICAL** | Confirmed |
| **Lead Duplicate Quotations** | `Frontend visibility bug` | `Zustand store stale state` | `LeadsView.jsx`, `erpStore.ts` | `Quotation` | **HIGH** | Confirmed |
| **Lead API Security Bypass** | `Permission mismatch` | `@Public() bypasses Guards` | `leads.controller.ts`, `samples.controller.ts` | `Lead`, `SampleRequest` | **HIGH** | Confirmed |
| **Return/Replacement Blocker** | `Invalid business rule` | `Omission of POD/Closed status` | `sales-returns.service.ts`, `replacements.service.ts` | `Dispatch` | **HIGH** | Confirmed |
| **Duplicate Production Plans** | `Missing database constraint` | `No check on plan creation` | `production.service.ts`, `schema.prisma` | `ProductionPlan` | **HIGH** | Confirmed |

---

## K. Bug Priority Order

1. **Priority 1 — Immediate Data-Corruption Risk:** 
   * **BUG-003:** Mismatched QC Portals and Inconsistent Inventory Posting.
   * **BUG-001:** Porous Workflow Engine Transition Bypass.
2. **Priority 2 — Duplicate Irreversible Operations:**
   * **BUG-002:** Quotation double-conversion via sourceQuotationId.
   * **BUG-005:** Lead/Sample API Security Bypass.
3. **Priority 3 — Invalid Lifecycle Transitions:**
   * **BUG-004:** Return/Replacement Delivered Quantity Mismatch.
   * Duplicate production plans and work orders.
4. **Priority 4 — Frontend Action Visibility:**
   * **BUG-007:** Stale Zustand Store and Mismatched Status Fields for Buttons.
5. **Priority 5 — Reporting and Audit Gaps:**
   * Missing audit log company IDs for public actions.

---

## L. Questions Requiring Business Confirmation

1. **Quotation Revisions vs. Recreations:** Should a sales representative be permitted to generate a brand-new quotation for a lead that already has an active quotation, or should all edits proceed strictly through the version revision (`duplicateVersion`) workflow?
2. **Work Order Splits:** Is it valid to have multiple work orders for the same Sales Order item (e.g., splitting a large order across shifts/batches), or should there be a strict 1-to-1 relationship between `SalesOrderItem` and `WorkOrder`?
3. **Plant Head Handoff Rejections:** Can a Plant Head reject a sales order *after* it has already been accepted and planned for production? If so, what should happen to the active production plans and work orders?
4. **Payment Closure Restrictions:** Should we enforce that an order can only be moved to `COMPLETED` if its invoices are fully paid and delivered, or is manual/early closure allowed for bad debt or write-offs?

---

## M. Recommended Next Analysis Step

* **Audit target:** Conduct a deep-dive review of the **Purchase Indent and Material Request (Procurement) Workflow**.
* **Reasoning:** Inconsistent inventory transactions were discovered during the QC audits. The store and procurement modules share these tables. We need to verify if similar gaps exist in procurement, where duplicate material issues or goods receipts can occur.
