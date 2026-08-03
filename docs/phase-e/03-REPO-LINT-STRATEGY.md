# Phase E — Repository Code Quality & Lint Strategy

## 1. Targeted Security Core Strategy

Security-critical files (`src/common/guards/`, `src/common/types/security.types.ts`) are subjected to strict zero-warning policy:
- No `@ts-ignore` or `@ts-nocheck` directives.
- No explicit or implicit `any` types for payload objects, user definitions, or permission strings.
- Standardized `AuthenticatedRequest` interface ensuring `req.user` contains strongly-typed `sub`, `email`, `role`, `companyId`, and `permissions`.

### Verified Command Output

```bash
npx eslint src/common/guards/ src/common/types/security.types.ts
# Output: 0 errors, 0 warnings
```

---

## 2. Type Safety Infrastructure

Security type contracts defined in `src/common/types/security.types.ts`:

```ts
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  companyId: string;
  permissions?: string[];
  type?: 'access' | 'elevation' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
  companyId: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
```

---

## 3. Maintenance Policy

1. **Pre-Commit Verification**: All additions to `src/common/guards/` must pass targeted ESLint with 0 warnings.
2. **TypeScript Compilation**: `npx tsc --noEmit` must execute cleanly without ignoring decorator metadata or module isolation warnings.
3. **No Guard Bypassing**: Guards are never commented out in production controllers; non-security unit tests must use NestJS `overrideGuard` in testing modules.
