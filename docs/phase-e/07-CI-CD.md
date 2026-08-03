# 07 — CI/CD Pipeline & Quality Gate Specification

## 1. Overview & Verification Status

- **Status**: **VERIFIED**
- **File Path**: [`.github/workflows/ci.yml`](file:///d:/prototype-next-main/.github/workflows/ci.yml#L1-L75)
- **Pipeline Type**: Non-bypassable GitHub Actions Quality Gate.
- **Fail-Fast Enforcement**: Configured to abort execution immediately upon any single step failure.

---

## 2. CI/CD Quality Gate Pipeline Architecture

```mermaid
graph TD
  Step1[1. Checkout Codebase] --> Step2[2. Setup Node.js 18 & Cache]
  Step2 --> Step3[3. Install Dependencies via npm ci]
  Step3 --> Step4[4. Validate Prisma Schema]
  Step4 --> Step5[5. Deploy Database Migrations]
  Step5 --> Step6[6. Seed Database Pass 1]
  Step6 --> Step7[7. Seed Database Pass 2 Idempotency]
  Step7 --> Step8[8. Targeted Security Core Lint]
  Step8 --> Step9[9. Repository Linting]
  Step9 --> Step10[10. TypeScript Typecheck]
  Step10 --> Step11[11. Production NestJS Build]
  Step11 --> Step12[12. Execute Unit Tests]
  Step12 --> Step13[13. Execute Security E2E Tests]
  Step13 --> Step14[14. Execute Business E2E Tests]
```

---

## 3. Workflow Definition (`.github/workflows/ci.yml`)

```yaml
name: Backend Quality Gate Pipeline

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]

jobs:
  backend-quality-gate:
    name: Backend Production Quality Gate
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgrespassword
          POSTGRES_DB: himalaya_erp_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: "postgresql://postgres:postgrespassword@localhost:5432/himalaya_erp_test?schema=public"
      JWT_SECRET: "ci-secret-key-super-secure-32-chars-long"
      PORT: 3001
      NODE_ENV: test

    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Dependencies
        run: |
          npm ci --workspace=backend

      - name: Validate Prisma Schema
        run: |
          npx prisma validate --schema=backend/prisma/schema.prisma

      - name: Deploy Database Migrations
        run: |
          npx prisma migrate deploy --schema=backend/prisma/schema.prisma

      - name: Seed Database (First Pass)
        run: |
          cd backend && npx prisma db seed

      - name: Seed Database (Second Pass - Idempotency Check)
        run: |
          cd backend && npx prisma db seed

      - name: Targeted Security Core Lint
        run: |
          cd backend && npx eslint src/common/guards/ src/common/types/security.types.ts

      - name: Repository Linting
        run: |
          cd backend && npm run lint

      - name: TypeScript Typecheck
        run: |
          cd backend && npx tsc --noEmit

      - name: Production NestJS Build
        run: |
          cd backend && npm run build

      - name: Execute Unit Test Suite
        run: |
          cd backend && npm test

      - name: Execute Security E2E Test Suite
        run: |
          cd backend && npm run test:e2e:security

      - name: Execute Procurement Business E2E Test Suite
        run: |
          cd backend && npm run test:e2e:procurement
```
