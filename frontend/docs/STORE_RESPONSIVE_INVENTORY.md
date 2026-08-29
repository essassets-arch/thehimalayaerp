# Himalaya ERP V2 — Store Responsive Inventory

## 1. Overview & Scope

This document inventories all **17 route states, inventory ledgers, raw material stock, store releases, material indents, tables, forms, modals, drawers, and charts** in the **Store** portal (`/store/*`).

| Metric | Count |
| :--- | :--- |
| **Total Store Views** | 17 |
| **Main Routing Module** | [`modules/store/pages/StorePortal.jsx`](file:///d:/prototype-next-main/frontend/modules/store/pages/StorePortal.jsx) |
| **Next.js Page Entrypoints** | 3 (`app/(dashboard)/store/*`) |
| **Sub-components & Dedicated Views** | 10 |
| **Current Baseline Risk Status** | 0 P0, 16 P1 Risks, 1 P2 Risk, 0 P3 Risks |

## 2. Store Complete Route & Component Inventory

| Route | View | Main Component | Tables | Forms | Modals | Drawers | Charts | Special UI | Responsive Risk | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/store/dashboard` | Store Operations Hub & Inventory Summary | `StoreDashboard.jsx / StorePortal.jsx` | Low Stock Alerts Table, Recent Receipts Table | Inventory search filter, Category toggle | Stock Adjustment dialog, Reorder Indent modal | None | PieChart (Stock Distribution by Category), BarChart | Valuation Counter Cards, Safety Stock Health Chips | KPI Card grid compression & chart legend collision on 320/360px | **P1** |
| `/store/raw-inventory` | Raw Materials Master Inventory & Stock Levels | `StorePortal.jsx (`raw-inventory`)` | Raw Material Inventory Master Table | Material SKU search, Category picker, Unit filter | Stock Detail Inspection modal, Adjustment modal | None | None | Stock Health Indicators, Location / Rack badges | Wide multi-column table without touch-scroll containment | **P1** |
| `/store/low-stock-alerts` | Critical Stock Shortage & Buffer Alerts | `StorePortal.jsx (`low-stock-alerts`)` | Critical Shortage Items Table | Urgency filter, Material search | Quick Indent Creation modal | None | None | Urgent Reorder Alert Tags, Days of Inventory pill | Table container width blowout on small mobile screens | **P1** |
| `/store/analysis-requests` | Product & Brand Analysis Quality Requests | `BrandAnalysisRequests.jsx` | Brand Analysis Requests Table | Inspector filter, Date picker | Brand Analysis Inspection Details modal | None | None | QA Status Badges, Batch Sample Stamp | Modal width fixed constraint exceeding mobile screen | **P1** |
| `/store/material-requests` | Shopfloor Raw Material Requisitions Queue | `StorePortal.jsx (`material-requests`)` | Pending Material Requisitions Table | Department filter, Shift selector | Material Approval / Rejection modal | None | None | BOM Validation Chip, Department Urgency Badge | Action button bar wrapping & row spacing on narrow screens | **P1** |
| `/store/store-releases` | Material Handover & Store Release Verification | `StoreReleasesView.jsx` | Store Handover Releases Table | OTP / Release Code verification input | Release Handover Confirmation modal | None | None | Handover Milestone Stepper, Line Worker Acknowledgment | Quantity breakdown 3-column compression on 320px screens | **P1** |
| `/store/issued-history` | Material Handover & Issuance Ledger History | `StorePortal.jsx (`issued-history`)` | Historical Material Issuance Table | Date range filter, Recipient search | Issuance Receipt viewer modal | None | None | Store Executive Stamp, Shift Handover Badge | Table horizontal touch containment | **P1** |
| `/store/purchase?tab=Create Request` | Purchase Indent Creation & Material Requisition | `ProcurementForm.jsx` | Dynamic Material Line Items Table | Multi-field Indent Form, Vendor Quote Picker | Add Line Item dialog | None | None | Dynamic Item Add Row, Total Cost Estimator | Multi-field form grid rigidity on small screens | **P1** |
| `/store/purchase?tab=Verify Delivery` | Inward PO Delivery Inspection & GRN Creation | `StorePortal.jsx (`verify-delivery`)` | Inward Gate Pass & Delivery Table | Quantity received entry, Quality check toggles | GRN Generation modal, Discrepancy Note dialog | None | None | Vendor Challan Matcher, Physical Count Verifier | Numeric entry inputs compression in modal dialog | **P1** |
| `/store/purchase?tab=Delivery History` | Vendor Inward Receipts & Delivery Log | `StorePortal.jsx (`delivery-history`)` | Historical Inward Deliveries Table | Vendor search, Date range selector | Delivery Proof & Challan Viewer modal | None | None | Challan Attachment Badge, Gate Pass Reference | Table container expansion without touch scroll | **P1** |
| `/store/purchase?tab=GRN History` | Goods Receipt Notes (GRN) Official Archive | `StorePortal.jsx (`grn-history`)` | GRN Master Table | GRN No search, Status filter | GRN Printable Document modal | None | None | Accounting Sync Status, GRN Value Chip | Printable document modal width scaling | **P1** |
| `/store/purchase?tab=Material Rejections` | Inward Quality Rejections & Vendor RMA Log | `MaterialRejections.jsx` | Inward Defect Rejections Table | Rejection reason selector, Debit note trigger | Vendor Return Authorization modal | None | None | Debit Note Reference, Quarantine Bay Tag | Defect table columns compression on mobile | **P1** |
| `/store/purchase?tab=Replacement Deliveries` | Vendor Replaced Material Inward Handover | `StorePortal.jsx (`replacement-deliveries`)` | Vendor Replacements Queue Table | Replacement inspection form, Bin assigner | Restocking Verification dialog | None | None | Original Defect Linked Reference, Restock Badge | Multi-action buttons wrapping on mobile viewports | **P1** |
| `/store/purchase?tab=Indent History` | Purchase Indents Complete Audit Archive | `IndentHistory.jsx` | Historical Purchase Indents Table | Department filter, Status dropdown | Indent Full Breakdown modal | None | None | 5-column Metric Strip, Approval Timeline | Fixed 5-column metric strip compression on 320px | **P1** |
| `/store/reports` | Store Inventory Valuation & Consumption Reports | `StoreSummaryReport.jsx` | Category Consumption & Stock Value Table | Date range picker, Valuation method selector | Export Excel / PDF Options modal | None | BarChart (Monthly Consumption), AreaChart | Valuation Total Banners, Scrap Ratio Metric | Analytics chart container fixed minmax width | **P1** |
| `/store/vendor-master` | Approved Suppliers & Procurement Directory | `vendor-master/page.tsx` | Vendor Master Directory Table | Add Vendor multi-field form, GST / PAN validator | Add / Edit Vendor modal, Bank Details dialog | None | None | Supplier Rating Badge, Payment Terms Chip | Multi-column form grid in Add Vendor modal | **P1** |
| `/store/profile` | Store Manager Profile & Security Settings | `MyProfileView.jsx` | None | Profile details form, Password update form | Security confirmation modal | None | None | Store Authority Stamp, Avatar Uploader | Single-column form layout flow on mobile | **P2** |
