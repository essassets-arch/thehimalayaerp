# Himalaya ERP V2 — Official Responsive Standard & Engineering Blueprint

---

## 1. Scope & Purpose

This standard defines the non-negotiable architectural and visual responsive requirements for **Himalaya ERP V2**. All frontend engineers and automated agents must adhere to these rules when building or modifying screens.

The existing **desktop experience (≥ 1280px)** represents the approved ERP interface and **must remain visually and functionally stable**. No redesigns or workflow modifications are permitted during responsive remediation.

---

## 2. Standard Viewport Matrix

All routes and components must be verified against the following matrix:

| Category | Viewport (W × H) | Representative Devices / Form Factors |
| :--- | :--- | :--- |
| **Mobile (Compact)** | `320 × 568` | iPhone SE (1st Gen), compact Android devices |
| **Mobile (Standard)** | `360 × 800` | Samsung Galaxy S20/S21/S22/A-series |
| **Mobile (Modern iOS)**| `390 × 844` | iPhone 12, 13, 14, 15 Pro |
| **Mobile (Large Android)**| `412 × 915` | Google Pixel 7/8, Galaxy S23+/Ultra |
| **Tablet (Compact / Mini)**| `600 × 960` | 7-inch & 8-inch Android tablets, iPad Mini |
| **Tablet (Standard Portrait)**| `768 × 1024` | iPad 9.7", iPad Air, iPad 10th Gen |
| **Tablet (Standard Landscape)**| `1024 × 768` | iPad Landscape, Small Laptops / Surface Pro |
| **Desktop (HD)** | `1280 × 720` | 720p HD Display, standard business monitors |
| **Desktop (Standard)** | `1440 × 900` | 13"/15" MacBook Pro, business laptops |
| **Desktop (Full HD)** | `1920 × 1080`| 1080p FHD External Monitors, Workstations |

---

## 3. Responsive Acceptance Criteria

A screen is considered **Production-Grade Responsive** if and only if it satisfies all of the following rules:

### A. Layout & Overflow Integrity
1. **Zero Unintended Horizontal Overflow**: `document.documentElement.scrollWidth === document.documentElement.clientWidth` at all screen sizes.
2. **Container Padding Reflow**:
   - `padding: 24px` on desktop (≥ 1024px)
   - `padding: 16px` on tablet (641px – 1023px)
   - `padding: 12px` on mobile (≤ 640px)
3. **No 100vw Scrollbar Blowout**: Do not use `width: 100vw` inside padded layout parents; use `width: 100%` and `max-width: 100%`.
4. **Flex Child Shrinkage**: All flex children containing text or dynamic widgets must have `min-width: 0` (`min-w-0`) to prevent blowout.

### B. Navigation & Header
1. **Drawer Navigation**: On `< 1024px`, the sidebar collapses into a slide-over mobile drawer.
2. **Backdrop & Scroll Locking**: Opening the mobile drawer locks `document.body` scrolling (`overflow: hidden`) and provides a touch backdrop.
3. **Bottom Navigation**: Primary bottom bar visible on mobile displays 3 primary quick links + 1 "More" menu.
4. **Header Reflow**: Search input on mobile must collapse gracefully, and action buttons must wrap or use icon-only touch targets.

### C. Data Tables
1. **Horizontal Scroll Strategy**: Wide ERP tables (8+ columns) must be housed in dedicated containers with:
   ```css
   .table-responsive {
     width: 100%;
     overflow-x: auto;
     -webkit-overflow-scrolling: touch;
   }
   ```
2. **Sticky Identity Column**: The first column (e.g. Order ID, Lead Name, Product SKU) stays pinned if horizontal scrolling is extensive.
3. **Mobile Card Transformation**: Where operational context demands rapid mobile browsing (e.g., Quick Tasks, Approvals), tables reflow into stacked cards with clear labeled key-value pairs.

### D. Forms & Inputs
1. **Column Reflow**:
   - Multi-column forms (2–4 columns) collapse into 1 column on `< 640px`.
   - Grid classes: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.
2. **Touch Targets**: All interactive elements (inputs, select triggers, buttons) must have a minimum touch target of `44 × 44px`.
3. **Action Footers**: Form submit / cancel buttons must be sticky or stack vertically on mobile screens with `w-full`.

### E. Modals, Sheets & Dialogs
1. **Responsive Sizing**:
   ```css
   .erp-modal-content {
     width: min(92vw, 680px);
     max-height: 90vh;
     overflow-y: auto;
     padding: 16px;
   }
   ```
2. **No Fixed Offsets**: Modals must be centered with flexbox or CSS grid, never large fixed pixel offsets (`top: 100px; left: 350px`).

### F. Charts & Visualizations
1. **Responsive Containers**: All Recharts components must be enclosed in `ResponsiveContainer width="100%" height={...}`.
2. **Aspect Ratio & Height Constraints**: Chart height adjusts to `240px` on mobile, `320px` on tablet, and `380px` on desktop.
3. **Legends & Tooltips**: Chart legends must wrap horizontally below the chart on mobile.

---

## 4. Breakpoint Reference Table

```text
  ┌──────────────────────────────────────────────────────────┐
  │ Mobile          < 640px    (sm)  - Single column reflow  │
  ├──────────────────────────────────────────────────────────┤
  │ Large Mobile    640–767px  (md-) - 1-2 column grids      │
  ├──────────────────────────────────────────────────────────┤
  │ Tablet          768–1023px (lg-) - Collapsed sidebar     │
  ├──────────────────────────────────────────────────────────┤
  │ Small Desktop   1024–1279px(xl-) - Expanded desktop      │
  ├──────────────────────────────────────────────────────────┤
  │ Full Desktop    ≥ 1280px   (2xl) - Full workspace layout │
  └──────────────────────────────────────────────────────────┘
```
