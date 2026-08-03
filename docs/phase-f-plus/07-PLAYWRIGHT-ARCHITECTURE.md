# Phase F+ Batch 8 — Playwright Architecture Report

## Status: VERIFIED

## 1. Playwright Infrastructure Configuration

Configuration file: `frontend/playwright.config.ts`

### Target Environment
- **Next.js Frontend**: Real production/dev build (`http://localhost:3000`)
- **API Bridge**: `/api/backend/*` forwarding to NestJS
- **NestJS Backend**: Real backend service (`http://localhost:3001` / `http://localhost:4000`)
- **Database**: Dedicated PostgreSQL database instance

### Configured Browser Projects

| Project Name | Device Viewport | User Agent / Features | Purpose |
|--------------|-----------------|----------------------|---------|
| `desktop-chromium` | 1280×720 | Chrome Desktop | Primary E2E & Desktop UI Workflow Verification |
| `mobile-chromium` | 393×851 | Google Pixel 7 | Mobile Responsive & Menu Operability Verification |
| `desktop-firefox` | 1280×720 | Firefox Desktop | Multi-Browser Smoke & Cross-Engine Rendering |

### Tracing & Media Diagnostics
- `trace`: `"retain-on-failure"`
- `screenshot`: `"only-on-failure"`
- `video`: `"retain-on-failure"`
- `workers`: 1 (single-threaded for deterministic database state transitions)

---

## 2. Test Suite Organisation

```text
tests/
├── api-bridge/
│   └── bridge-passthrough.spec.ts
├── browser/
│   ├── auth/
│   │   └── auth.spec.ts
│   └── workflows/
│       ├── sales-lead-to-order.spec.ts
│       ├── order-to-production.spec.ts
│       ├── material-workflow.spec.ts
│       ├── production-qc.spec.ts
│       ├── dispatch-lifecycle.spec.ts
│       └── finance-payment.spec.ts
```

---

## 3. Tooling Integration

- **Accessibility**: `@axe-core/playwright` installed as devDependency for automated WCAG 2.1 AA auditing.
- **Performance**: `lighthouse` installed as devDependency for Performance/Lighthouse score reporting.
