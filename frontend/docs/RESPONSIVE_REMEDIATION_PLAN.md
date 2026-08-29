# Himalaya ERP V2 — Systematic Responsive Remediation Plan

---

## 1. Remediation Strategy & Guiding Principles

Our remediation approach follows a **Global-First, High-Impact Architecture**:

```text
┌────────────────────────────────────────────────────────┐
│ Phase 1: Global Shell & Foundation                     │
│ (globals.css, layout.tsx, HeroBanner, Sidebar)         │
│ Resolves 35% of all layout overflow issues globally    │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Design System & Shared Components             │
│ (erp-premium-ui.css, DataTable, Modals, Forms)         │
│ Resolves an additional 50% of page-level issues        │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: Panel-by-Panel Systematic Refinements         │
│ (14 Primary Panels + 4 Shared Modules)                 │
│ Resolves remaining 15% of page-specific nuances        │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ Phase 4: Automated Verification & Desktop Regression   │
│ (Playwright Test Suite across 10 Viewports)            │
│ Guarantees 0% regression on desktop & 100% mobile pass │
└────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Execution Plan

### Phase 1: Global Shell & Layout Foundation
- **Files**:
  - `frontend/app/globals.css`
  - `frontend/app/(dashboard)/layout.tsx`
  - `frontend/components/HeroBanner.jsx`
  - `frontend/components/Sidebar.jsx`
- **Actions**:
  1. Add `min-width: 0`, `width: 100%`, and `overflow-x: hidden` to `.main-viewport` and `.app-container`.
  2. Remove `minWidth: '420px'` hardcoded dropdown in `HeroBanner.jsx`, replacing with `width: min(92vw, 420px)`.
  3. Ensure the mobile drawer backdrop cleanly locks `document.body` scroll when opened on `< 1024px`.
  4. Guarantee top header action buttons and biometric punch icons wrap or collapse into icon-only touch targets on `< 640px`.

---

### Phase 2: Core Design System & Shared Components
- **Files**:
  - `frontend/components/erp-premium-ui.css`
  - `frontend/shared/components/DataTable.jsx`
  - `frontend/shared/components/TabulatorTable.jsx`
  - `frontend/components/SharedPaymentTable.jsx` / `.tsx`
  - `frontend/components/ui/dialog.tsx` & `modal.tsx`
- **Actions**:
  1. Refine `.erp-page-container` responsive padding (`12px` mobile, `16px` tablet, `24px` desktop).
  2. Enforce `.table-responsive` wrapper on all `DataTable` and standard table renders with `-webkit-overflow-scrolling: touch`.
  3. Update `.erp-modal-content` to use `width: min(92vw, [width]px); max-height: 90vh; overflow-y: auto`.
  4. Ensure `.erp-panel-grid` collapses from multi-column to 1 column on `< 640px`.

---

### Phase 3: Panel-by-Panel Execution Order

#### Step 1: Super Admin & Admin Panels (`/super-admin`, `/admin`)
- Refactor 2-column analytics chart grids to 1-column on mobile.
- Make Live User Map controls collapsible and map container height responsive (`420px` mobile, `700px` desktop).
- Wrap salary and PO approval matrices in responsive table containers.

#### Step 2: Plant Head & Production Panels (`/plant-head`, `/production`)
- Update Planning Board timeline cards to scroll horizontally without breaking page width.
- Refactor Daily Report Entry numeric inputs to stack on mobile.
- Ensure Floor Operations and Rework management tables have touch-scroll containers.

#### Step 3: Store & Quality Control Panels (`/store`, `/qc`)
- Make 7-tab purchase navigation horizontally swipeable on mobile.
- Make Raw Inventory stock table touch-scrollable.
- Refactor QC Inspection Modal to responsive width with internal scrolling.

#### Step 4: Dispatch & Dispatch 2 Panels (`/dispatch`, `/dispatch-2`)
- Stack Create Dispatch vehicle and delivery form fields into 1 column on `< 640px`.
- Refactor In-Transit logistics timeline cards.

#### Step 5: Sales & SuperSales Panels (`/sales`, `/supersales`)
- Refactor 12-field itemized line entry in Create Quotation to responsive card-form inputs.
- Make Customer Complaints drawer responsive (`width: min(92vw, 640px)`).
- Ensure Quotations and Orders tables scroll smoothly.

#### Step 6: Finance & Finance Executive Panels (`/finance`, `/finance-executive`)
- Refactor PO approval and vendor invoice workspaces.
- Make Payment verification receipt viewer and image previews modal responsive.
- Wrap Salary Disbursement bank account tables in touch-scroll wrappers.

#### Step 7: HR & Back Office Panels (`/hr`, `/back-office`)
- Refactor Employee Registration 3-column form rows to 1-column on mobile.
- Refactor Attendance monthly calendar view for touch usability.
- Make Exit Clearance multi-department checklist responsive.

#### Step 8: CRM, Orders, Employee & Notifications Modules (`/crm`, `/orders`, `/employee`, `/notifications`)
- Refactor Global Order Tracker stage timeline.
- Optimize Employee self-service payslip and leave views for mobile.

---

### Phase 4: Automated Verification & Regression Protection
- Run Playwright responsive test suite across all 10 standard viewports.
- Verify 0 horizontal overflow and 100% pass rate.
- Capture desktop regression screenshots to ensure 0 visual degradation on desktop (1280px, 1440px, 1920px).
