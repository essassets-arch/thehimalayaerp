# Himalaya ERP — Monorepo Architecture Reference

> **Status**: Frontend (Milestone 7 complete) · Backend (Milestone 7 complete — Customers & Leads on PostgreSQL)  
> **Last updated**: 2026-07-27  
> **Migration phase**: Strangler-fig — Orders, Production, Procurement, Finance, Payroll still on LocalStorage

---

## Repository Layout

```
himalaya-erp/                    # Monorepo root (single Git repository)
├── frontend/                    # Next.js 15 (App Router)
├── backend/                     # NestJS + Prisma + PostgreSQL
├── docs/                        # Shared architecture and workflow documents
├── scripts/                     # Project-level setup and deployment scripts
├── docker-compose.yml
├── package.json                 # Root — orchestrates both apps via concurrently
└── README.md
```

### Root `package.json`

```json
{
  "name": "himalaya-erp",
  "private": true,
  "scripts": {
    "dev":              "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend":     "npm --prefix frontend run dev",
    "dev:backend":      "npm --prefix backend run start:dev",
    "build":            "npm run build:backend && npm run build:frontend",
    "build:frontend":   "npm --prefix frontend run build",
    "build:backend":    "npm --prefix backend run build",
    "test":             "npm run test:backend && npm run test:frontend",
    "test:frontend":    "npm --prefix frontend run test",
    "test:backend":     "npm --prefix backend run test",
    "db:migrate":       "npm --prefix backend run prisma:migrate",
    "db:seed":          "npm --prefix backend run prisma:seed",
    "db:studio":        "npm --prefix backend run prisma:studio"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

Start everything:

```bash
npm install
npm run dev
```

---

## Development URLs

| Service    | URL                              |
|------------|----------------------------------|
| Frontend   | `http://localhost:3000`          |
| Backend    | `http://localhost:4000`          |
| API prefix | `http://localhost:4000/api/v1`   |
| Database   | `localhost:5432`                 |

---

## 1. Frontend Structure (`frontend/`)

```
frontend/
├── src/
│   ├── app/
│   ├── modules/
│   ├── components/
│   ├── stores/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   ├── config/
│   ├── constants/
│   ├── types/
│   └── styles/
├── public/
├── tests/
│   ├── e2e/
│   └── unit/
├── package.json
├── next.config.ts
├── tsconfig.json
├── .env.local           # gitignored — real values
└── .env.example         # committed — no secrets
```

### `frontend/src/app/` — Next.js App Router

```
src/app/
│
├── (auth)/
│   └── login/
│       └── page.tsx                   # Real NestJS auth login
│
├── (dashboard)/
│   ├── layout.tsx                     # Shared layout (Sidebar, HeroBanner, AuthGuard)
│   ├── admin/[[...slug]]/page.tsx
│   ├── dispatch/
│   │   ├── [[...slug]]/page.tsx
│   │   └── returns/page.tsx
│   ├── employee/payslips/page.tsx
│   ├── finance/
│   │   ├── [[...slug]]/page.tsx
│   │   ├── invoices/page.tsx
│   │   ├── ledger/page.tsx
│   │   ├── payment-history/page.tsx
│   │   ├── payment-verification/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── purchase-orders/page.tsx
│   │   │   └── [id]/close/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── salary/{ page, history, paid, pending, processing }/page.tsx
│   │   ├── salary-disbursement/page.tsx
│   │   ├── salary-history/page.tsx
│   │   └── salary-verification/page.tsx
│   ├── finance-executive/[[...slug]]/page.tsx
│   ├── hr/
│   │   ├── [[...slug]]/page.tsx
│   │   ├── recruitment/page.tsx
│   │   ├── roles/page.tsx
│   │   ├── salary/{ page, history, payslips, prepare, status }/page.tsx
│   │   └── salary-structure/page.tsx
│   ├── orders/[orderId]/page.tsx
│   ├── plant-head/
│   │   ├── [[...slug]]/page.tsx
│   │   ├── finished-goods/page.tsx
│   │   ├── incoming-orders/page.tsx
│   │   ├── machine-allocation/page.tsx
│   │   ├── planning/page.tsx
│   │   ├── product-approval/page.tsx
│   │   ├── recruitment-request/page.tsx
│   │   ├── reports/page.tsx
│   │   └── work-orders/page.tsx
│   ├── production/
│   │   ├── [[...slug]]/page.tsx
│   │   ├── active/page.tsx
│   │   ├── completed/page.tsx
│   │   ├── machine-log/page.tsx
│   │   ├── reports/page.tsx
│   │   └── work-orders/page.tsx
│   ├── qc/[[...slug]]/page.tsx
│   ├── sales/
│   │   ├── [[...slug]]/page.tsx
│   │   ├── create-payment/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── leads/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── payment-followup/page.tsx
│   │   ├── payment-history/page.tsx
│   │   ├── quotations/{ page, create/page.tsx }
│   │   ├── reports/page.tsx
│   │   └── samples/page.tsx
│   ├── store/
│   │   ├── [[...slug]]/page.tsx
│   │   ├── reports/page.tsx
│   │   └── vendor-master/page.tsx
│   └── super-admin/
│       ├── [[...slug]]/page.tsx
│       ├── payroll-analysis/page.tsx
│       ├── po-requests/page.tsx
│       ├── salary-approval/page.tsx
│       └── salary-approvals/page.tsx
│
├── api/
│   └── backend/
│       └── [...path]/
│           └── route.ts               # ★ Single generic proxy → NestJS (target state)
│
├── layout.tsx
├── page.tsx                           # Root redirect → /login
└── globals.css
```

> **Target**: Replace the current per-entity route handlers (`/api/backend/customers/route.ts`, etc.) with one generic catch-all `[...path]/route.ts` that forwards any path to NestJS. The browser never knows the private backend URL in production.

#### Page Component Convention

Each Next.js route renders a focused page component imported from its feature module:

```typescript
// frontend/src/app/(dashboard)/sales/leads/page.tsx
import { LeadsPage } from '@/modules/sales/pages/leads-page';

export default function Page() {
  return <LeadsPage />;
}
```

The large portal files (`SalesPortal.jsx`, `FinancePortal.jsx`, `ProductionPortal.jsx`) should be broken into focused page components. This is a **gradual cleanup** target — do not remove them before each domain is migrated.

---

### `frontend/src/modules/` — Feature Modules

Each module is self-contained. Every module follows the same internal pattern:

```
modules/sales/
├── api/
│   ├── customers.api.ts       # Calls /api/backend/customers (via apiClient)
│   ├── leads.api.ts
│   ├── quotations.api.ts
│   └── orders.api.ts
│
├── components/
│   ├── LeadForm.tsx
│   ├── LeadsTable.tsx
│   └── LeadStatusBadge.tsx
│
├── hooks/
│   ├── use-leads.ts
│   ├── use-customers.ts
│   └── use-orders.ts
│
├── pages/
│   ├── leads-page.tsx         # Rendered by app/(dashboard)/sales/leads/page.tsx
│   └── customers-page.tsx
│
├── schemas/
│   ├── lead.schema.ts         # Zod/class-validator schemas
│   └── customer.schema.ts
│
├── types/
│   ├── lead.types.ts
│   └── order.types.ts
│
├── utils/
│   └── sales-formatters.ts
│
└── index.ts                   # Public module exports
```

All modules:

```
modules/
├── auth/
├── sales/
├── procurement/
├── inventory/
├── plant-head/
├── production/
├── quality/
├── dispatch/
├── finance/
├── payroll/
├── hr/
└── super-admin/
```

---

### `frontend/src/stores/` — Zustand Stores

```
stores/
├── auth.store.ts              # User, accessToken (memory-only), role, login/logout
├── notification.store.ts      # Toast/notification management
├── ui.store.ts                # Sidebar state, theme, global search
└── domains/
    ├── sales.store.ts         # Sales-domain LocalStorage state (orders, quotations…)
    ├── production.store.ts
    └── procurement.store.ts
```

> **Current**: `store/erpStore.ts` is a monolithic 100k+ byte file. Domain stores should be extracted incrementally as each domain migrates to PostgreSQL.

---

### `frontend/src/services/` — API Client & Repositories

```
services/
│
├── api/
│   ├── api-client.ts          # Fetch wrapper with auto-JWT injection + silent refresh on 401
│   │                          # (currently: lib/backendFetch.ts)
│   ├── api-error.ts           # Typed API error handling
│   ├── backend-proxy.ts       # Server-side Next.js → NestJS forwardRequest()
│   │                          # (currently: lib/server/backendApiClient.ts)
│   ├── refresh-token.ts       # Silent token refresh logic
│   └── request-id.ts          # X-Request-ID generator
│
└── repositories/
    ├── customers.repository.ts
    ├── leads.repository.ts
    ├── orders.repository.ts
    └── work-orders.repository.ts
```

> **Replaces**: The current `services/customers/` and `services/leads/` trees with their `backend*`, `legacy*`, and `mapper` variants. Once a domain is fully on PostgreSQL the legacy variant is deleted.

---

### `frontend/src/components/` — Shared UI Components

```
components/
├── ui/                        # Primitive UI elements (Button, Badge, Modal…)
├── layout/                    # Sidebar, HeroBanner, PageWrapper
├── forms/                     # Generic form controls
├── tables/                    # DataTable, pagination
├── feedback/                  # Toast, Alert, Skeleton
├── workflow/                  # AuthGuard, PermissionGuard, Timeline, StatusBadge
└── charts/                    # Recharts wrappers
```

---

### `frontend/src/lib/`

```
lib/
├── auth/                      # AuthGuard, session utilities
├── validation/                # Shared Zod schemas
├── formatting/                # Date, currency, number formatters
├── permissions/               # RBAC role → route mapping
└── utils/                     # deepEqual, delay, idGenerator
```

---

### `frontend/src/config/`

```
config/
├── navigation.config.ts       # Sidebar nav tree per role
├── routes.config.ts           # Route → module mapping
├── roles.config.ts            # Role codes → friendly names → default dashboard
└── env.ts                     # Environment variable validation (fail-fast on start)
```

---

### `frontend/.env.local` (gitignored)

```dotenv
# Private — never exposed to the browser
BACKEND_API_URL=http://localhost:4000/api/v1

# Public — safe to expose
NEXT_PUBLIC_APP_NAME=Himalaya ERP
NEXT_PUBLIC_APP_ENV=development
```

> **Rule**: Only variables genuinely needed by browser JavaScript use `NEXT_PUBLIC_`. The `BACKEND_API_URL` is server-only — the browser calls the Next.js proxy, not NestJS directly.

---

## 2. Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   ├── config/
│   ├── database/
│   ├── auth/
│   ├── users/
│   ├── companies/
│   ├── employees/
│   ├── sales/
│   ├── procurement/
│   ├── inventory/
│   ├── production/
│   ├── quality/
│   ├── dispatch/
│   ├── finance/
│   ├── payroll/
│   ├── notifications/
│   ├── audit/
│   └── reports/
├── prisma/
│   ├── schema.prisma
│   ├── models/
│   ├── migrations/
│   └── seed/
├── test/
├── package.json
├── nest-cli.json
├── tsconfig.json
├── .env                       # gitignored — real values
└── .env.example               # committed — no secrets
```

### `backend/src/common/`

Cross-cutting infrastructure used by all domain modules:

```
common/
├── decorators/                # @CurrentUser(), @Permissions(), @Idempotent()
├── dto/                       # Base DTOs, pagination, cursor
├── enums/                     # Shared enums (Status, SortOrder…)
├── exceptions/                # AppException, ConflictException, NotFoundException
├── filters/                   # GlobalExceptionFilter
├── guards/                    # JwtAuthGuard, PermissionsGuard
├── interceptors/              # IdempotencyInterceptor, AuditInterceptor, RequestIdInterceptor
├── middleware/                # RequestLogger
├── pipes/                     # ParseUUIDPipe, ZodValidationPipe
├── types/                     # AuthenticatedUser, PaginatedResult
└── utils/                     # sequenceGenerator, idempotencyKeyValidator
```

### `backend/src/config/`

```
config/
├── app.config.ts
├── database.config.ts
├── auth.config.ts
├── validation.schema.ts       # Joi/Zod schema that validates all env vars at startup
└── configuration.ts           # ConfigService factory
```

### Domain Structure — Sales Example

```
src/sales/
├── customers/
├── leads/
├── samples/
├── quotations/
├── orders/
├── payments/
├── returns/
└── replacements/
```

Each entity follows one consistent pattern:

```
src/sales/leads/
├── dto/
│   ├── create-lead.dto.ts
│   ├── update-lead.dto.ts
│   ├── lead-query.dto.ts
│   ├── assign-customer.dto.ts
│   └── set-reminder.dto.ts
├── policies/
│   └── lead.policy.ts         # Role and permission checks
├── leads.controller.ts        # HTTP request/response only
├── leads.service.ts           # Business rules, workflow transitions
├── leads.repository.ts        # Prisma queries only
├── leads.mapper.ts            # Prisma model → API response DTO
├── leads.module.ts
├── leads.types.ts             # Domain-specific TypeScript types
└── leads.service.spec.ts      # Unit tests
```

#### File Responsibilities

| File | Responsibility |
|------|---------------|
| `controller` | HTTP request/response — no business logic |
| `service` | Business rules, workflow transitions, audit |
| `repository` | All Prisma queries — no business logic |
| `dto` | Request validation (class-validator) |
| `mapper` | Prisma model → API response shape |
| `policy` | Role and permission checks |
| `types` | Domain-specific TypeScript types |
| `spec` | Unit tests |

#### Controller → Service → Repository Rule

**Bad** — Prisma query inside controller:

```typescript
@Post()
create(@Body() dto: CreateLeadDto) {
  return this.prisma.lead.create({ data: dto });
}
```

**Correct** — each layer has a single responsibility:

```typescript
// leads.controller.ts
@Post()
create(
  @Body() dto: CreateLeadDto,
  @CurrentUser() user: AuthenticatedUser,
) {
  return this.leadsService.create(dto, user);
}

// leads.service.ts
async create(dto: CreateLeadDto, user: AuthenticatedUser) {
  await this.leadsRepository.assertNoDuplicate(dto.phone, user.companyId);
  const id = await this.sequenceGenerator.next('LEAD', user.companyId);
  await this.auditService.record('LEAD_CREATED', user);
  return this.leadsRepository.create({ ...dto, id, createdById: user.id, companyId: user.companyId });
}

// leads.repository.ts
async create(data: CreateLeadData): Promise<Lead> {
  return this.prisma.lead.create({ data });
}
```

### All Backend Domain Modules

```
src/
├── auth/
├── users/
├── companies/
├── employees/
│
├── sales/
│   ├── customers/
│   ├── leads/
│   ├── samples/
│   ├── quotations/
│   ├── orders/
│   ├── payments/
│   ├── returns/
│   └── replacements/
│
├── procurement/
│   ├── material-indents/
│   ├── purchase-orders/
│   ├── grn/
│   ├── vendor-returns/
│   └── vendors/
│
├── inventory/
│   ├── materials/
│   ├── stock-ledger/
│   ├── stock-adjustments/
│   ├── material-issues/
│   └── warehouses/
│
├── production/
│   ├── production-plans/
│   ├── work-orders/
│   ├── batches/
│   ├── machine-allocations/
│   └── finished-goods/
│
├── quality/
│   ├── inspections/
│   ├── certificates/
│   └── rejections/
│
├── dispatch/
│   ├── dispatch-orders/
│   ├── vehicles/
│   ├── deliveries/
│   ├── returns/
│   └── replacements/
│
├── finance/
│   ├── payment-verifications/
│   ├── receipts/
│   ├── invoices/
│   ├── ledger/
│   ├── expenses/
│   └── reports/
│
├── payroll/
│   ├── salary-structures/
│   ├── payroll-runs/
│   ├── payroll-approvals/
│   ├── salary-payments/
│   └── payslips/
│
├── notifications/
├── audit/
└── reports/
```

---

## 3. Prisma Structure (`backend/prisma/`)

```
prisma/
├── schema.prisma              # Main schema file (datasource + generator)
├── models/                    # Domain model files (multi-file schema)
│   ├── auth.prisma
│   ├── organization.prisma
│   ├── sales.prisma
│   ├── procurement.prisma
│   ├── inventory.prisma
│   ├── production.prisma
│   ├── quality.prisma
│   ├── dispatch.prisma
│   ├── finance.prisma
│   └── payroll.prisma
├── migrations/
└── seed/
    ├── index.ts               # Orchestrator — runs seeds in order
    ├── roles.seed.ts
    ├── permissions.seed.ts
    ├── users.seed.ts
    ├── organization.seed.ts
    └── master-data.seed.ts
```

> If your Prisma version supports multi-file schema (`prismaSchemaFolder`), split by domain. Otherwise, keep `schema.prisma` as the single file but divide it clearly with section comments:

```prisma
// =====================================================
// AUTHENTICATION AND AUTHORIZATION
// =====================================================

// =====================================================
// SALES
// =====================================================

// =====================================================
// PROCUREMENT
// =====================================================
```

---

## 4. Request Flow

```
Browser
  │
  ▼
Next.js frontend (port 3000)
  │
  ├─ /api/backend/[...path]    ← Single generic proxy (target state)
  │   or current per-entity routes (interim state)
  │
  ▼
NestJS API (port 4000/api/v1)
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL (port 5432)
```

The browser never knows the private backend URL. In production, `BACKEND_API_URL` is a server-only variable.

### Authentication Flow

```
Browser
  ├─ POST /api/backend/auth/login
  │       ↓  (Next.js proxy forwards to NestJS)
  │       ↓  NestJS returns: { data: { accessToken, user } } + Set-Cookie: refreshToken (HttpOnly)
  │
  ├─ accessToken → Zustand memory (auth.store.ts) — NOT localStorage, NOT sessionStorage
  ├─ refreshToken → HttpOnly cookie (JS-inaccessible)
  │
  │  Every API call:
  ├─ apiClient reads accessToken from auth.store.getState()
  ├─ Injects Authorization: Bearer <token>
  ├─ 401 received → POST /api/backend/auth/refresh → silent retry
  │
  │  Page reload:
  ├─ AuthGuard: no in-memory token, but user is persisted
  ├─ POST /api/backend/auth/refresh (cookie forwarded automatically)
  ├─ Success → setAccessToken(newToken) → session restored silently
  └─ Failure → logout() → redirect /login
```

---

## 5. Docs Structure (`docs/`)

```
docs/
├── architecture/
│   ├── overview.md
│   ├── auth-flow.md
│   ├── data-flow.md
│   └── strangler-fig-migration.md
├── workflows/
│   ├── sales-o2c-flow.md
│   ├── material-indent-flow.md
│   ├── purchase-indent-flow.md
│   └── hr-salary-preparation.md
├── database/
│   ├── full-target-schema.prisma
│   └── erd.md
├── api/
│   └── (Swagger export or OpenAPI spec)
└── migration/
    ├── milestone-roadmap.md
    └── legacy-data-import.md
```

---

## 6. Scripts (`scripts/`)

```
scripts/
├── setup.ps1                  # Windows: install deps, run migrations, seed
├── setup.sh                   # Linux/macOS equivalent
├── start-dev.ps1              # Start frontend + backend concurrently (Windows)
├── backup-database.ps1        # pg_dump to timestamped file
└── restore-database.ps1       # pg_restore from file
```

---

## 7. Docker Compose

```yaml
services:
  postgres:
    image: postgres:17
    container_name: himalaya-erp-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: himalaya_erp
      POSTGRES_USER: himalaya
      POSTGRES_PASSWORD: local_password        # local dev only — never commit real passwords
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
    container_name: himalaya-erp-backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://himalaya:local_password@postgres:5432/himalaya_erp
      PORT: 4000
    ports:
      - "4000:4000"

  frontend:
    build:
      context: ./frontend
    container_name: himalaya-erp-frontend
    depends_on:
      - backend
    environment:
      BACKEND_API_URL: http://backend:4000/api/v1
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

---

## 8. Environment Variables

### `backend/.env` (gitignored)

```dotenv
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://himalaya:<password>@localhost:5432/himalaya_erp

JWT_ACCESS_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<another-long-random-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
```

### `backend/.env.example` (committed)

```dotenv
NODE_ENV=
PORT=4000
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=
```

### `frontend/.env.local` (gitignored)

```dotenv
BACKEND_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_NAME=Himalaya ERP
NEXT_PUBLIC_APP_ENV=development
```

### `frontend/.env.example` (committed)

```dotenv
BACKEND_API_URL=
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_ENV=
```

---

## 9. File Migration Map

### Current → Target (Frontend)

| Current location | Target location |
|---|---|
| `app/` | `frontend/src/app/` |
| `modules/` | `frontend/src/modules/` |
| `components/` | `frontend/src/components/` |
| `store/erpStore.ts` | `frontend/src/stores/domains/*.store.ts` (split by domain) |
| `store/authStore.ts` | `frontend/src/stores/auth.store.ts` |
| `store/notificationStore.ts` | `frontend/src/stores/notification.store.ts` |
| `shared/components/` | `frontend/src/components/` |
| `shared/components/AuthGuard.tsx` | `frontend/src/lib/auth/auth-guard.tsx` |
| `shared/hooks/` | `frontend/src/hooks/` |
| `shared/context/ERPContext.jsx` | `frontend/src/modules/*/hooks/` (split by domain) |
| `services/customers/backend*.ts` | `frontend/src/services/repositories/customers.repository.ts` |
| `services/leads/backend*.ts` | `frontend/src/services/repositories/leads.repository.ts` |
| `lib/backendFetch.ts` | `frontend/src/services/api/api-client.ts` |
| `lib/server/backendApiClient.ts` | `frontend/src/services/api/backend-proxy.ts` |
| `lib/server/backendBridgePolicy.ts` | `frontend/src/services/api/bridge-policy.ts` |
| `scripts/test-*.ts` (UI tests) | `frontend/tests/e2e/` |
| `config/navigationHelpers.js` | `frontend/src/config/navigation.config.ts` |
| `types/` | `frontend/src/types/` |

### Current → Target (Backend)

| Current location | Target location |
|---|---|
| `d:/himalaya-erp-api/src/` | `backend/src/` |
| `d:/himalaya-erp-api/prisma/` | `backend/prisma/` |
| `d:/himalaya-erp-api/test/` | `backend/test/` |
| Backend migration scripts | `backend/scripts/` or `scripts/` |
| `docs/database/` | `docs/database/` |
| Workflow docs | `docs/workflows/` |

---

## 10. Domain Migration Status

| Domain | Read | Write | Target Milestone |
|--------|------|-------|-----------------|
| **Authentication** | PostgreSQL ✅ | PostgreSQL ✅ | M7 Done |
| **Customers** | PostgreSQL ✅ | PostgreSQL ✅ | M6 Done |
| **Leads** | PostgreSQL ✅ | PostgreSQL ✅ | M6 Done |
| Orders | LocalStorage | LocalStorage | M8 |
| Samples / Quotations | LocalStorage | LocalStorage | M9 |
| Material Requests | LocalStorage | LocalStorage | M10 |
| Purchase Indents / PO | LocalStorage | LocalStorage | M11 |
| Inventory / Stock | LocalStorage | LocalStorage | M12 |
| Production / Work Orders | LocalStorage | LocalStorage | M13–M15 |
| QC / Dispatch | LocalStorage | LocalStorage | M16–M17 |
| HR / Employees | LocalStorage | LocalStorage | M18–M19 |
| Finance / Payroll | LocalStorage | LocalStorage | M20–M24 |
| Reports / Analytics | LocalStorage | LocalStorage | M25–M32 |

---

## 11. Legacy Cleanup Sequence

After each domain migrates, remove its LocalStorage code in this exact sequence:

```
1. Migrate domain to NestJS backend
2. Run migration and regression tests
3. Enable NEXT_PUBLIC_BACKEND_<DOMAIN>_READ=true
4. Enable NEXT_PUBLIC_BACKEND_<DOMAIN>_WRITE=true
5. Verify data parity between old and new
6. Disable LocalStorage fallback (remove legacy* repository)
7. Delete legacyXxxReadRepository.ts / legacyXxxWriteRepository.ts
8. Remove domain array from erpStore.ts / domain store
9. Remove Zustand persistence for that domain
10. Remove LocalStorage sync actions
```

> **Do not** remove `erpStore.ts` wholesale. It still backs Orders, Materials, Procurement, Finance, Production, QC, Dispatch, HR, and Payroll until those domains complete migration.

Files to eventually remove (not yet — in sequence with migration):

```
services/customers/legacyCustomersReadRepository.ts
services/customers/legacyCustomersWriteRepository.ts
services/leads/legacyLeadsReadRepository.ts
services/leads/legacyLeadsWriteRepository.ts
lib/mockDB.ts
lib/mockStorage.ts
lib/apiClient.js              (after all domains migrate)
store/erpStore.ts             (replaced by domain stores)
```

---

## 12. Key Architectural Rules

### A. Server Bridge — Never Expose Backend URL to Browser

```
Browser → /api/backend/[...path] (Next.js) → NestJS
```

The browser never calls NestJS directly. `BACKEND_API_URL` is a server-only env var.

### B. Token Security

| Token | Storage | Accessible to JS |
|-------|---------|-----------------|
| `accessToken` | Zustand memory (`auth.store.ts`) | Yes — but in memory only, not localStorage |
| `refreshToken` | HttpOnly cookie | No — set/cleared by NestJS |

### C. Idempotent Mutations

Every mutating request (`POST`, `PATCH`, `DELETE`) carries:
- `idempotency-key: <uuid>` — generated by the UI, deduplicated by NestJS
- `x-request-id: <uuid>` — for distributed tracing

### D. Optimistic Concurrency

Write requests include `expectedVersion`. NestJS returns `409 Conflict` on mismatch. The UI shows a conflict resolution dialog via `Swal.fire`.

### E. No Prisma in Controllers

Controllers call services. Services call repositories. Repositories call Prisma. Never skip a layer.

### F. Role-Based Route Enforcement

`AuthGuard` enforces RBAC client-side on route access. NestJS enforces it server-side via `@Permissions()` on every endpoint. Both layers must agree — client-side is UX only, server-side is the security boundary.
