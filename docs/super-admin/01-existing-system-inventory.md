# 01 - Existing System Inventory & Architecture Analysis

## Overview
This inventory documents the existing domain models, Prisma schema structures, roles, permissions, API controllers, and frontend data binding across the Himalaya ERP system prior to the Super Admin Command Center expansion.

---

## 1. Existing Prisma Models Summary (`backend/prisma/schema.prisma`)

* **Core Identity & Access Control**:
  - `User`: Primary user authentication model with `publicId`, `email`, `password`, `name`, `roleId`, `companyId`, `isActive`, `failedLoginAttempts`, `lockedUntil`.
  - `Role`: Security role model with `name`, `code` (`@unique`), `rolePermissions`.
  - `Permission`: Granular action model with `name`, `code` (`@unique`), `rolePermissions`.
  - `RolePermission`: Many-to-many join model between `Role` and `Permission`.
  - `RefreshSession`: Active JWT refresh session tracking `tokenHash`, `expiresAt`, `revokedAt`, `userAgent`, `ipAddress`.
  - `ElevationSession`: Privileged action step-up elevation tracking.

* **Organization Hierarchy**:
  - `Company`: Root organizational entity (`publicId`, `name`).
  - `Branch`: Branch location under Company (`publicId`, `name`, `companyId`).
  - `Warehouse`: Storage facility under Branch/Company (`code`, `name`).
  - `Department`: Department entity under Company (`name`, `code`).
  - `WorkLocation`: Physical work site location.

* **Master Data**:
  - `Product`: Product catalog item (`code`, `publicId`, `name`, `category`, `unit`, `price`, `costPrice`).
  - `Customer`: Customer partner model (`customerCode`, `companyName`, `gstin`, `creditStatus`).
  - `Supplier`: Vendor partner model (`code`, `name`, `gstin`).
  - `Employee`: HR Employee record linked 1:1 to `User` via `userId`.

---

## 2. Role & Permission Architecture Analysis

* **Existing System Roles**:
  - `SUPER_ADMIN` / `Super Admin`
  - `ADMIN` / `Admin`
  - `SALES_EXECUTIVE` / `Sales Executive`
  - `SALES_MANAGER` / `Sales Manager`
  - `PLANT_HEAD` / `Plant Head`
  - `PRODUCTION_MANAGER` / `Production Manager`
  - `DISPATCH_EXECUTIVE` / `Dispatch Executive`
  - `FINANCE_EXECUTIVE` / `Finance Executive`
  - `STORE_MANAGER` / `Store Manager`
  - `HR_MANAGER` / `HR Manager`

* **Permission Naming Convention**:
  - Format: `<module>.<resource>.<action>` (e.g. `sales.orders.read`, `store.inventory.read`, `admin.users.manage`).
  - System permission check decorator `@RequirePermissions(...)` is enforced on NestJS controller handlers.

---

## 3. Current Backend Controller Inventory

* `auth.controller.ts`: Login, logout, refresh, current user profile.
* `users.controller.ts`: User listing and user management endpoints.
* `customers.controller.ts`: Customer directory and credit status.
* `sales.controller.ts`: Sales orders and quotation lifecycle.
* `inventory.controller.ts`: Stock levels, transactions, and raw inventory.
* `plant-head.controller.ts`: Dashboard metrics, production analytics, capacity, and department overviews.
* `procurement.controller.ts`: Indents, purchase orders, and GRNs.
* `dispatch.controller.ts`: Dispatches, vehicle assignments, and delivery tracking.
* `finance/invoices.controller.ts` & `payments.controller.ts`: Invoices, collections, and vendor payments.
* `hr/employees.controller.ts` & `payroll.controller.ts`: Staff roster and payroll processing.

---

## 4. Identified Duplications, Fallbacks & Gaps

* **Frontend Mock/Fallback Datasets**:
  - Hardcoded sample fallback arrays in `financialCalculations.js` when backend metrics are partial.
  - Partial Recharts container sizing in Next.js hydration without explicit `mounted` state guards.
* **Missing Dedicated Admin Endpoints**:
  - Need consolidated `/api/v1/super-admin/dashboard` endpoint for 1-call live database aggregation.
  - Need dedicated `/api/v1/super-admin/user-types` and `/api/v1/super-admin/permissions/catalog` endpoints.

---

## 5. Data Preservation Strategy

1. **Zero Destructive Operations**: No `prisma migrate reset`, no `TRUNCATE`, no table drops.
2. **Idempotent Upserts**: All seed alignment scripts use `upsert` matching on unique `code` or `publicId`.
3. **Password & Token Security**: Never modify or re-hash active production user passwords.
