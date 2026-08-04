# Enterprise Dispatch Module & DISPATCH_EXECUTIVE Role Documentation

**System**: Enterprise ERP Logistics & Order-to-Cash (O2C) Subsystem  
**Primary Target Role**: `DISPATCH_EXECUTIVE`  
**Document Revision**: 1.0  
**Status**: Verified & Operational  

---

## 1. Executive Summary & Overview

The **Dispatch Module** serves as the critical operational bridge between Production, Warehouse Storage, Quality Control (QC), Finance, and Customer Delivery in the ERP platform. 

It empowers the **Dispatch Executive (`DISPATCH_EXECUTIVE`)** and logistics personnel to manage the outbound flow of finished goods, issue gate passes, coordinate transport logistics, track live shipments in transit, capture digital Proof of Delivery (POD), and handle after-sales returns and replacement dispatches.

```
+------------------+     +-------------------+     +------------------+     +--------------------+
|  Sales / Orders  | --> | Production & QC   | --> | Dispatch Module  | --> | Finance & Customer |
| (Sales Order SO) |     | (Work Orders WO)  |     | (Consignment DSP)|     | (Invoice / POD)    |
+------------------+     +-------------------+     +------------------+     +--------------------+
```

---

## 2. Roles, Responsibilities & RBAC Access Control Matrix

### 2.1 Primary Role Definition: `DISPATCH_EXECUTIVE`
The `DISPATCH_EXECUTIVE` is responsible for daily logistics operations, carrier scheduling, vehicle entry, document verification (Invoices, Gate Passes, E-Way Bills), dispatch execution, live transit tracking, and final delivery verification.

### 2.2 Cross-Departmental Interacting Roles

| Role Code | Role Name | Interaction in Dispatch Workflow |
| :--- | :--- | :--- |
| `DISPATCH_EXECUTIVE` | Dispatch Executive | **Primary Owner**: Creates dispatches, schedules transports, updates transit, captures delivery POD, manages returns & replacements. |
| `STORE_MANAGER` | Store / Warehouse Manager | Stages finished goods from production, verifies inventory availability, and oversees warehouse stock OUT movements. |
| `QC_INSPECTOR` | QC Inspector | Inspects finished goods prior to dispatch; inspects returned goods during Sales Returns workflows. |
| `PRODUCTION_PLANNER` | Production Planner | Completes Work Orders, updating status to `READY_FOR_DISPATCH` for staging. |
| `SALES_EXECUTIVE` | Sales Executive | Reviews order fulfillment status, customer delivery notifications, and initiates return/replacement tickets. |
| `FINANCE_EXECUTIVE` | Finance Executive | Monitors generated Sales Invoices (`INV`), credit limits, freight charges, and accounts receivables. |
| `ADMIN` / `SUPER_ADMIN` | System Administrator | Grants system permissions, configures transport vendors, and manages system-wide master data. |

### 2.3 Verified RBAC Permission Matrix

| Permission Code | Category | Roles Granted Access | Description |
| :--- | :--- | :--- | :--- |
| `logistics.dispatches.read` | Read | `DISPATCH_EXECUTIVE`, `STORE_MANAGER`, `SALES_EXECUTIVE`, `SALES_MANAGER`, `PLANT_HEAD`, `ADMIN`, `SUPER_ADMIN` | View dispatch queue, active consignments, transit status, and history. |
| `logistics.dispatches.create` | Mutation | `DISPATCH_EXECUTIVE`, `STORE_MANAGER`, `ADMIN`, `SUPER_ADMIN` | Create new dispatch consignment notes, allocate items, and assign transport details. |
| `logistics.dispatches.start-delivery` | Mutation | `DISPATCH_EXECUTIVE`, `STORE_MANAGER`, `ADMIN`, `SUPER_ADMIN` | Mark consignment as `OUT_FOR_DELIVERY` and trigger carrier transit notifications. |
| `logistics.dispatches.confirm-delivery` | Approval / Mutation | `DISPATCH_EXECUTIVE`, `STORE_MANAGER`, `ADMIN`, `SUPER_ADMIN` | Confirm customer receipt, upload POD images, capture GPS tags, and execute inventory stock OUT. |
| `dispatch.create` / `dispatch.read` / `dispatch.update` | Mutation | `DISPATCH_EXECUTIVE`, `STORE_MANAGER`, `ADMIN`, `SUPER_ADMIN` | Domain-level fallback permissions for dispatch note edits and status changes. |

---

## 3. End-to-End Dispatch Lifecycle & Workflow State Machine

The dispatch lifecycle consists of 5 main state transitions:

```
[ READY_FOR_DISPATCH ] 
          │
          ▼ (Create Dispatch Note & Draft Invoice)
[ IN_TRANSIT ] 
          │
          ▼ (Vehicle Dispatched / Out for Delivery)
[ OUT_FOR_DELIVERY ] 
          │
          ▼ (Confirm Delivery + Upload POD + Geolocation)
[ DELIVERED ] ──► (Triggers Stock OUT & Completes Sales Order)
```

### State Transition Breakdown & Automated System Actions

| Current Status | Next Status | Trigger Action | Automated System Operations |
| :--- | :--- | :--- | :--- |
| `READY_FOR_DISPATCH` | `IN_TRANSIT` | Executive submits `/api/backend/logistics/dispatches` | 1. Generates `DISP-YYYY-XXXX` number.<br>2. Validates Customer Credit Limit (`CreditService`).<br>3. Generates Draft Sales Invoice `INV-YYYY-XXXX`.<br>4. Locks Finished Goods reservation (`SalesOrderAllocation`).<br>5. Updates WorkOrder status to `DISPATCHED`. |
| `IN_TRANSIT` | `OUT_FOR_DELIVERY` | Executive submits `/start-delivery` | 1. Updates shipment status to `OUT_FOR_DELIVERY`.<br>2. Increments optimistic lock version number. |
| `OUT_FOR_DELIVERY` / `IN_TRANSIT` | `DELIVERED` | Executive submits `/confirm-delivery` | 1. Records `deliveredAt`, receiver details, and GPS coordinates.<br>2. Uploads and approves Proof of Delivery (`podUrl`).<br>3. **Executes Inventory Stock `OUT`** transaction from Finished Goods warehouse.<br>4. Clears active stock reservation.<br>5. Updates Sales Order status to `COMPLETED`. |

---

## 4. Sub-Modules & Screen Functionalities

### 4.1 Dispatch Overview Dashboard (`/dispatch/dashboard` & `/dispatch`)
- **Key Metrics Display**: Total active dispatches, pending shipments, in-transit count, delivered count, and return requests.
- **Dispatch Register Data Table**: Paginated view of all dispatch orders with quick-search by Dispatch Number, Customer Name, or Sales Order.
- **Action Toolbar**: Quick navigation to create new dispatches, view transit logs, or manage pending queues.

### 4.2 Ready for Dispatch Queue (`/dispatch/orders`)
- **Staging Items Table**: Displays all Work Orders and finished goods items cleared by QC (`status = READY_FOR_DISPATCH`).
- **Inspection Verification**: Displays QC Approved Quantity vs. Ordered Quantity and Production Staging Date.
- **Bulk Selection & Grouping**: Allows selection of items belonging to the same Sales Order to launch single or multi-item dispatch creation.

### 4.3 Create Dispatch Consignment (`/dispatch/create-dispatch` & `/dispatch/create`)
- **Consignment Metadata Form**:
  - Auto-fills Customer billing & shipping address from Sales Order.
  - Auto-calculates remaining dispatchable quantity (`Ordered - Already Dispatched`).
- **Transport & Driver Logistics Input**:
  - Transporter Name, Vehicle Number, Driver Name, and Driver Contact Phone.
  - Total Shipment Weight (kg/tons) & Freight Amount ($ / ₹).
  - E-Way Bill Number & Customer Purchase Order reference.
- **Financial Validation Gatekeeper**: Runs automated check against customer credit limit before issuing dispatch note.

### 4.4 In-Transit Tracking & Live Status (`/dispatch/in-transit`)
- **Active Consignments View**: Lists all shipments currently on the road (`IN_TRANSIT` or `OUT_FOR_DELIVERY`).
- **Transit Details & ETA**: Displays Driver phone, carrier vehicle number, transit remarks, and Estimated Time of Arrival.
- **Status Transition Action**: One-click action to transition status from `IN_TRANSIT` to `OUT_FOR_DELIVERY`.

### 4.5 Delivery Confirmation & POD (`/dispatch/delivery`)
- **Receiver Information Capture**: Receiver Name, Contact Phone, and Delivery Notes/Remarks.
- **Digital Proof of Delivery (POD)**: File upload portal for signed Delivery Challan / Receiver Invoice copy.
- **GPS Location Capture**: Captures device Latitude & Longitude at point of delivery confirmation.
- **Stock Clearance & Accounting Trigger**: Finalizes stock reduction and sets order status to `COMPLETED`.

### 4.6 Dispatch History & Audit Trail (`/dispatch/history`)
- **Historical Ledger**: Searchable & filterable record of all historic dispatches.
- **Audit Logs**: Logs timestamp, actor name (`actorId`, `actorName`), action performed (`DISPATCH_CREATED`, `DISPATCH_IN_TRANSIT`, `DELIVERY_CONFIRMED`), and status changes.
- **Document Export & Detail Modal**: View and print complete Dispatch Note, Gate Pass, attached Invoice, and POD image.

### 4.7 Sample Dispatch Workflow (`/dispatch/sample-dispatch`)
- **R&D & Commercial Samples**: Dedicated workflow for sending product samples to prospective customers without standard commercial invoicing.
- **Sample Request Linking**: Tracks Sample Request ID, recipient address, dispatch quantity, and sample feedback.

### 4.8 Sales Returns Management (`/dispatch/returns`)
- **Return Request (RMA) Processing**: Handles return orders for damaged, defective, or rejected goods.
- **Workflow Pipeline**: `SUBMITTED` -> `QC_INSPECTION_PENDING` -> `ACCEPTED_FOR_REPLACEMENT` / `ACCEPTED_FOR_CREDIT` / `REJECTED`.
- **QC Integration**: Coordinates with QC Inspector to evaluate return reason and authorize credit notes or replacements.

### 4.9 Replacements Dispatch (`/dispatch/replacements`)
- **Replacement Order Fulfillment**: Issue and dispatch replacement goods against approved return requests.
- **Reference Linking**: Automatically references original return ticket ID and original sales order number on the replacement dispatch note.

---

## 5. Technical Architecture & Database Data Models

### 5.1 Prisma Database Models

#### `Dispatch` Model
```prisma
model Dispatch {
  id                    String              @id @default(uuid())
  dispatchNo            String              @unique
  salesOrderId          String
  salesOrder            SalesOrder          @relation(fields: [salesOrderId], references: [id])
  status                String              // IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
  isSubmitted           Boolean             @default(false)
  createdById           String?
  deliveryAddress       String?
  totalWeight           Decimal?
  transporterName       String?
  vehicleNumber         String?
  driverName            String?
  driverPhone           String?
  transitRemarks        String?
  freightAmount         Decimal?
  eta                   DateTime?
  invoiceNumber         String?
  ewayBillNumber        String?
  dispatchedAt          DateTime?           @default(now())
  deliveredAt           DateTime?
  deliveredQuantity     Decimal?
  receivedBy            String?
  receiverPhone         String?
  deliveryRemarks       String?
  podUrl                String?
  podStatus             String?             // PENDING, APPROVED, REJECTED
  podReceivedAt         DateTime?
  deliveryLatitude      Float?
  deliveryLongitude     Float?
  deliveredById         String?
  version               Int                 @default(1)
  items                 DispatchItem[]
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}
```

#### `DispatchItem` Model
```prisma
model DispatchItem {
  id                    String              @id @default(uuid())
  dispatchId            String
  dispatch              Dispatch            @relation(fields: [dispatchId], references: [id], onDelete: Cascade)
  salesOrderItemId      String
  salesOrderItem        SalesOrderItem      @relation(fields: [salesOrderItemId], references: [id])
  quantity              Decimal
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}
```

---

## 6. Business Validation Rules & Safety Controls

1. **Over-Dispatch Protection**:
   $$\sum \text{Dispatched Qty} + \text{New Dispatch Qty} \le \text{Ordered Qty}$$
   The system calculates already dispatched quantities per order item and rejects any attempt to dispatch more than the remaining ordered balance.

2. **QC Inspection Alignment**:
   Compares requested dispatch quantity against total QC-approved quantity across corresponding Work Orders. Produces warning/audit logs if dispatch exceeds QC-approved quantity.

3. **Customer Credit Limit Gate**:
   Before creating a dispatch, the system computes:
   $$\text{Projected Balance} = \text{Current Outstanding Balance} + \text{New Dispatch Total Invoice Value}$$
   If $\text{Projected Balance} > \text{Customer Credit Limit}$, the dispatch creation is **blocked** with a `BadRequestException`.

4. **Inventory Stock Reservation & Stock OUT**:
   - On **Dispatch Creation**: Stock is reserved via `SalesOrderAllocation` (`FINISHED_GOODS_RESERVATION`).
   - On **Delivery Confirmation**: An explicit `InventoryTransaction` of type `OUT` is posted against the `Finished Goods` warehouse, and the reservation is released.

---

## 7. Backend API Specifications

| Method | Route Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/backend/logistics/dispatches` | `logistics.dispatches.read` | List dispatches (filtered by status or customer). |
| `GET` | `/api/backend/logistics/dispatches/:id` | `logistics.dispatches.read` | Retrieve full dispatch details including items, sales order, & invoice. |
| `POST` | `/api/backend/logistics/dispatches` | `logistics.dispatches.create` | Create a new dispatch note, draft invoice, and allocate inventory. |
| `POST` | `/api/backend/logistics/dispatches/:id/start-delivery` | `logistics.dispatches.start-delivery` | Update dispatch status to `OUT_FOR_DELIVERY`. |
| `POST` | `/api/backend/logistics/dispatches/:id/confirm-delivery` | `logistics.dispatches.confirm-delivery` | Confirm delivery, record POD & GPS tags, and execute warehouse stock OUT. |

---
*Documentation compiled and verified for the Enterprise ERP System.*
