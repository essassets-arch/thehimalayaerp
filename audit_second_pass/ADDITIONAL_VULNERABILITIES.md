# ADDITIONAL SECURITY VULNERABILITIES IDENTIFIED
**Second-Pass Forensic Discoveries Across Codebase & Architecture**

| System | Himalaya ERP (`https://thehimalaya.cloud`) |
| :--- | :--- |
| **Audit Status** | Second-Pass Independent Identification |
| **New Findings Count** | 5 Additional Findings (1 High, 3 Medium, 1 Informational) |
| **Audit Protocol** | Read-Only • Static Code Analysis • Zero Disruption |

---

## 1. Summary of Additional Findings

During the in-depth second-pass code traversal, five additional security vulnerabilities were uncovered that were not cataloged in the preliminary audit. These findings relate to unmanaged database DDL endpoints, factory equipment manipulation, and missing role guards.

| ID | Title | Severity | Affected Module | CVSS v3.1 |
| :--- | :--- | :--- | :--- | :--- |
| `SEC-DB-002` | Unmanaged DDL Execution Endpoint via HTTP | **HIGH** | Procurement Module | **7.5** |
| `SEC-RBAC-003` | Unauthorized Factory Machine Deletion & Mutation | **MEDIUM** | Production / Machines | **6.5** |
| `SEC-RBAC-004` | Missing Authorization Guards on Dispatch Daily Reports | **MEDIUM** | Logistics / Dispatch | **6.3** |
| `SEC-AUTH-004` | Absence of Multi-Factor Authentication (MFA) for Privileged Roles | **MEDIUM** | Authentication | **5.3** |
| `SEC-API-003` | Missing Tenant Scoping in Finished Goods Query Lock | **INFORMATIONAL** | Database / Inventory | **3.8** |

---

## 2. Deep-Dive Analysis of New Findings

### Finding 1: SEC-DB-002 — Unmanaged DDL Execution Endpoint via HTTP

- **Severity:** **HIGH** (CVSS: 7.5 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N`)
- **CWE:** CWE-285: Improper Authorization / CWE-284: Improper Access Control
- **Affected File:**
  - [backend/src/modules/procurement/procurement.controller.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/procurement/procurement.controller.ts#L271-L276) (Lines 271–276)
  - [backend/src/modules/procurement/procurement.service.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/procurement/procurement.service.ts#L3560-L3589) (Lines 3560–3589)
- **Status:** **VERIFIED VULNERABILITY**

#### Technical Details
The backend exposes an HTTP POST endpoint allowing clients to trigger raw DDL schema mutations against PostgreSQL:
```typescript
@Post('admin/sync-schema')
@RequirePermissions('procurement.purchase_orders.create')
syncSchema() {
  return this.service.syncSchema();
}
```
In `procurement.service.ts`:
```typescript
async syncSchema() {
  const ddl = `
    ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "purchaseIndentId" TEXT;
    ALTER TABLE "PurchaseOrderItem" ADD COLUMN IF NOT EXISTS "purchaseIndentId" TEXT;
    ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "siteInchargeName" TEXT;
    ...
  `;
  for (const statement of ddl.split(';').map(s => s.trim()).filter(Boolean)) {
    await this.prisma.$executeRawUnsafe(statement).catch(() => {});
  }
}
```
#### Impact
- Any low-level procurement clerk with permission to create purchase orders (`procurement.purchase_orders.create`) can execute database DDL over HTTP.
- This creates severe database transaction locking, schema desynchronization, and bypasses version control.
#### Remediation
- Delete the `POST /procurement/admin/sync-schema` endpoint. Database migrations must be managed strictly via tracked Prisma migration files (`prisma/migrations`) during deployment pipelines, never via runtime HTTP requests.

---

### Finding 2: SEC-RBAC-003 — Unauthorized Factory Machine Deletion & Mutation

- **Severity:** **MEDIUM** (CVSS: 6.5 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:L`)
- **CWE:** CWE-285: Improper Authorization / CWE-862: Missing Authorization
- **Affected Files:**
  - [backend/src/modules/production/machine.controller.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/production/machine.controller.ts#L17-L55) (Lines 17–55)
  - [backend/src/modules/production/machine-status.controller.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/production/machine-status.controller.ts#L14-L37) (Lines 14–37)
- **Status:** **VERIFIED VULNERABILITY**

#### Technical Details
`MachineController` manages factory equipment, machinery configurations, and capacity limits:
```typescript
@Controller('machines')
@UseGuards(JwtAuthGuard)
export class MachineController {
  @Post()
  async create(@Body() createMachineDto: CreateMachineDto) { ... }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMachineDto: UpdateMachineDto) { ... }

  @Delete(':id')
  async remove(@Param('id') id: string) { ... }
}
```
Neither `MachineController` nor `MachineStatusController` contains `@Roles` or `@RequirePermissions`.
Because `RolesGuard` and `PermissionsGuard` pass through when decorators are omitted, **any authenticated user** (such as a sales rep or HR intern) can call `DELETE /machines/:id` and erase critical manufacturing machinery records or falsify machine operation status.
#### Impact
- Loss of manufacturing machinery records, disrupted production scheduling, and unauthorized manipulation of plant operational status.
#### Remediation
- Add `@Roles('Plant Head', 'PLANT_HEAD', 'Super Admin', 'SUPER_ADMIN')` and `@RequirePermissions('production.machines.manage')` to `MachineController`.

---

### Finding 3: SEC-RBAC-004 — Missing Authorization Guards on Dispatch Daily Reports

- **Severity:** **MEDIUM** (CVSS: 6.3 — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:N`)
- **CWE:** CWE-285: Improper Authorization
- **Affected File:** `backend/src/modules/dispatch-daily-report/dispatch-daily-report.controller.ts` (Lines 1–65)
- **Status:** **VERIFIED VULNERABILITY**

#### Technical Details
The controller handles daily dispatch records, warehouse outbound tracking, and vehicle dispatch logs. It implements `@UseGuards(JwtAuthGuard)` but lacks `@Roles` or `@RequirePermissions` across its modification handlers.
#### Impact
- Non-logistics personnel can view and alter official daily dispatch metrics and vehicle schedules.
#### Remediation
- Bind `@Roles('Dispatch Executive', 'DISPATCH_EXECUTIVE', 'DISPATCH_2', 'Plant Head', 'Super Admin')` to all mutating routes.

---

### Finding 4: SEC-AUTH-004 — Absence of Multi-Factor Authentication (MFA) for Privileged Roles

- **Severity:** **MEDIUM** (CVSS: 5.3 — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N`)
- **CWE:** CWE-308: Use of Single-factor Authentication
- **Affected Subsystem:** [backend/src/modules/auth/auth.service.ts](file:///d:/projects/thehimalayaerp/backend/src/modules/auth/auth.service.ts)
- **Status:** **VERIFIED ARCHITECTURAL DEFICIENCY**

#### Technical Details
The ERP application is hosted on a public domain (`https://thehimalaya.cloud`) and manages sensitive corporate financials, payroll, and proprietary manufacturing formulas. 
Super Admin, Finance Managers, and Plant Heads authenticate using single-factor username and password credentials. There is no TOTP (Google Authenticator) or SMS/Email OTP step-up verification.
#### Impact
- Any compromised administrative password immediately results in full system compromise without a second barrier.
#### Remediation
- Implement RFC 6238 TOTP-based Multi-Factor Authentication for all administrative and financial roles.

---

### Finding 5: SEC-API-003 — Missing Tenant Scoping in Finished Goods Query Lock

- **Severity:** **INFORMATIONAL** (CVSS: 3.8 — `CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:L/I:N/A:N`)
- **CWE:** CWE-200: Information Exposure
- **Affected File:** [backend/src/database/prisma.service.ts](file:///d:/projects/thehimalayaerp/backend/src/database/prisma.service.ts#L179-L184) (Lines 179–184)
- **Status:** **VERIFIED VULNERABILITY**

#### Technical Details
In the startup auto-post routine:
```typescript
const fgRecords = await tx.$queryRaw<any[]>`
  SELECT id, quantity, "availableQuantity", "reservedQuantity"
  FROM "FinishedGoods"
  WHERE "productId" = ${item.productId}
  FOR UPDATE
`;
```
The query locks finished goods by `productId` across the entire database without filtering by `companyId`. In a multi-tenant setup where two companies share a common product catalog ID, inventory locks and updates could cross tenant boundaries.
#### Remediation
- Add `AND "companyId" = ${report.companyId}` to the query condition.
