# Himalaya ERP V2 — Phase 7 Functional Master Inventory

## 1. Enterprise Workflow Scope

This inventory documents all **8 core enterprise workflows, 14 role profiles, document sequencing rules, and inventory mathematical integrity formulas** across Himalaya ERP V2.

| Workflow Name | Pipeline Lifecycle | Primary Roles | Key Entities | Document Number Prefixes | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Sales & Quotations Lifecycle** | Lead Creation -> Quotation Generation -> Commercial Terms -> Order Conversion -> Order Confirmation | Sales, SuperSales, Super Admin | Lead, Quotation, Order, Customer, Salesperson | `lead/26-27/XXXX, QU/26-27/XXXX, HCPPL/26-27/XXXX` | ✅ **VERIFIED_PASS** |
| **Plant Head Planning & Work Orders** | Incoming Order -> Production Planning -> Batch Sizing -> Work Order Generation -> Material Requisition | Plant Head, Production | Order, ProductionPlan, WorkOrder, MaterialRequest | `WO/26-27/XXXX, MR/26-27/XXXX` | ✅ **VERIFIED_PASS** |
| **Store Procurement & Inventory Management** | Low Stock Alert -> Indent Creation -> Plant Head Sign-off -> Finance Approval / PO -> Delivery Receipt -> GRN -> Stock Increment | Store, Plant Head, Finance | InventoryItem, PurchaseIndent, PurchaseOrder, DeliveryReceipt, GRN | `IND/26-27/XXXX, PO/26-27/XXXX, GRN/26-27/XXXX` | ✅ **VERIFIED_PASS** |
| **Production Execution & Material Release** | Material Release Verification -> Machine Batch Logging -> Daily Production Report -> Completed Goods Staging | Production, Store | StoreRelease, DailyReport, BatchLog, FinishedGoods | `SR/26-27/XXXX, DPR/26-27/XXXX` | ✅ **VERIFIED_PASS** |
| **Quality Control & Defect Rejection** | Inward QC Inspection -> Parameter Testing -> Pass / Reject Determination -> Rejection Log / Replacement Trigger | QC, Store, Production | QCInspection, DefectRecord, ReplacementDelivery | `QC/26-27/XXXX, REJ/26-27/XXXX` | ✅ **VERIFIED_PASS** |
| **Dispatch & Road Logistics Tracking** | Finished Goods Allocation -> Outward Challan -> Vehicle / Driver Assignment -> Live Road Transit -> Delivery / POD Archive | Dispatch, Dispatch 2 | Challan, VehicleLog, DeliveryPOD, SampleDispatch, ReplacementShipment | `DC/26-27/XXXX, POD/26-27/XXXX` | ✅ **VERIFIED_PASS** |
| **Finance Settlement & Ledger Reconciliation** | Invoice Billing -> Payment Receipt -> Bank Reconciliation -> UTR Verification -> FULL_PAID Status -> Order Closure | Finance, Finance Executive | Invoice, PaymentReceipt, BankTransaction, GeneralLedger | `INV/26-27/XXXX, REC/26-27/XXXX, JV/26-27/XXXX` | ✅ **VERIFIED_PASS** |
| **HR Biometrics, Leaves & Payroll Lifecycle** | Employee Master -> Biometric Attendance -> Leave Management -> Salary Preparation -> Multi-Tier Approval -> Bank NEFT Disbursement | HR, Super Admin, Finance | Employee, AttendanceRecord, LeaveRequest, SalaryStructure, PayrollBatch | `EMP/XXXX, PAY/26-27/XXXX` | ✅ **VERIFIED_PASS** |

## 2. Core Mathematical & State Invariants

1. **Inventory Available Quantity Invariant**:
   `availableQuantity = quantity - reservedQuantity`
   - If `availableQuantity == 0` -> `OUT OF STOCK`
   - If `0 < availableQuantity <= minimumStock` -> `LOW STOCK`
   - If `availableQuantity > minimumStock` -> `IN STOCK`

2. **Document Sequencing Isolation Invariant**:
   - Financial Year format: `YY-YY` (e.g. `26-27`)
   - Zero-padded sequence numbers: `4 digits` (e.g. `0001`, `0002`)
   - Separate sequence tables for each entity type to prevent numbering cross-pollution.

3. **Payroll Multi-Tier State Machine Invariant**:
   `DRAFT` -> `HR_VERIFIED` -> `PENDING_SUPER_ADMIN_APPROVAL` -> `SUPER_ADMIN_APPROVED` -> `PENDING_FINANCE` -> `PROCESSING` -> `PAID`

4. **Order Status Financial Closure Invariant**:
   `PENDING` -> `IN_PRODUCTION` -> `READY_FOR_DISPATCH` -> `DISPATCHED` -> `DELIVERED` -> `FULL_PAID` -> `ORDER_CLOSED`
