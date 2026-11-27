# COMPREHENSIVE REGRESSION TEST PLAN
**Pre-Deployment & Post-Remediation Verification Protocol**

| System | Himalaya ERP (`https://thehimalaya.cloud`) |
| :--- | :--- |
| **Audit Status** | Second-Pass Test Specification |
| **Environment** | Strictly Isolated Staging (Synthetic Data Only) |
| **Directive** | NO PRODUCTION DATA IN STAGING • COMPREHENSIVE COVERAGE |

---

## 1. Regression Testing Framework

To ensure that security remediations introduce zero side effects or functional regressions, all proposed patches must pass a 4-tier validation framework in an isolated staging environment before production approval:

```
[ Tier 1: Unit & Guard Tests ]
           │
[ Tier 2: API & Integration Tests ]
           │
[ Tier 3: Multi-Tenant Isolation Tests ]
           │
[ Tier 4: End-to-End (E2E) Browser Journeys ]
```

---

## 2. Test Suite Specifications

### Tier 1: Unit & Guard Tests

| Test ID | Test Target | Verification Objective | Expected Result |
| :--- | :--- | :--- | :--- |
| `TC-AUTH-01` | `AuthService.login()` | Login with valid bcrypt credentials from database. | Returns valid JWT access and refresh tokens. |
| `TC-AUTH-02` | `AuthService.login()` | Login with invalid password. | Returns HTTP 401 `INVALID_CREDENTIALS`. |
| `TC-AUTH-03` | `AuthService.login()` | 10 consecutive failed attempts. | Returns HTTP 401 `ACCOUNT_LOCKED` with lockout countdown. |
| `TC-AUTH-04` | `AuthService.login()` | Attempt login using removed static passwords. | Fails with HTTP 401; does NOT overwrite database hash. |
| `TC-GUARD-01`| `RolesGuard` | Access Super Admin endpoint with `SALES_EXECUTIVE` token. | Returns HTTP 403 `Insufficient role privileges`. |
| `TC-GUARD-02`| `PermissionsGuard`| Access `admin.productionreports.read` without permission. | Returns HTTP 403 `Forbidden`. |
| `TC-GUARD-03`| `CurrentCompanyId` | Request with spoofed `x-company-id: <Victim-UUID>`. | Evaluates to token company ID; header is ignored. |

---

### Tier 2: Integration & Workflow Tests

| Test ID | Module | Workflow Tested | Expected Result |
| :--- | :--- | :--- | :--- |
| `TC-INT-01` | **Sales O2C** | Create lead → convert to quotation → approve quotation → generate sales order. | Sales order generated with valid `orderNumber` linked to customer. |
| `TC-INT-02` | **Procurement** | Create purchase indent → create PO → approve PO. | PO status transitions smoothly; zero schema synchronization errors. |
| **`TC-INT-03`** | **Payroll** | Generate payroll for month → HR verify → submit to Super Admin. | Status transitions to `PENDING_SUPER_ADMIN_APPROVAL`. |
| **`TC-INT-04`** | **Payroll Approval**| Non-Super Admin calls `POST /super-admin/payroll/:id/approve`. | **BLOCKED (HTTP 403)**. |
| **`TC-INT-05`** | **Payroll Approval**| Super Admin calls `POST /super-admin/payroll/:id/approve`. | Status transitions to `SUPER_ADMIN_APPROVED`. |
| **`TC-INT-06`** | **Payroll Disburse**| Finance Manager calls `POST /finance/payroll/:id/mark-paid` with UTR. | Status transitions to `PAID`; payment transaction logged. |
| `TC-INT-07` | **Dispatch** | Create dispatch order → generate gate pass → upload POD. | Dispatch record created; POD saved to authenticated uploads. |
| `TC-INT-08` | **Attendance** | Employee GPS clock-in via mobile app interface. | Attendance recorded under authenticated user's company partition. |

---

### Tier 3: Multi-Tenant Isolation Tests

| Test ID | Scope | Test Scenario | Success Criteria |
| :--- | :--- | :--- | :--- |
| `TC-TENANT-01`| Sales Orders | User from Company A calls `GET /sales/orders`. | 100% of returned orders belong to Company A. Zero Company B orders. |
| `TC-TENANT-02`| Employees | HR Manager from Company A calls `GET /hr/employees`. | Only Company A staff returned. Zero cross-company employee records. |
| `TC-TENANT-03`| Attendance | User from Company A queries `GET /attendance-request/my`. | Returns only user's own requests in Company A. |
| `TC-TENANT-04`| Inventory | Store Manager queries `GET /inventory/stock-levels`. | Displays only Company A warehouse stock. |
| `TC-TENANT-05`| Startup Check | Restart backend service; inspect database. | All company IDs in `User`, `Employee`, `Attendance` remain unchanged. |

---

### Tier 4: E2E Browser Journey Tests (Playwright)

Leverage the existing Playwright test suites in `frontend/tests/`:

1. **Clean Sales Flow:**
   ```bash
   npx playwright test tests/e2e/clean-sales-state.spec.ts --project=chromium
   ```
2. **Harsh Order-to-Cash UI Journey:**
   ```bash
   npx playwright test tests/e2e/harsh-o2c-ui.spec.ts --project=chromium
   ```
3. **Salary & Payroll Lifecycle:**
   ```bash
   npx playwright test tests/salary-workflow.spec.ts --project=chromium
   ```
4. **Attendance Punch & GPS Verification:**
   ```bash
   npx playwright test tests/browser/attendance-punch-gps.spec.ts --project=chromium
   ```
5. **Dispatch Queue UI:**
   ```bash
   npx playwright test tests/e2e/dispatch-queues-ui.spec.ts --project=chromium
   ```

---

## 3. Staging Test Environment Requirements

To strictly satisfy the **Zero Data Loss & Zero Privacy Exposure** mandates:
1. **Isolated Infrastructure:** Staging must run on a completely separate server or container network from `thehimalaya.cloud`.
2. **Synthetic Seed Data:** Staging must be seeded using `prisma/seed.ts` or synthetic fixtures. Under no circumstances should production database dumps containing real customer PII or financial transactions be restored to staging.
3. **No External Webhooks:** Email notifications (SMTP), SMS gateways, and live payment gateways must be mocked or disabled in staging.
4. **Sign-Off Gate:** All Tier 1 to Tier 4 tests must pass with 100% success rate before remediation patches are scheduled for production maintenance.
