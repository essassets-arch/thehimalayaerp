# Himalaya ERP — Frontend Project Structure

> **Stack**: Next.js 15 (App Router) · TypeScript · Zustand · PostgreSQL/NestJS (backend)  
> **Migration Phase**: Milestones 0–7 complete. PostgreSQL is authoritative for Customers & Leads.  
> **Last updated**: 2026-07-27 (Milestone 7 — Real Frontend Authentication)

---

## Top-Level Layout

```
prototype-next-main/
├── app/                      # Next.js App Router (routes + API handlers)
├── components/               # Shared UI components (legacy JSX, global)
├── config/                   # Navigation and routing configuration
├── constants/                # App-wide constants
├── docs/                     # Project documentation
├── engine/                   # Task/workflow engine
├── hooks/                    # Global custom React hooks
├── layouts/                  # Legacy layout wrappers
├── lib/                      # Utilities and server-side clients
├── modules/                  # Domain feature modules (self-contained)
├── public/                   # Static assets
├── scripts/                  # CLI scripts, E2E tests, migration tooling
├── services/                 # Repository layer (data access)
├── shared/                   # Cross-cutting: context, components, hooks, API
├── store/                    # Zustand state management
├── types/                    # Global TypeScript types
└── utils/                    # Utility functions
```

---

## `app/` — Next.js App Router

### Dashboard Routes `app/(dashboard)/`

All dashboard routes are protected by `AuthGuard` (client-side JWT guard) via the shared layout.

```
app/(dashboard)/
├── layout.tsx                    # Shared dashboard layout (Sidebar, HeroBanner, AuthGuard, ToastContainer)
│
├── admin/[[...slug]]/page.tsx
├── dispatch/
│   ├── [[...slug]]/page.tsx
│   └── returns/page.tsx
├── employee/payslips/page.tsx
├── finance/
│   ├── [[...slug]]/page.tsx
│   ├── invoices/page.tsx
│   ├── ledger/page.tsx
│   ├── payment-history/page.tsx
│   ├── payment-verification/page.tsx
│   ├── payments/page.tsx
│   ├── purchase-orders/
│   │   ├── page.tsx
│   │   └── [id]/close/page.tsx
│   ├── reports/page.tsx
│   ├── salary/
│   │   ├── page.tsx
│   │   ├── history/page.tsx
│   │   ├── paid/page.tsx
│   │   ├── pending/page.tsx
│   │   └── processing/page.tsx
│   ├── salary-disbursement/page.tsx
│   ├── salary-history/page.tsx
│   └── salary-verification/page.tsx
├── finance-executive/[[...slug]]/page.tsx
├── hr/
│   ├── [[...slug]]/page.tsx
│   ├── recruitment/page.tsx
│   ├── roles/page.tsx
│   ├── salary/
│   │   ├── page.tsx
│   │   ├── history/page.tsx
│   │   ├── payslips/page.tsx
│   │   ├── prepare/page.tsx
│   │   └── status/page.tsx
│   └── salary-structure/page.tsx
├── orders/[orderId]/page.tsx
├── plant-head/
│   ├── [[...slug]]/page.tsx
│   ├── finished-goods/page.tsx
│   ├── incoming-orders/page.tsx
│   ├── machine-allocation/page.tsx
│   ├── planning/page.tsx
│   ├── product-approval/page.tsx
│   ├── recruitment-request/page.tsx
│   ├── reports/page.tsx
│   └── work-orders/page.tsx
├── production/
│   ├── [[...slug]]/page.tsx
│   ├── active/page.tsx
│   ├── completed/page.tsx
│   ├── machine-log/page.tsx
│   ├── reports/page.tsx
│   └── work-orders/page.tsx
├── qc/[[...slug]]/page.tsx
├── sales/
│   ├── [[...slug]]/page.tsx
│   ├── create-payment/page.tsx
│   ├── customers/page.tsx
│   ├── dashboard/page.tsx
│   ├── leads/
│   │   ├── page.tsx
│   │   ├── create/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── orders/page.tsx
│   ├── payment-followup/page.tsx
│   ├── payment-history/page.tsx
│   ├── quotations/
│   │   ├── page.tsx
│   │   └── create/page.tsx
│   ├── reports/page.tsx
│   └── samples/page.tsx
├── store/[[...slug]]/page.tsx
│   └── reports/page.tsx
│   └── vendor-master/page.tsx
└── super-admin/
    ├── [[...slug]]/page.tsx
    ├── payroll-analysis/page.tsx
    ├── po-requests/page.tsx
    ├── salary-approval/page.tsx
    └── salary-approvals/page.tsx
```

### Auth & Public Routes

```
app/
├── layout.tsx          # Root layout (fonts, global CSS)
├── globals.css
├── page.tsx            # Root redirect → /login
├── favicon.ico
└── login/
    └── page.tsx        # Real NestJS auth login (Milestone 7)
```

### API Routes `app/api/`

#### Backend Bridge — Auth (Milestone 7)
All auth routes are **server-side proxies** — they never expose tokens to client JS directly.

```
app/api/backend/auth/
├── login/route.ts      # POST → NestJS /auth/login; forwards Set-Cookie (refreshToken)
├── refresh/route.ts    # POST → NestJS /auth/refresh; forwards Cookie, returns new accessToken
└── logout/route.ts     # POST → NestJS /auth/logout; clears HttpOnly cookie
```

#### Backend Bridge — Customers (Milestone 5–6)
```
app/api/backend/customers/
├── route.ts                     # GET (list), POST (create)
├── check-duplicates/route.ts    # GET — duplicate check
└── [id]/
    ├── route.ts                 # GET (get one), PATCH (update)
    ├── deactivate/route.ts      # POST
    └── restore/route.ts         # POST
```

#### Backend Bridge — Leads (Milestone 5–6)
```
app/api/backend/leads/
├── route.ts                         # GET (list), POST (create)
├── check-duplicates/route.ts        # GET
└── [id]/
    ├── route.ts                     # GET (get one), PATCH (update), DELETE (soft-delete)
    ├── assign-customer/route.ts     # POST
    ├── mark-lost/route.ts           # POST
    ├── qualify/route.ts             # POST
    ├── reminder/
    │   ├── route.ts                 # POST (set reminder)
    │   └── clear/route.ts           # POST (clear reminder)
    ├── restore/route.ts             # POST
    ├── timeline/route.ts            # GET
    └── unassign-customer/route.ts   # POST
```

#### Legacy LocalStorage API Routes
```
app/api/
├── orders/
│   ├── route.ts                 # GET all orders
│   ├── [id]/route.ts            # GET/PATCH single order
│   └── [id]/[...action]/route.ts
├── production/work-orders/route.js
└── qc/pending/route.js
```

---

## `lib/` — Utilities & Server-Side Clients

```
lib/
├── apiClient.js              # Client-side LocalStorage interceptor (legacy mock DB)
├── backendFetch.ts           # ★ Client-side fetch wrapper — auto-injects JWT from authStore,
│                             #   silent 401 refresh, used by all backend repositories
├── api.ts                    # API type definitions
├── deepEqual.js              # Deep equality utility
├── delay.ts                  # Promise-based delay helper
├── mockData.ts               # Seed data for LocalStorage prototype
├── mockDB.ts                 # In-memory mock database (legacy)
├── mockStorage.ts            # LocalStorage abstraction (legacy)
├── navigationConfig.js       # Navigation tree definitions
├── routeConfig.js            # Route-to-module mapping
├── utils.ts                  # General utilities
└── server/                   # Server-only modules (Node.js runtime)
    ├── backendApiClient.ts   # ★ forwardBackendRequest() — Next.js server → NestJS proxy,
    │                         #   accepts explicit token, 10s timeout, X-Request-ID propagation
    ├── backendBridgePolicy.ts# Route-level policies (requireIdempotencyKey per endpoint)
    └── backendFeatureConfig.ts# Reads NEXT_PUBLIC_BACKEND_* feature flags
```

---

## `store/` — Zustand State Management

```
store/
├── erpStore.ts               # ★ Main ERP store — all LocalStorage-backed state
│                             #   (orders, materials, procurement, payroll, etc.)
├── authStore.ts              # ★ Auth state — user (persisted), accessToken (memory-only),
│                             #   role, isAuthenticated, login/logout/setAccessToken
├── analytics_selector.ts     # Memoized selectors for analytics
├── badgeStore.ts             # Notification badge counts per module
├── customerComplaintStore.ts # Customer complaint workflow state
├── idGenerator.ts            # Sequence-safe ID generator
├── materialFlow.ts           # Material request/indent state
├── materialRequestStore.ts   # Material request actions
├── new_procurement_store.ts  # Procurement Zustand store
├── notificationStore.ts      # Toast/notification management
├── payrollFlow.ts            # Payroll preparation workflow
├── procurementActions.ts     # Purchase indent actions
├── procurementDemoSeed.ts    # Demo data seeder for procurement
├── procurementSelectors.ts   # Procurement-specific selectors
├── searchStore.ts            # Global search state
└── domains/                  # Domain-specific action/selector slices
    ├── dispatch/
    │   ├── dispatchActions.ts
    │   └── dispatchSelectors.ts
    ├── production/
    │   └── productionActions.ts
    └── sales/
        ├── salesActions.ts
        ├── salesCalculations.ts
        ├── salesSelectors.ts
        ├── salesTransitions.ts
        ├── salesTypes.ts
        └── salesValidation.ts
```

---

## `services/` — Repository Layer

The repository pattern enforces a clean separation between **how data is stored** and **where it is stored**.  
Each domain has up to four repository variants selected at runtime by feature flags.

```
services/
│
├── customers/
│   ├── customerMapper.ts                  # Maps NestJS ↔ frontend Customer shapes
│   ├── customersReadRepository.ts         # Dynamic router: backend or legacy
│   ├── customersWriteRepository.ts        # Dynamic router: backend or legacy
│   ├── backendCustomersReadRepository.ts  # ★ Reads from NestJS (via backendFetch)
│   ├── backendCustomersWriteRepository.ts # ★ Writes to NestJS (via backendFetch)
│   ├── legacyCustomersReadRepository.ts   # Reads from LocalStorage
│   └── legacyCustomersWriteRepository.ts  # Writes to LocalStorage
│
├── leads/
│   ├── leadMapper.ts                      # Maps NestJS ↔ frontend Lead shapes
│   ├── leadsReadRepository.ts             # Dynamic router: backend or legacy
│   ├── leadsWriteRepository.ts            # Dynamic router: backend or legacy
│   ├── backendLeadsReadRepository.ts      # ★ Reads from NestJS (via backendFetch)
│   ├── backendLeadsWriteRepository.ts     # ★ Writes to NestJS (via backendFetch)
│   ├── legacyLeadsReadRepository.ts       # Reads from LocalStorage
│   └── legacyLeadsWriteRepository.ts      # Writes to LocalStorage
│
├── admin.service.js          # Super Admin operations
├── dispatch.service.js       # Dispatch workflow
├── export.service.js         # PDF/Excel export helpers
├── finance.service.js        # Finance calculations
├── moduleServices.js         # Service registry
├── product.service.js        # Product catalog
├── production.service.js     # Production order service
└── sales.service.js          # Sales workflow (legacy LocalStorage)
```

### Repository Routing Logic

| Flag (`NEXT_PUBLIC_*`)              | Read Source | Write Source |
|-------------------------------------|-------------|--------------|
| `BACKEND_CUSTOMERS_READ=true`       | NestJS      | LocalStorage |
| `BACKEND_CUSTOMERS_WRITE=true`      | NestJS      | NestJS       |
| `BACKEND_LEADS_READ=true`           | NestJS      | LocalStorage |
| `BACKEND_LEADS_WRITE=true`          | NestJS      | NestJS       |

---

## `shared/` — Cross-Cutting Concerns

```
shared/
├── api/                      # HTTP client infrastructure (legacy)
│   ├── cache.js
│   ├── client.js
│   ├── endpoints.js
│   ├── errors.js
│   ├── index.js
│   ├── interceptors.js
│   ├── requestQueue.js
│   └── upload.js
│
├── auth/
│   └── auth.api.js           # Auth API helpers (legacy)
│
├── components/               # Shared UI components
│   ├── AuthGuard.tsx         # ★ Client-side JWT guard + RBAC route enforcement
│   │                         #   Silent refresh on page reload via /api/backend/auth/refresh
│   ├── ApprovalHistory.jsx
│   ├── DataTable.jsx
│   ├── DispatchBillModal.jsx
│   ├── EnterpriseAlerts.jsx
│   ├── EnterpriseKPIDashboard.jsx
│   ├── GlobalOrderTracker.jsx
│   ├── O2PWorkflowBanner.tsx
│   ├── OrderDetailsModal.jsx
│   ├── PermissionGuard.jsx
│   ├── ProductMasterUI.jsx
│   ├── ProductPicker.jsx
│   ├── ReceivableFilters.jsx
│   ├── ReminderModal.jsx
│   ├── StatusBadge.jsx
│   ├── Timeline.jsx
│   └── WorkflowHistory.tsx
│
├── config/
│   ├── env.js
│   └── index.js
│
├── constants.js
│
├── context/                  # React context providers
│   ├── ERPContext.jsx        # ★ Main ERP context — orchestrates backend sync,
│   │                         #   re-exports useERPStore for backward compat
│   ├── AuthContext.jsx       # Legacy auth context (being replaced by authStore)
│   ├── AbilityContext.jsx    # CASL-based permission context
│   ├── BadgeContext.jsx      # Badge count aggregation
│   ├── NotificationContext.jsx
│   ├── ToastContext.jsx
│   └── new_erp_context.jsx   # (Draft — not yet in use)
│
├── firebase/
│   ├── firebase.js           # Firebase app init
│   └── messaging.js          # Push notification setup
│
├── hooks/
│   ├── useFormDraft.js       # Auto-save form drafts to sessionStorage
│   ├── useO2PWorkflow.ts     # Order-to-Production workflow hook
│   └── useProductCatalog.js  # Product catalog selector hook
│
├── initialMaterials.js       # Initial raw material seed data
│
├── socket/
│   └── socketClient.js       # WebSocket client (for real-time updates)
│
└── utils/
    └── reminderUtils.js      # Lead reminder scheduling helpers
```

---

## `modules/` — Feature Modules

Each module is self-contained with its own `pages/`, `hooks/`, `services/`, and `components/`.

```
modules/
├── dispatch/
│   ├── hooks/           useDispatch.js
│   └── pages/           DispatchPortal.jsx
│
├── finance/
│   ├── components/      PaymentVerificationPanel.jsx, SalaryProcessingPanel.jsx, ...
│   ├── hooks/           useFinance.js, usePaymentFollowup.js, ...
│   ├── pages/           FinancePortal.jsx, FinanceExecutivePortal.jsx
│   └── services/        finance.api.js
│
├── hr/
│   ├── components/      EmployeeFormModal.jsx, PayslipViewer.jsx, ...
│   ├── hooks/           useHR.js, usePayroll.js, usePayslip.js
│   ├── pages/           HRPortal.jsx
│   └── services/        hr.service.js
│
├── plant-head/
│   ├── hooks/           usePlantHead.js, useMachineAllocation.js
│   └── pages/           PlantHeadPortal.jsx
│
├── production/
│   ├── hooks/           useProduction.js
│   └── pages/           ProductionPortal.jsx
│
├── qc/
│   ├── hooks/           useQC.js
│   └── pages/           QCPortal.jsx
│
├── sales/
│   ├── components/      LeadCard.jsx, LeadDetailPanel.jsx, CustomerCard.jsx, ...
│   ├── hooks/
│   │   ├── useLeads.js          # ★ All Lead mutations via backendLeadsWriteRepository
│   │   ├── useCustomers.js
│   │   ├── useSalesOrders.js
│   │   └── ...
│   ├── pages/           SalesPortal.jsx, CustomersView.jsx, LeadsView.jsx, ...
│   └── services/        leads.service.js, customers.service.js
│
├── store/
│   ├── hooks/           useStore.js, useMaterialRequest.js
│   └── pages/           StorePortal.jsx
│
└── super-admin/
    ├── departments/     SalesDept.jsx, FinanceDept.jsx, HRDept.jsx, ...
    ├── hooks/           useSuperAdminData.js, useSalesAnalytics.js, ...
    ├── pages/           SuperAdminPortal.jsx, AnalyticsTab.jsx, ...
    ├── services/        salesAnalytics.service.js
    └── utils/           export.js, financialCalculations.js
```

---

## `components/` — Global UI Components

Shared presentational components used across modules.

```
components/
├── CreateLead.jsx
├── CreateQuotation.jsx
├── CreateSample.jsx
├── CustomerComplaintManagement.jsx
├── DashboardView.jsx
├── HeroBanner.jsx               # Top navigation bar with stats, search, notifications
├── LeadsView.jsx
├── MockDataSeeder.jsx           # Seeds LocalStorage with demo data in dev
├── OrdersView.jsx
├── PaymentFollowupERPView.jsx
├── PaymentsView.jsx
├── QuotationsView.jsx
├── ReportsView.jsx
├── SamplesView.jsx
├── Sidebar.jsx                  # Navigation sidebar
├── ToastContainer.jsx
└── erp-premium-ui.css           # Core design system CSS
```

---

## `config/` — Navigation Configuration

```
config/
├── navigationHelpers.js         # getNavigationForPath(pathname, role) → nav items
└── moduleRegistry.js            # Module-to-portal component mapping
```

---

## `scripts/` — Developer & Migration Scripts

```
scripts/
├── export-legacy.ts             # Exports LocalStorage state to JSON for import
├── audit-navigation-routes.js   # Validates all routes have nav entries
├── migrate_erpStore.js          # One-time erpStore shape migration
│
├── ESS-All-O2C-Flow-Test.ts     # Full O2C E2E test
├── test-complete-sales-o2c.ts
├── test-harsh-o2c.ts
├── test-material-indent-flow.ts
├── test-payroll-workflow.ts
├── test-sales.ts
├── test-workflow.ts
└── ...                          # Additional E2E flow scripts
```

---

## Environment Variables

### `.env.local` (gitignored — real values)
```dotenv
# NestJS API base URL
BACKEND_API_URL=http://localhost:4000/api/v1

# Feature flags — enable backend data source per entity
NEXT_PUBLIC_BACKEND_CUSTOMERS_READ=true
NEXT_PUBLIC_BACKEND_LEADS_READ=true
NEXT_PUBLIC_BACKEND_CUSTOMERS_WRITE=true
NEXT_PUBLIC_BACKEND_LEADS_WRITE=true
```

### `.env.example` (committed — no secrets)
```dotenv
BACKEND_API_URL=
NEXT_PUBLIC_BACKEND_CUSTOMERS_READ=
NEXT_PUBLIC_BACKEND_LEADS_READ=
NEXT_PUBLIC_BACKEND_CUSTOMERS_WRITE=
NEXT_PUBLIC_BACKEND_LEADS_WRITE=
```

> **Removed in Milestone 7**: `BACKEND_READ_EMAIL`, `BACKEND_READ_PASSWORD`, `BACKEND_WRITE_EMAIL`, `BACKEND_WRITE_PASSWORD` — service accounts replaced by real user JWT sessions.

---

## Authentication Architecture (Milestone 7)

```
Browser (Login Form)
  │
  ├─ POST /api/backend/auth/login  ──►  NestJS POST /auth/login
  │         ◄── { data: { accessToken, user } } + Set-Cookie: refreshToken (HttpOnly)
  │
  ├─ accessToken stored in Zustand memory (authStore.accessToken — NOT in localStorage)
  ├─ refreshToken stored as HttpOnly cookie (invisible to JavaScript)
  │
  │  On any API call:
  ├─ backendFetch() reads accessToken from authStore.getState()
  ├─ Injects Authorization: Bearer <token> header
  ├─ If 401 → calls /api/backend/auth/refresh → gets new token → retries
  │
  │  On page reload:
  ├─ AuthGuard detects no in-memory token
  ├─ POST /api/backend/auth/refresh  ──►  NestJS (cookie forwarded automatically)
  ├─ If success → setAccessToken(newToken) → session restored silently
  └─ If fail → logout() → redirect /login
```

### Role → Dashboard Mapping

| NestJS Role Code      | Friendly Name       | Default Dashboard          |
|-----------------------|---------------------|---------------------------|
| `SUPER_ADMIN`         | Super Admin         | `/super-admin/dashboard`  |
| `ADMIN`               | Admin               | `/admin/dashboard`        |
| `SALES`               | Sales               | `/sales/dashboard`        |
| `SALES_ADMIN`         | Sales Admin         | `/sales/dashboard`        |
| `PLANT_HEAD`          | Plant Head          | `/plant-head/dashboard`   |
| `PRODUCTION`          | Production          | `/production/dashboard`   |
| `STORE`               | Store               | `/store/dashboard`        |
| `QC`                  | QC                  | `/qc/dashboard`           |
| `DISPATCH`            | Dispatch            | `/dispatch/dashboard`     |
| `FINANCE`             | Finance             | `/finance/dashboard`      |
| `FINANCE_EXECUTIVE`   | Finance Executive   | `/finance-executive/dashboard` |
| `HR`                  | HR                  | `/hr/dashboard`           |

---

## Migration Status

| Entity       | Read Source | Write Source | Phase       |
|--------------|-------------|--------------|-------------|
| Customers    | PostgreSQL  | PostgreSQL   | ✅ M6 Done  |
| Leads        | PostgreSQL  | PostgreSQL   | ✅ M6 Done  |
| Orders       | LocalStorage| LocalStorage | 🔜 M8+      |
| Materials    | LocalStorage| LocalStorage | 🔜 M10+     |
| Purchase Indents | LocalStorage | LocalStorage | 🔜 M11+ |
| HR / Payroll | LocalStorage| LocalStorage | 🔜 M18+     |
| Finance      | LocalStorage| LocalStorage | 🔜 M20+     |
| Production   | LocalStorage| LocalStorage | 🔜 M22+     |
| Dispatch     | LocalStorage| LocalStorage | 🔜 M25+     |

---

## Key Architectural Patterns

### 1. Strangler Fig Migration
Each domain migrates incrementally. Feature flags (`NEXT_PUBLIC_BACKEND_*`) toggle between LocalStorage and PostgreSQL **without code changes or downtime**.

### 2. Next.js Server Bridge
The browser never calls NestJS directly.  
`Browser → /api/backend/* (Next.js route handler) → NestJS`  
This keeps the NestJS API private, forwards real user JWTs, and allows server-side token management.

### 3. UI-Generated Idempotency Keys
Every mutating request carries a client-generated UUID `idempotency-key` header. Retries are safe — the backend deduplicates by key.

### 4. Optimistic Concurrency
Write requests include `expectedVersion` (from Zustand cache). NestJS returns `409 Conflict` if the record was modified concurrently; the UI shows a `Swal.fire` conflict dialog.

### 5. Non-Persistent Server Cache
Zustand holds backend data in memory only for the current session. On page reload, `AuthGuard` triggers a fresh load via `ERPContext`.
