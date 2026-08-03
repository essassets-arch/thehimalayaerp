# 04 — AST Codebase Scanner & Static Audit Design Report

## 1. Overview & Verification Status

- **Status**: **VERIFIED**
- **Scanner Tool**: [`backend/scripts/ast-codebase-audit.ts`](file:///d:/prototype-next-main/backend/scripts/ast-codebase-audit.ts)
- **Output Artifact**: [`docs/autonomous-healing/ast-audit-results.json`](file:///d:/prototype-next-main/docs/autonomous-healing/ast-audit-results.json)

---

## 2. Scanner Capabilities

1. **Frontend Mock & LocalStorage Audit**: Scans `frontend/` pages, stores, hooks.
2. **Prisma Model Usage Audit**: Scans for direct DB delegate usage, relations, tests/seeds.
3. **Route Collision Audit**: AST normalization of route dynamic parameters (`:id` vs `:orderId`).
4. **Permission & Role Seed Audit**: Verifies every controller permission exists in `prisma/seed.ts`.
