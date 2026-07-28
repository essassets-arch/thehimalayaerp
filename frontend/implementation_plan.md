# Enforce Strict Sales Order Flow & Core Data Rules

This finalized implementation plan outlines the architectural alignment needed to ensure that all modules strictly adhere to your Order flow statuses, read from the singular source of truth (`state.sales.orders`), and use direct Zustand actions instead of mock APIs.

## Decisions & Core Rules
1. **Immediate Zustand Actions**: All mock API calls (e.g., `apiClient.patch`) will be replaced with direct store mutations via `useERPStore.getState().actionName(...)`.
2. **Remove Legacy Arrays**: Writable legacy arrays (`state.orders`, `state.dispatch.orders`, `state.production.orders`) will be removed. Only `state.sales.orders` will exist as the single source of truth.
3. **Linked Operational Records**: Other domains will create linked records (e.g., `state.production.workOrders`) referencing `orderId` without duplicating the sales order data.

---

## Centralized Actions to Implement

The following actions will be implemented/updated in `erpStore.ts` and `salesActions.ts` (or relevant domains) to perform atomic updates to the central `state.sales.orders` array:

- `convertQuotationToOrder`
- `sendOrderToPlantHead`
- `acceptOrderByPlantHead`
- `rejectOrderByPlantHead`
- `planOrder`
- `activateWorkOrder`
- `startProduction`
- `completeProduction`
- `approveQC`
- `createDispatch`
- `startDispatchTransit`
- `confirmDelivery`
- `recordSalesPayment`
- `verifyFinancePayment`
- `rejectFinancePayment`
- `requestReplacement` / `approveReplacement` / `rejectReplacement` / `dispatchReplacement` / `confirmReplacementDelivery`
- `requestReturn` / `approveReturn` / `rejectReturn` / `assignReturnPickup` / `startReturnTransit` / `confirmReturnReceipt`

---

## Module Updates & Status Transitions

### 1. Order Creation (Sales)
- **Action**: `convertQuotationToOrder`
- **Statuses Initialized**:
  ```javascript
  commercialStatus: "ORDER_CONFIRMED",
  planningStatus: "NOT_SENT",
  productionStatus: "NOT_STARTED",
  qcStatus: "NOT_READY",
  dispatchStatus: "NOT_READY",
  paymentStatus: "NOT_DUE",
  replacementStatus: "NONE",
  returnStatus: "NONE",
  ```
- **Action**: `sendOrderToPlantHead(orderId)`
- **Transitions**: 
  - `commercialStatus`: `ORDER_CONFIRMED` -> `SENT_TO_PLANT_HEAD`
  - `planningStatus`: `NOT_SENT` -> `PENDING_ACCEPTANCE`

### 2. Plant Head Flow
- **Incoming Orders Filter**: `order.planningStatus === "PENDING_ACCEPTANCE"`
- **Acceptance Action**: `acceptOrderByPlantHead` (`PENDING_ACCEPTANCE` -> `PLANT_HEAD_ACCEPTED`)
- **Planning Filter**: `order.planningStatus === "PLANT_HEAD_ACCEPTED"`
- **Plan Action**: `planOrder` (`PLANT_HEAD_ACCEPTED` -> `PRODUCTION_PLANNED`)

### 3. Production Flow
- **Incoming Filter**: `order.planningStatus === "PRODUCTION_PLANNED" && order.productionStatus === "NOT_STARTED"`
- **Activation Action**: `activateWorkOrder` creates a single linked Work Order and updates Sales order `productionStatus: WORK_ORDER_CREATED`.
- **QC Approval Action**: `approveQC` updates `order.qcStatus = "QC_APPROVED"` and retains line-level `approvedQuantity` on the `qcRecord` array.

### 4. Dispatch Flow
- **Dispatch Eligibility**: `selectDispatchOrders` checks `qcApprovedQuantity > dispatchedQuantity` instead of relying solely on `qcStatus`.
- **Creation Action**: `createDispatch` (`dispatchStatus: NOT_READY -> DISPATCH_PENDING -> DISPATCH_CREATED`)
- **Transit Action**: `startDispatchTransit` (`DISPATCH_CREATED -> IN_TRANSIT`)
- **Delivery Action**: `confirmDelivery` (`IN_TRANSIT -> DELIVERED`). Sets `commercialStatus = "ORDER_ACTIVE"` (or `"ORDER_CLOSED"` if fully paid).

### 5. Payment Flow (Finance)
- **Record Payment Action**: Sales creates `PaymentConfirmation`. Both the confirmation and `Order.paymentStatus` become `FINANCE_VERIFICATION_PENDING`.
- **Verify Payment Action**: Finance approves. `PaymentConfirmation.status = FINANCE_VERIFIED`.
- **Derived Status Logic**:
  - Partial: `paymentStatus = PARTIALLY_PAID`
  - Full (Not Delivered): `paymentStatus = FULLY_PAID`, `commercialStatus = ORDER_ACTIVE`
  - Full (Delivered): `paymentStatus = FULLY_PAID`, `commercialStatus = ORDER_CLOSED`

### 6. After-Sales Flows (Replacement & Return)
- **Visibility Logic**: Buttons only appear if `order.dispatchStatus === "DELIVERED"`, there are no conflicting active requests, and:
  `Available Qty = Delivered Qty - Active Replacements - Completed Replacements - Active Returns - Completed Returns > 0`. (Line-level evaluation).
- **Requests Storage**: Saved exclusively to `state.sales.replacementRequests` and `state.sales.returnRequests`.
- **Transitions**:
  - Replacement: `REPLACEMENT_REQUESTED -> REPLACEMENT_APPROVED -> REPLACEMENT_DISPATCHED -> REPLACEMENT_IN_TRANSIT -> REPLACEMENT_DELIVERED`
  - Return: `RETURN_REQUESTED -> RETURN_APPROVED -> RETURN_PICKUP_ASSIGNED -> RETURN_IN_TRANSIT -> RETURN_RECEIVED`
- The original order `dispatchStatus` remains `DELIVERED`. (Shows badges like "Replacement Done" or "Return In Progress").
