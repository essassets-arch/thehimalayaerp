# Himalaya ERP - Comprehensive CSS Architecture & Mobile-Friendly Responsive Guide

---

## 1. Executive Summary

The Himalaya ERP application is a full-featured enterprise suite built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS v4**, and custom **Vanilla CSS / CSS Modules**.

While the application displays robustly on large desktop screens (≥ 1280px), on **mobile screens (320px – 640px)** and **tablets (641px – 1024px)**, users experience several severe layout degradation issues:
- **Horizontal screen blowout & clipping**: Content exceeds the viewport width, creating unwanted horizontal scrolling and cutting off essential buttons, tables, and forms.
- **Excessive / Compounding Padding & Margins**: Desktop paddings (24px–32px) compounded inside nested cards reduce usable mobile width to less than 200px.
- **Inflexible Multi-Column Grids**: 3-column and 4-column KPI cards and form inputs do not collapse into 1 or 2 columns on tablets and mobile devices.
- **Unconstrained Data Tables**: 8-to-14 column tables overflow their parent containers without proper touch-scroll wrappers or mobile card fallbacks.
- **Modals & Dialogs Overflow**: Hardcoded pixel widths (`width: 600px`, `width: 800px`) cause dialogs to spill off the right edge of mobile viewports, hiding close and submit buttons.
- **HeroBanner & Header Collisions**: The integrated top search bar, biometric punch clock, and notification badges collide on mobile headers when not sized with responsive flex/min-width rules.

This documentation serves as the **authoritative reference and audit** of the CSS architecture across the entire repository, detailing all stylesheets, design tokens, breakpoint fragmentation, root causes of responsive bugs, and providing the **exact responsive standard and refactoring blueprint** to make the entire application mobile-friendly.

---

## 2. Complete CSS Architecture & Directory Map

```
prototype-next-main/
└── frontend/
    ├── app/
    │   ├── globals.css                       # Master Global Stylesheet (8,909 lines)
    │   ├── layout.tsx                        # Root HTML & Provider Layout
    │   └── (dashboard)/
    │       ├── layout.tsx                    # Dashboard Shell Layout (Sidebar + HeroBanner + Main Viewport)
    │       ├── dispatch/                     # Dispatch Route CSS Modules
    │       │   ├── create-dispatch/create-dispatch.module.css
    │       │   ├── orders/orders.module.css & dispatch-orders.module.css
    │       │   ├── sample-dispatch/sample-dispatch.module.css
    │       │   ├── [id]/dispatch-detail.module.css
    │       │   └── delivery/delivery.module.css
    │       ├── plant-head/testing/testing.module.css
    │       ├── production/                   # Production Route CSS Modules
    │       │   ├── work-orders/work-orders.module.css
    │       │   ├── finished-goods/finished-goods.module.css
    │       │   ├── qc-pending/qc-pending.module.css
    │       │   ├── qc-failed/qc-failed.module.css
    │       │   ├── completed/completed.module.css
    │       │   ├── floor/floor.module.css
    │       │   └── all-stock/all-stock.module.css
    │       └── super-admin/[[...slug]]/dashboard.css
    ├── components/
    │   ├── erp-premium-ui.css                # Standard ERP Design System Classes
    │   ├── SalesDashboardResponsive.css      # Sales & Analytics Responsive Overrides
    │   ├── ProductionOperationsDashboard.css # Production Command Dashboard Styles
    │   ├── PlantHeadDashboardTheme.css       # Plant Head Visual Theme
    │   ├── PlantHeadCommandDashboard.css     # Plant Head Metrics & Table Styles
    │   ├── PlantHeadProductPie.css           # Pie Chart Scoped Styles
    │   ├── CustomerComplaints.css            # Complaint Portal Grid & Card Styles
    │   ├── OrdersView.module.css             # Orders View Module
    │   ├── payroll/PayrollWorkflowView.css   # Payroll Stepper & Workflow Styles
    │   ├── material-workflow/StoreReleasesView.css
    │   └── erp/
    │       ├── BrandAnalysisDetailModal.css
    │       └── BrandAnalysisCreateModal.css
    └── modules/
        ├── super-admin/
        │   ├── components/dashboard.css      # Super Admin Master Dashboard Styles (1,936 lines)
        │   └── pages/
        │       ├── SalesAnalyticsPage.css
        │       ├── ProductionAnalyticsPage.css
        │       ├── HRAnalyticsPage.css
        │       ├── DispatchAnalyticsPage.css
        │       ├── FinanceAnalyticsPage.css
        │       ├── InventoryAnalyticsPage.css
        │       └── PurchaseIndentsView.module.css
        ├── plant-head/pages/
        │   ├── ReplacementsView.module.css
        │   └── ReturnsView.module.css
        ├── hr/
        │   ├── pages/employeeDirectory.module.css
        │   └── employee/components/EmployeeDetails.module.css
        └── salary/styles/salary.css          # Salary Slip & Calculation Styles
```

---

## 3. Design System, Tokens & Base Layer

The application utilizes **Himalaya Brand Color Tokens** declared both in `:root` CSS variables and in Tailwind CSS v4 `@theme`.

### 3.1 Core Color Palette

| Token Variable | Hex Value | Semantic Purpose |
| :--- | :--- | :--- |
| `--color-primary` / `--color-navy` | `#2F4375` | Primary brand headers, active items, main buttons |
| `--color-primary-dark` / `--color-navy-dark` | `#24345C` | Deep typography, table headers, dark accents |
| `--color-secondary` / `--color-sky` | `#3BAEEB` | Accents, active indicators, focus rings, badge highlights |
| `--color-bg-base` | `#F5FAFE` | Main viewport canvas background |
| `--color-sidebar-bg` / `--color-surface` | `#FFFFFF` | Card surfaces, sidebar background, modals |
| `--color-border` | `#E5ECF5` / `#DCE5F0` | Structural borders, card borders, table dividers |
| `--color-text-primary` | `#24345C` | Primary headings, titles, high-emphasis text |
| `--color-text-secondary` | `#5E6B82` | Subtitles, labels, secondary information |
| `--color-text-muted` | `#8893A7` | Placeholders, inactive icons, timestamps |
| `--color-success` | `#22C55E` | Positive status, punch in active, completed items |
| `--color-danger` | `#EF4444` | High priority badges, alerts, punch out, critical errors |
| `--color-warning` | `#F59E0B` | Pending status, medium alerts |

### 3.2 Border Radius & Shadow Tokens

| Token Variable | Value | Usage |
| :--- | :--- | :--- |
| `--radius-xxl` | `20px` | HeroBanner, top-level panels |
| `--radius-xl` | `16px` | App cards, modal containers, dashboard panels |
| `--radius-lg` | `14px` | KPI cards, sub-panels |
| `--radius-md` | `10px` | Buttons, inputs, search boxes, nav items |
| `--shadow-premium` | `0 10px 35px -5px rgba(47, 67, 117, 0.06)` | HeroBanner, prominent elevation |
| `--shadow-card` | `0 8px 25px rgba(47, 67, 117, 0.08)` | Modal overlays, floating menus |

---

## 4. Current Breakpoint Audit & Fragmentation Analysis

Across the 35+ stylesheets in the codebase, media queries have been added ad-hoc over time. This has created **14 different breakpoint values**, leading to inconsistent behavior where one component collapses at 1024px while another collapses at 768px or 640px.

### 4.1 Existing Breakpoint Distribution

| Breakpoint Query | Stylesheets Using It | Purpose / Typical Override |
| :--- | :--- | :--- |
| `@media (max-width: 1500px)` | `dashboard.css` | 6-column KPI grid collapses to 4 columns |
| `@media (max-width: 1280px)` | `SalesDashboardResponsive.css` | 2-column analytics grid collapses to 1 column |
| `@media (max-width: 1200px)` | `globals.css`, `HRAnalyticsPage.css`, `DispatchAnalyticsPage.css`, `dashboard.css` | Form grids 4→2 columns; analytics charts stack |
| `@media (max-width: 1100px)` | `salary.css`, `dashboard.css`, `SalesDashboardResponsive.css` | Dashboard side column collapses below main column |
| `@media (max-width: 1024px)` | `globals.css`, `CustomerComplaints.css`, `dispatch/*.module.css`, `production/*.module.css` | **Tablet Threshold**: Grid 2→1, Hero search shrinks |
| `@media (max-width: 900px)` | `DispatchAnalyticsPage.css`, `dashboard.css`, `ReplacementsView.module.css` | Sidebar collapsed, chart heights compressed |
| `@media (max-width: 768px)` | **Every major stylesheet** (primary mobile switch) | **Mobile Threshold**: Sidebar transforms to off-canvas drawer, HeroBanner switches to mobile bar, bottom navigation toggled |
| `@media (max-width: 640px)` | `globals.css`, `erp-premium-ui.css`, `ReturnsView.module.css`, `salary.css` | Header cards stack vertically, forms 2→1 column |
| `@media (max-width: 560px)` | `dashboard.css` | Filters stack, KPI values font-size reduced |
| `@media (max-width: 520px)` | `globals.css`, `SalesDashboardResponsive.css` | Hero stat cards 2→1 column |
| `@media (max-width: 480px)` | `globals.css`, `dashboard.css`, `SalesDashboardResponsive.css` | Very small mobile phone layout, paddings dropped to 8px–12px |
| `@media (max-width: 390px)` | `globals.css`, `ReplacementsView.module.css` | iPhone standard width adjustments |
| `@media (max-width: 360px)` | `globals.css` | Ultra-compact phones (SE, Galaxy A-series) |

### 4.2 The "Tablet Dead Zone" Problem (768px – 1024px)
On iPads, iPad Air, Surface tablets, and foldable phones in tablet mode (768px – 1024px):
- The desktop sidebar (240px) is visible, leaving only **528px – 784px** for the main content area.
- Many pages still assume a full 1440px desktop screen and attempt to render **4-column KPI cards**, **10-column tables**, or **side-by-side split layouts**.
- Result: Severe horizontal clipping, text truncation (`...`), and buttons wrapping or overlapping on tablets.

---

## 5. In-Depth Root Cause Analysis: Why Mobile & Tablet Layouts Break

### 5.1 Issue 1: Hardcoded Widths and Missing `min-width: 0`
In CSS Flexbox and CSS Grid, flex children have a default `min-width: auto`. If an inner child contains a long string, fixed-width input, or table, the flex/grid item refuses to shrink below that width, blowing out the parent container.

```css
/* ❌ PROBLEM: Flex/Grid items blow out horizontally */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr; /* On tablet, min-width: auto prevents shrinking */
}

/* ✅ SOLUTION: Enforce min-width: 0 on all flex and grid children */
.dashboard-grid > * {
  min-width: 0;
  max-width: 100%;
}
```

### 5.2 Issue 2: Modal & Dialog Clipping on Mobile
Multiple modal components have hardcoded inline desktop styles:
`style={{ width: '800px', maxWidth: '800px' }}` or `style={{ width: '650px' }}`.
On a 375px mobile screen, an 800px modal is more than double the screen width. Because `max-width` is not constrained to `calc(100vw - 24px)` or `95vw`, the right 425px of the modal (including action buttons, form inputs, and close buttons) is invisible and inaccessible.

### 5.3 Issue 3: Compounding Nested Padding
When container padding nests:
- `.main-viewport`: `padding: 20px 20px 32px` (40px horizontal total)
- `.erp-page-container`: `padding: 24px` (48px horizontal total)
- `.app-card` / `.erp-table-card`: `padding: 24px` (48px horizontal total)
- **Total consumed padding**: 40px + 48px + 48px = **136px**!
On a 375px mobile screen: `375px - 136px = 239px` remaining for all content, inputs, tables, and buttons.

### 5.4 Issue 4: Inline Styles Overriding Responsive Stylesheets
Many JSX pages (e.g. `CreateLead.jsx`, `QuotationsView.jsx`, `OrdersView.jsx`, `DashboardView.jsx`) use inline styles:
```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
```
Inline styles have higher specificity than stylesheet classes, which bypasses CSS media queries unless targeted with brute-force `!important` regex selectors.

### 5.5 Issue 5: Data Tables Lacking Mobile Wrappers & Card Views
Tables with 8–12 columns (e.g. Leads, Quotations, Orders, Invoices, Stock Items, Employee Directory) cannot fit into a 360px portrait mobile screen.
Without a clean `.overflow-x-auto` wrapper with `-webkit-overflow-scrolling: touch` and responsive column minimums, the entire page gets widened, causing the navigation bar, hero banner, and all cards to misalign.

---

## 6. Target Standard: The Himalaya Responsive Design System

To ensure 100% mobile and tablet responsiveness across all present and future modules, all styles must adhere to the following **Unified Responsive Framework**.

### 6.1 Unified 5-Tier Breakpoint Specification

```
┌───────────────────────────┬─────────────────────┬───────────────────────────────────────────────────┐
│ Device Tier               │ Viewport Range      │ Layout Behavior                                   │
├───────────────────────────┼─────────────────────┼───────────────────────────────────────────────────┤
│ XS (Small Mobile)         │ ≤ 380px             │ 1-col grids, 8px padding, stacked actions, cards  │
│ SM (Standard Mobile)      │ 381px – 640px       │ 1 or 2-col grids, 12px padding, drawer sidebar    │
│ MD (Tablet / Foldable)    │ 641px – 1024px      │ 2 or 3-col grids, 16px padding, collapsible side  │
│ LG (Desktop Laptop)       │ 1025px – 1440px     │ 3 or 4-col grids, 20px padding, fixed sidebar     │
│ XL (Large Monitor / 4K)   │ ≥ 1441px            │ 4 to 6-col grids, max-width contained             │
└───────────────────────────┴─────────────────────┴───────────────────────────────────────────────────┘
```

### 6.2 Standard Spacing & Padding Scale

| Layout Element | Mobile (≤ 640px) | Tablet (641px – 1024px) | Desktop (≥ 1025px) |
| :--- | :--- | :--- | :--- |
| `.main-viewport` | `padding: 10px 10px 24px; gap: 12px;` | `padding: 16px 16px 28px; gap: 16px;` | `padding: 20px 20px 32px; gap: 24px;` |
| `.hero-banner` | `padding: 10px 12px; margin: 0;` | `padding: 14px 18px; margin: 0;` | `padding: 20px 24px; margin: 0;` |
| `.app-card` / `.erp-card` | `padding: 12px; border-radius: 12px;` | `padding: 16px; border-radius: 14px;` | `padding: 20px 24px; border-radius: 16px;` |
| Form Input Height | `min-height: 42px; font-size: 14px;` | `min-height: 40px; font-size: 13.5px;`| `min-height: 38px; font-size: 13px;` |
| Primary Action Buttons | `min-height: 44px; width: 100%;` | `min-height: 40px; width: auto;` | `min-height: 38px; width: auto;` |

---

## 7. Reusable Universal Responsive CSS Utilities

These classes are available globally in `globals.css` and `erp-premium-ui.css` to build responsive pages instantly without custom media queries.

### 7.1 Responsive Grid Utilities

```css
/* ── AUTO-COLLAPSING RESPONSIVE KPI GRID ── */
/* Desktop: 4 columns | Tablet: 2 columns | Mobile: 1 column */
.erp-kpi-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}
@media (max-width: 1024px) {
  .erp-kpi-grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
@media (max-width: 480px) {
  .erp-kpi-grid-4 {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

/* ── AUTO-COLLAPSING 2-COLUMN SPLIT GRID ── */
/* Desktop: 2 columns | Tablet/Mobile: 1 column */
.erp-two-col-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  width: 100%;
}
@media (max-width: 768px) {
  .erp-two-col-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

/* ── RESPONSIVE FORM GRID ── */
/* Desktop: 3 or 4 cols | Tablet: 2 cols | Mobile: 1 col */
.erp-form-grid-responsive {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}
@media (max-width: 1024px) {
  .erp-form-grid-responsive {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
@media (max-width: 640px) {
  .erp-form-grid-responsive {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
```

### 7.2 Universal Modal & Dialog Utility

```css
/* ── UNIVERSAL RESPONSIVE MODAL CONTAINER ── */
.erp-modal-responsive {
  width: 100%;
  max-width: 720px;
  max-height: 90dvh;
  margin: auto;
  border-radius: 16px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .erp-modal-responsive {
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px) !important;
    max-height: 94dvh !important;
    border-radius: 14px !important;
  }
}

@media (max-width: 380px) {
  .erp-modal-responsive {
    width: calc(100vw - 12px) !important;
    max-width: calc(100vw - 12px) !important;
    max-height: 96dvh !important;
    border-radius: 10px !important;
  }
}
```

### 7.3 Data Table Touch-Scroll & Responsive Wrapper

```css
/* ── RESPONSIVE TABLE WRAPPER ── */
.erp-table-responsive-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  border: 1px solid #DCE5F0;
  background: #ffffff;
}

.erp-table-responsive-wrapper table {
  width: 100%;
  min-width: 680px; /* Ensures columns stay legible while scrolling smoothly */
  border-collapse: collapse;
}

@media (max-width: 640px) {
  .erp-table-responsive-wrapper table {
    min-width: 580px;
  }
  .erp-table-responsive-wrapper th,
  .erp-table-responsive-wrapper td {
    padding: 10px 12px !important;
    font-size: 12px !important;
  }
}
```

---

## 8. Module-by-Module Layout Audit & Mobile Fix Guide

### 8.1 Layout Shell & Navigation (`HeroBanner.jsx`, `Sidebar.jsx`, `MainLayout.jsx`)
- **Desktop**: 240px fixed sidebar + top hero banner with search bar, biometric camera punch, notifications bell, and profile.
- **Mobile (≤ 768px)**:
  - Sidebar collapses to left off-canvas drawer (`transform: translateX(-320px)`), opened via the hamburger toggle.
  - HeroBanner brand title hides (`.brand-title { display: none }`), search bar takes flexible width (`flex: 1 1 auto; min-width: 0`), and action icons remain right-aligned.
  - Backdrop overlay handles click-to-close with full touch support.

### 8.2 Sales & CRM Portal (`LeadsView`, `QuotationsView`, `OrdersView`, `CustomersView`)
- **KPI Cards**: On mobile, `.sales-grid-4` and `.sales-grid-3` automatically collapse to 2 columns (or 1 column on ≤360px).
- **Filter Tabs**: `.filter-tabs` and `.filter-pills` use `overflow-x: auto` with hidden scrollbar for smooth swipeable tab filtering.
- **Action Buttons**: Header buttons (e.g. "+ Add Lead", "Export CSV") stack vertically on mobile (`width: 100%`) for easy thumb reach.
- **Forms (Create Lead / Create Quotation)**: 2-column and 3-column input grids collapse to 1 column on mobile screens.

### 8.3 Super Admin & Analytics (`dashboard.css`, Analytics Pages)
- **Top 6 KPI Cards**: Collapse from 6 columns (desktop) → 3 columns (1200px) → 2 columns (1024px) → 1 column (≤ 480px).
- **Chart Containers**: Recharts containers have `min-width: 0 !important; width: 100% !important;` and height constrained to 220px–260px on mobile to prevent chart truncation.

### 8.4 Plant Head & Production (`PlantHeadCommandDashboard`, `ProductionOperationsDashboard`)
- **Production Stage Pipeline**: Uses horizontal scroll wrappers with touch momentum scrolling (`-webkit-overflow-scrolling: touch`).
- **Machine & Floor Cards**: Grid layout collapses from 3 columns to 1 column on mobile devices.

### 8.5 Dispatch & Delivery (`create-dispatch`, `sample-dispatch`, `dispatch-orders`)
- **Step Process Wizard**: Form steps use vertical stacking with sticky bottom action buttons (`position: sticky; bottom: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px)`).

### 8.6 Finance & Payroll (`PaymentsView`, `salary.css`, `PayrollWorkflowView`)
- **Payment Verification Table**: Form inputs inside table cells use auto-expanding flex wrappers with horizontal touch scroll.
- **Salary Slip Generator**: Print layout (`@media print`) retains A4 portrait proportions while mobile preview collapses to stacked key-value pairs.

---

## 9. Mobile Optimization Checklist for Developers

When creating or updating any view or component in Himalaya ERP, verify this checklist:

- [ ] **No Hardcoded Pixel Widths**: Never use `width: '800px'` on cards, dialogs, or panels without `maxWidth: 'calc(100vw - 24px)'`.
- [ ] **Enforce `min-width: 0`**: Every Flex child and Grid item must have `min-width: 0` to prevent blowout.
- [ ] **Touch Targets**: All buttons, select menus, and interactive icons have a minimum touch target of **40px × 40px** (preferably **44px × 44px**).
- [ ] **Tables Wrapped**: All HTML `<table>` elements are wrapped in a container with `overflow-x: auto; -webkit-overflow-scrolling: touch;`.
- [ ] **Inputs Font-Size ≥ 16px on iOS**: On mobile viewports, ensure input font-size does not trigger auto-zoom on iOS (or use `font-size: 16px` at mobile breakpoint).
- [ ] **Viewport Margin Consistency**: Use `margin: 0` and `width: 100%` on top-level view containers to avoid horizontal scrollbars.
- [ ] **Safe Area Insets**: Modal sheets and bottom bars must respect `env(safe-area-inset-bottom)` for notched smartphones (iPhone 12–16, Galaxy S-series).

---

## 10. Conclusion & Next Steps

With this architecture and standardization guide:
1. All global layouts, hero banners, and sidebars maintain a unified, collision-free responsive state.
2. The 768px–1024px tablet range is properly accounted for with 2-column layouts.
3. Every future page and component built using `.erp-kpi-grid-4`, `.erp-form-grid-responsive`, and `.erp-modal-responsive` will automatically be 100% mobile-friendly with zero extra CSS required.
