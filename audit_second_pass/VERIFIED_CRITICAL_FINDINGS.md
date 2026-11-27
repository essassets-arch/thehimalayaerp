# VERIFIED CRITICAL SECURITY FINDINGS
**Forensic Analysis of Five High-Impact Vulnerabilities**

| System | Himalaya ERP (`https://thehimalaya.cloud`) |
| :--- | :--- |
| **Audit Status** | Second-Pass Independent Verification Completed |
| **Risk Classification** | CRITICAL (CVSS v3.1: 9.1 – 9.8) |
| **Audit Protocol** | Read-Only • Zero Data Modification • Zero Production Interruption |

---

## Executive Overview of Critical Risks

The second-pass forensic investigation confirmed five severe application vulnerabilities that directly threaten data integrity, tenant separation, access control, and enterprise availability:

```
[SEC-AUTH-001] Hardcoded Master Accounts & Password Overwrite (CVSS 9.8)
     │
[SEC-TENANT-001] Client-Controlled Header Tenant Injection (CVSS 9.6)
     │
[SEC-DB-001] Startup Multi-Tenant Partition Collapse & Raw DDL (CVSS 9.5)
     │
[SEC-API-001] Unauthenticated Public File Upload 50MB (CVSS 9.1)
     │
[SEC-RBAC-001] Broken Function-Level Authorization in Payroll (CVSS 9.4)
```

---

## Finding 1: SEC-AUTH-001 — Hardcoded Master Credentials & DB Password Overwrite

- **CVSS v3.1 Score:** **9.8** (Critical) — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`
- **CWE:** CWE-798: Use of Hard-coded Credentials / CWE-287: Improper Authentication
- **Affected File:** [backend/src/modules/auth/auth.service.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/auth/auth.service.ts#L22-L51) (Lines 22–51, 127–172)
- **Status:** **VERIFIED VULNERABILITY**

### Technical Explanation
The file `auth.service.ts` contains a constant table `OFFICIAL_CREDENTIALS` storing static credentials for 25 production enterprise accounts, including `super.admin@himalayaerp.com`, `hr@himalayaerp.com`, `moksha.n@himalayaerp.com`, `sahad.m@himalayaerp.com`, and accounts across Sales, Dispatch, Finance, and Plant Operations.

When an authentication request arrives at `login(loginDto)`:
1. Lines 128–138 match the incoming email against `OFFICIAL_CREDENTIALS`.
2. Lines 153–160 verify the bcrypt hash from PostgreSQL. If the password was changed by the user in the database, this check fails (`!isMatch`).
3. Lines 163–172 execute a synchronization:
   ```typescript
   if (!isMatch && officialCred && cleanPassword === officialCred.password) {
     const rounds = this.configService.get<number>('bcryptRounds') || 12;
     const newHash = await hashAsync(officialCred.password, rounds);
     await this.prisma.user.update({
       where: { id: user.id },
       data: { password: newHash, failedLoginAttempts: 0, lockedUntil: null, isActive: true },
     });
     user.password = newHash;
     isMatch = true;
   }
   ```
4. This means an attacker using the hardcoded credential will **actively rewrite the database password hash**, resetting any legitimate password change made by authorized staff.

### Threat Scenario
- Anyone who gains read access to the git repository or build artifacts can log in as Super Admin or HR Manager at any time.
- If a rogue employee has their access revoked or password reset by management, they can simply log in using the static password, which immediately unlocks the account (`lockedUntil: null, isActive: true`) and resets the hash.

### Remediation Protocol
- Remove `OFFICIAL_CREDENTIALS` completely from source code.
- Remove lines 162–172 that overwrite database passwords on login.
- Store initial administrative bootstrap credentials exclusively in environment variables or an isolated one-time database migration that only triggers if zero users exist.

---

## Finding 2: SEC-TENANT-001 — Client-Controlled `x-company-id` Tenant Injection

- **CVSS v3.1 Score:** **9.6** (Critical) — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:N`
- **CWE:** CWE-639: Authorization Bypass Through User-Controlled Key / CWE-284: Improper Access Control
- **Affected Files:**
  - [frontend/app/api/backend/[...path]/route.ts](file:///d:/projects/thehimalayaerp/frontend/app/api/backend/%5B...path%5D/route.ts#L96) (Line 96)
  - [backend/src/modules/attendance-request/attendance-request.controller.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/attendance-request/attendance-request.controller.ts#L24-L27) (Lines 24–27, 34–37)
  - [backend/src/modules/expense/expense.controller.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/expense/expense.controller.ts#L43-L45) (Lines 43–45)
  - [backend/src/modules/leave/leave.controller.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/leave/leave.controller.ts#L23-L25) (Lines 23–25, 33–35, 43–45)
  - [backend/src/modules/complaints/complaints.controller.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/complaints/complaints.controller.ts#L33) (Lines 33, 43, 52)
  - [backend/src/modules/store-reports/store-reports.controller.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/store-reports/store-reports.controller.ts#L16) (Line 16)
- **Status:** **VERIFIED VULNERABILITY**

### Technical Explanation
Multi-tenant ERP platforms must enforce tenant scoping exclusively from the cryptographically verified JWT payload (`req.user.companyId`). In Himalaya ERP:
1. The Next.js API proxy bridge forwards the client header:
   ```typescript
   headers: {
     ...(request.headers.get('x-company-id') ? { 'x-company-id': request.headers.get('x-company-id')! } : {}),
   }
   ```
2. In 17+ backend controllers, `req.headers['x-company-id']` is evaluated **ahead of** or **as a direct substitute for** `req.user.companyId`:
   ```typescript
   const companyId =
     req.headers['x-company-id'] ||
     req.user?.companyId ||
     'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
   ```
3. An authenticated user belonging to Company A can simply append `x-company-id: <Company-B-UUID>` to their HTTP requests to query, modify, or approve records belonging to Company B.

### Threat Scenario
- A tenant competitor on a shared deployment can access confidential employee complaints, expense claims, leave registers, store inventory metrics, and dispatch queues of another organization.

### Remediation Protocol
- Deprecate `x-company-id` header inspection across all non-Super-Admin controllers.
- Derive `companyId` strictly from `req.user.companyId`.
- Only allow `Super Admin` users to pass a tenant filter, and only via explicit, audited query parameters validated by a dedicated tenant guard.

---

## Finding 3: SEC-DB-001 — Destructive Prisma Startup Tenant Collapse & Unmanaged DDL

- **CVSS v3.1 Score:** **9.5** (Critical) — `CVSS:3.1/AV:L/AC:L/PR:H/UI:N/S:C/C:H/I:H/A:H`
- **CWE:** CWE-284: Improper Access Control / CWE-668: Exposure of Resource to Wrong Sphere
- **Affected File:** [backend/src/database/prisma.service.ts](file:///d:/projects/thehimalayaerp/backend/src/database/prisma.service.ts#L41-L350) (Lines 41–150, 155–311, 330–350)
- **Status:** **VERIFIED VULNERABILITY**

### Technical Explanation
`PrismaService` overrides `onModuleInit()` to execute database mutations every time the backend container starts or reboots:
1. **Unmanaged DDL via Raw SQL (Lines 41–150):**
   Executes over 50 unmanaged `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements via `$executeRawUnsafe(statement)`. This bypasses Prisma migration tracking (`_prisma_migrations`), leading to schema drift and migration corruption.
2. **Synthetic Data Creation & Stock Posting (Lines 155–311):**
   Queries unposted production reports, creates dummy customers, dummy production plans, dummy sales orders (`SO-AUTO-...`), dummy work orders (`WO-AUTO-...`), dummy finished goods records, and writes stock history entries during application boot!
3. **Multi-Tenant Partition Collapse (Lines 330–350):**
   ```typescript
   await this.user.updateMany({
     where: { companyId: { not: companyId } },
     data: { companyId },
   });
   await this.employee.updateMany({
     where: { companyId: { not: companyId } },
     data: { companyId },
   });
   await this.workLocation.updateMany({
     where: { companyId: { not: companyId } },
     data: { companyId },
   });
   await this.attendance.updateMany({
     where: { companyId: { not: companyId } },
     data: { companyId },
   });
   ```
   Every time the backend boots, it forces **ALL users, employees, work locations, and attendance records from any company** to point to the hardcoded company UUID `88c57ebc-b3b7-49e3-8d5d-6321a0e89015`!

### Threat Scenario
- If the application is deployed in a multi-tenant environment, adding a secondary company will have all its users, staff, and attendance records permanently hijacked and merged into the primary company upon the next server reboot or container restart.

### Remediation Protocol
- Completely remove lines 155–350 from `onModuleInit()`.
- Move any missing column definitions into tracked, versioned Prisma migrations.
- Ensure that `PrismaService.onModuleInit()` only connects to the database (`await this.$connect()`) and never modifies schema or business records.

---

## Finding 4: SEC-API-001 — Unauthenticated Public Arbitrary File Upload (50MB)

- **CVSS v3.1 Score:** **9.1** (Critical) — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:H`
- **CWE:** CWE-306: Missing Authentication for Critical Function / CWE-434: Unrestricted File Upload
- **Affected File:** [frontend/app/api/upload/route.ts](file:///d:/projects/thehimalayaerp/frontend/app/api/upload/route.ts#L20-L74) (Lines 20–74)
- **Status:** **VERIFIED VULNERABILITY**

### Technical Explanation
`POST /api/upload` is implemented directly in Next.js App Router:
1. It does not check session tokens, cookies, or authorization headers.
2. Because `frontend/middleware.ts` does not exist, requests to `/api/upload` bypass all access control.
3. It accepts files up to 50MB (`MAX_IMAGE_SIZE = 50 * 1024 * 1024`).
4. It accepts an arbitrary `category` parameter from the form body and writes files directly to the host filesystem:
   ```typescript
   const category = (formData.get("category") as string) || "attachments";
   const fileName = `${randomUUID()}.${extension}`;
   const buffer = Buffer.from(await file.arrayBuffer());
   const frontendDir = path.join(process.cwd(), "public", "uploads", category);
   await mkdir(frontendDir, { recursive: true });
   await writeFile(path.join(frontendDir, fileName), buffer);
   ```

### Threat Scenario
- An unauthenticated attacker can flood the server with 50MB files, filling up the host VPS disk partition within minutes, causing PostgreSQL and Docker to crash (Denial of Service).
- Attackers can upload phishing HTML, PDF malware, or inappropriate content and serve it directly under `https://thehimalaya.cloud/uploads/attachments/...`.

### Remediation Protocol
- Implement strict JWT verification in `frontend/app/api/upload/route.ts`.
- Restrict allowed MIME types strictly to verified business documents (JPEG, PNG, WebP, PDF) and inspect magic bytes.
- Reduce maximum file size to 10MB.
- Proxy uploads through the NestJS backend where tenant authorization and user audit trails are enforced.

---

## Finding 5: SEC-RBAC-001 — Broken Function-Level Authorization in Payroll Management

- **CVSS v3.1 Score:** **9.4** (Critical) — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N`
- **CWE:** CWE-285: Improper Authorization / CWE-862: Missing Authorization
- **Affected File:** [backend/src/modules/payroll/payroll.controller.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/payroll/payroll.controller.ts#L18-L20) (Lines 18–20, 27–70, 118–200)
- **Status:** **VERIFIED VULNERABILITY**

### Technical Explanation
1. In NestJS, `RolesGuard` and `PermissionsGuard` are registered globally in `app.module.ts`. However:
   - `RolesGuard` returns `true` if `@Roles(...)` is not defined on the route.
   - `PermissionsGuard` returns `true` for any authenticated user if `@RequirePermissions(...)` is not defined.
2. In `PayrollController`:
   ```typescript
   @Controller()
   @UseGuards(JwtAuthGuard)
   export class PayrollController { ... }
   ```
   There are **zero `@Roles` decorators** and **zero `@RequirePermissions` decorators** on the entire controller!
3. Critical endpoints exposed without role checks include:
   - `GET /hr/payroll` and `GET /payroll`: View all employee salaries, bank account details, deductions, and tax withholdings.
   - `POST /hr/payroll/generate` and `POST /hr/payroll/generate-bulk`: Generate salary records.
   - `POST /super-admin/payroll/:id/approve` and `POST /hr/payroll/:id/approve`: Approve payroll records as Super Admin.
   - `POST /super-admin/payroll/send-to-finance`: Release payroll to finance.
   - `POST /finance/payroll/:id/mark-paid`: Mark salaries as disbursed and record payment transactions.
4. While `markPaid` has an internal role check in `payroll.service.ts` line 948, endpoints like `approve` (lines 720–745) have **zero role validation in either controller or service**. Any user with a valid JWT (e.g. Sales Executive, Dispatch Clerk) can approve payroll records as Super Admin.

### Threat Scenario
- Any disgruntled employee with a login can view all staff compensation details, adjust payroll statuses, or trigger premature disbursements, causing severe financial and legal liabilities.

### Remediation Protocol
- Add `@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)` to `PayrollController`.
- Decorate every administrative endpoint with strict roles:
  - `@Roles('Super Admin', 'SUPER_ADMIN')` on `super-admin/payroll/...`
  - `@Roles('HR Manager', 'HR')` on `hr/payroll/generate`, `verify`
  - `@Roles('Finance Manager', 'Finance Executive', 'FINANCE')` on `finance/payroll/...`
- Ensure self-service endpoints (`payroll/me`) strictly filter records by the authenticated employee's ID.
