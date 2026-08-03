# 07. Critical Fix Order

Generated from verified code parsing and build checks.

## Priority 1: Build & Type Failures
- Any failing steps in `06-BUILD-TEST-RESULTS.md` (e.g. Typecheck errors, Build failures) must be fixed before deploying.

## Priority 2: Missing Role & Permission Decorators
- Controllers missing `@RequirePermissions` identified in `01-VERIFIED-ROLE-PERMISSION-MATRIX.md` present a massive security risk. Apply decorators strictly.

## Priority 3: Mock Data Replacement
- Replace all UI views running off `localStorage` or mocked JSON responses (identified in `05-DUPLICATES-AND-DEAD-CODE.md`) with actual API integrations.

## Priority 4: Standardize API Endpoints
- Resolve duplicated APIs and unify response DTOs.
