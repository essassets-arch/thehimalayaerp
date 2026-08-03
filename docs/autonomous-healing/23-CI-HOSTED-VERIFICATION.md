# 23 — GitHub Actions Hosted CI Verification Specification

## 1. Overview & Verification Status

- **Status**: **VERIFIED LOCALLY (HOSTED CI EXECUTION: NOT VERIFIED)**
- **Workflow File**: [`.github/workflows/ci.yml`](file:///d:/prototype-next-main/.github/workflows/ci.yml)

---

## 2. Pipeline Specification

The GitHub Actions workflow includes PostgreSQL 15 service container, automated Prisma migrations, seed idempotency check, TypeScript compilation, NestJS production build, unit tests, and all 12 domain E2E test suites.
