# Himalaya ERP V2 — Sales & SuperSales Responsive Inventory

---

## 1. Route & Sub-View Inventory

| Panel | Route | View / State | Primary Component | UI Type | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sales** | `/sales/dashboard` | Executive KPIs & Telemetry | `DashboardView.jsx` | Dashboard / Charts | `WARNING` |
| **Sales** | `/sales/daily-task` | Daily Follow-ups & Calendar | `DailyTaskView.jsx` | List / Calendar | `WARNING` |
| **Sales** | `/sales/leads` | Leads Directory & CRM Table | `LeadsView.jsx` | Table / Filters | `FAIL-P1` |
| **Sales** | `/sales/leads/create` | 4-Step Lead Creation Wizard | `CreateLead.jsx` | Multi-step Form | `FAIL-P1` |
| **Sales** | `/sales/leads/[id]/edit` | Lead Editing & Conversion | `CreateLead.jsx` | Form / Modal | `FAIL-P1` |
| **Sales** | `/sales/quotations` | Quotations Directory & Drawer | `QuotationsView.jsx` | Table / Drawer | `FAIL-P1` |
| **Sales** | `/sales/quotations/create` | Itemized Quotation Builder | `CreateQuotation.jsx` | Complex Form | `FAIL-P1` |
| **Sales** | `/sales/orders` | Orders Directory & Tracking | `OrdersView.jsx` | Table / Timeline | `FAIL-P1` |
| **Sales** | `/sales/orders/create` | Convert/Create Sales Order | `CreateOrder.jsx` | Form | `WARNING` |
| **Sales** | `/sales/orders/[id]` | Order Detail & Workflow Status | `OrderTimeline.jsx` | Detail / Stepper | `FAIL-P1` |
| **Sales** | `/sales/samples` | Sample Requisitions & History | `SamplesView.jsx` | Table / Stepper | `FAIL-P1` |
| **Sales** | `/sales/samples/create` | New Sample Requisition | `CreateSample.jsx` | Form | `PASS` |
| **Sales** | `/sales/samples/[id]/edit` | Edit Sample Specification | `EditSample.jsx` | Form | `PASS` |
| **Sales** | `/sales/customers` | Customer Directory & Credit | `CustomersView.jsx` | Table / Cards | `FAIL-P1` |
| **Sales** | `/sales/customer-complaints` | Complaints & RMA Workspace | `CustomerComplaintManagement.jsx` | Table / Drawer | `FAIL-P1` |
| **Sales** | `/sales/production-status` | Floor Tracking Visibility | `SalesProductionStatusView.jsx` | Cards / Progress | `PASS` |
| **Sales** | `/sales/payment-followup` | Aging & Overdue Collections | `PaymentFollowupERPView.jsx` | Table / Modals | `FAIL-P1` |
| **Sales** | `/sales/payment-history` | Payment Receipts & Reversals | `PaymentHistoryView.jsx` | Table / Receipts | `FAIL-P1` |
| **Sales** | `/sales/reports` | Sales Performance Reports | `ReportsView.jsx` | Charts / Reports | `PASS` |
| **Sales** | `/sales/profile` | Sales Executive Profile | `MyProfileView.jsx` | Profile Cards | `PASS` |
| **SuperSales**| `/supersales/dashboard` | High-Volume Sales Dashboard | `DashboardView.jsx` | Dashboard / KPIs | `WARNING` |
| **SuperSales**| `/supersales/daily-task` | SuperSales Tasks & Reminders | `DailyTaskView.jsx` | List / Calendar | `WARNING` |
| **SuperSales**| `/supersales/leads` | SuperSales Leads Pipeline | `LeadsView.jsx` | Table / Filters | `FAIL-P1` |
| **SuperSales**| `/supersales/quotations` | SuperSales Quotations | `QuotationsView.jsx` | Table / Drawer | `FAIL-P1` |
| **SuperSales**| `/supersales/orders` | SuperSales High-Volume Orders | `OrdersView.jsx` | Table / Timeline | `FAIL-P1` |
| **SuperSales**| `/supersales/customers` | SuperSales Key Accounts | `CustomersView.jsx` | Table / Credit | `FAIL-P1` |
| **SuperSales**| `/supersales/samples` | SuperSales Sample Dispatch | `SamplesView.jsx` | Table / Stepper | `FAIL-P1` |
| **SuperSales**| `/supersales/payment-followup` | SuperSales Receivables | `PaymentFollowupERPView.jsx` | Table / Modals | `FAIL-P1` |
| **SuperSales**| `/supersales/payment-history` | SuperSales Collections | `PaymentHistoryView.jsx` | Table / Receipts | `FAIL-P1` |
| **SuperSales**| `/supersales/customer-complaints` | SuperSales RMA & Feedback | `CustomerComplaintManagement.jsx` | Table / Drawer | `FAIL-P1` |
| **SuperSales**| `/supersales/production-status` | SuperSales Live Floor Status | `SalesProductionStatusView.jsx` | Cards / Progress | `PASS` |

---

## 2. Key Target Areas for Remediation

1. **`CreateQuotation.jsx`**:
   - Line items form row with 8+ input columns blowing out on `< 768px`.
   - Dynamic Terms & Conditions checkboxes wrapping and tap targets.
   - Quotation calculations summary card wrapping.
2. **`QuotationsView.jsx` & `OrdersView.jsx`**:
   - Filter action toolbars wrapping on mobile.
   - Detail drawers (`.sheet-panel`) hardcoded widths (`maxWidth: '640px'`).
3. **`CreateLead.jsx` & `LeadsView.jsx`**:
   - 4-step wizard stepper reflow on compact phones (`320px`).
   - Kanban board / table toggle view touch-scrolling.
4. **`CustomerComplaintManagement.jsx` & `CustomerComplaints.css`**:
   - Complaint details drawer fixed widths (`width: 640px`).
   - Action buttons in ticket cards wrapping cleanly.
5. **`PaymentFollowupERPView.jsx` & `PaymentHistoryView.jsx`**:
   - Overdue Aging matrix table touch-scrolling and modal bounds.
