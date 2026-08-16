# Himalaya ERP System — Master Project Documentation

> **Company / Organization:** Himalaya FRP & Construction Products  
> **System Name:** Himalaya ERP (Enterprise Resource Planning & CRM System)  
> **Repository Architecture:** Full-stack Monorepo (Next.js 15 Frontend + NestJS 11 Backend + Prisma ORM 5 + PostgreSQL)  
> **Document Version:** 3.0.0 (Complete Specification with Dynamic Search System, Role Maps & Flow Engines)

---

## 1. Executive Summary & System Overview

The **Himalaya ERP System** is an enterprise-grade, end-to-end manufacturing and operational management platform engineered specifically for **Himalaya FRP & Construction Products** (manufacturers of FRP Cover Blocks, FRP Manhole Covers, FRP Gratings, and FRP Structural Products).

### Key Business Lifecycles Covered
1. **Lead-to-Cash (L2C) / Order-to-Cash (O2C):** Lead creation, activity tracking, follow-ups, quotation generation, sales order placement, credit limit review, material allocation, order dispatch, customer invoicing, and payment reconciliation.
2. **Procure-to-Pay (P2P):** Material requisitions, shop-floor purchase indents, vendor purchase orders (PO), Goods Receipt Notes (GRN), material quality rejection, vendor invoicing, and supplier payable settlements.
3. **Production & Quality Control (QC):** Master production scheduling, work order creation, shift entries, scrap tracking, testing records, and multi-stage QC gate inspections.
4. **Logistics & Warehousing:** Warehouse stock management, material issues, dispatch assignments, and shipping consignment tracking.
5. **HR, Attendance & Payroll:** Employee profiles, attendance log aggregation, leave request workflow, monthly payroll processing, salary slip generation, and payment distribution.
6. **Financial Accounting:** Customer ledgers, vendor payables, payment allocation, credit notes, and financial audit logs.

---

## 2. Technical Architecture & Monorepo Topology

```
prototype-next-main/
├── backend/                  # NestJS REST API Gateway & Business Logic Service
│   ├── prisma/               # Prisma Schema & Database Migrations
│   ├── src/
│   │   ├── common/           # Decorators, Filters, Guards, Interceptors, Pipes
│   │   ├── config/           # Environment & Application Configurations
│   │   ├── database/         # Database Service & Prisma Integration
│   │   ├── modules/          # 47 Domain-driven NestJS Feature Modules (incl. Search)
│   │   └── realtime/         # WebSockets / Real-time Event Gateways
│   └── test/                 # E2E Integration Test Suite (Jest)
├── frontend/                 # Next.js 15 App Router Frontend & Portals
│   ├── app/                  # Route Handlers & Next.js Pages
│   ├── components/           # Reusable UI Components & Modals
│   ├── modules/              # Domain-specific UI Portals & Dashboards
│   ├── store/                # Master Zustand Store (`erpStore.ts` & Domain Slices)
│   ├── lib/                  # Navigation Maps (`navigationConfig.js`), API Clients
│   └── tests/                # E2E Browser Testing Suite (Playwright)
├── docs/                     # Architectural Docs, Flow Maps & System Inventories
├── scripts/                  # Runtime Certification & Database Seed PowerShell Scripts
├── docker-compose.yml        # Production Container Deployment Matrix
└── Caddyfile                 # Production Reverse Proxy & SSL Configuration
```

---

## 3. Technology Stack

### Frontend Stack (`/frontend`)
- **Framework:** Next.js 15 (App Router architecture with React 19)
- **State Management:** Zustand 5 (Master `useERPStore` with domain-driven actions in `store/domains/*`)
- **Styling & UI:** Vanilla CSS + Tailwind CSS v4, Lucide Icons, Base UI, Radix UI primitives, Framer Motion
- **Data Tables & Visualization:** TanStack Table, Tabulator Tables, Recharts, SweetAlert2, Sonner toasts
- **Forms & Validation:** React Hook Form with Zod schemas
- **E2E Testing:** Playwright with `@axe-core/playwright` accessibility testing and Lighthouse performance auditing

### Backend Stack (`/backend`)
- **Framework:** NestJS 11 running on Node.js / Express
- **Database & ORM:** PostgreSQL database with Prisma ORM 5 (`@prisma/client`)
- **Authentication & Security:** JWT (Passport-JWT), bcrypt hashing, NestJS Throttler rate limiting, Helmet HTTP headers, Cookie-parser, CORS control
- **Validation & Transformation:** `class-validator`, `class-transformer` DTOs

---

## 4. 100% Dynamic Global Search + Page Search Architecture

The application contains two distinct, strictly separated search architectures:

```mermaid
flowchart TD
    subgraph 1. Header Global Search (Cross-Domain)
        HeaderInput["Header Search Box (Cmd+K / Ctrl+K)"] -->|GET /api/backend/search/global?q=...| NestSearchCtrl[NestJS SearchController]
        NestSearchCtrl --> NestSearchSvc[NestJS SearchService]
        NestSearchSvc -->|Role Scoped Query| PostgresDB[(PostgreSQL Database)]
        PostgresDB -->|Normalized Groups & Route Mapping| DropdownUI["Command Dropdown UI (Categorized Results)"]
    end

    subgraph 2. Page Search (Entity-Specific)
        PageInput["Page Search Input (e.g. Search leads...)"] -->|Server Query / Filter Match| EntityTable[Current Page Table Dataset]
        EntityTable -->|Updates| BadgeCount["Dynamic Count Display ('Showing: X Leads')"]
    end
```

### 4.1 Header Global Search Architecture (Strictly Panel-Scoped)
- **Rule Matrix:**
  - **GLOBAL SEARCH** = all searchable data inside the **CURRENT PANEL only** (derived via `&panel={currentPanel}` based on active portal route).
  - **PAGE SEARCH** = data from the **CURRENT PAGE only** (e.g. `/sales/leads` page search filters Leads only).
- **Sales Panel Global Search Bounds:**
  - **ALLOWED:** Leads, Daily Tasks / Reminders, Samples, Quotations, Sales Orders, Production Status (Orders stage), Payment Follow-up, Payment History, Customers, Customer Complaints.
  - **EXCLUDED:** Plant Head Incoming Orders/Planning, Production Work Orders, Store Raw Inventory, QC Internal Inspections, Dispatch Consignments, Finance Internal Accounts, HR Employee Records.
- **Centralized Endpoint:** `GET /api/backend/search/global?q={query}&panel={panel}&limit={limit}`
- **Security & Authorization Scoping:** Server-side derivation of `req.user.id`, `req.user.companyId`, `req.user.role`. Applies fine-grained role scoping via `getSalesScope(userId, role, modelName)` from `rbac.util.ts`.
- **Panel-Aware Route Builder:** Automatically generates destination routes scoped to the user's active portal (`/supersales/*`, `/sales/*`, `/plant-head/*`, `/production/*`, `/store/*`, `/qc/*`, `/dispatch/*`, `/finance/*`, `/hr/*`, `/super-admin/*`).
- **Normalized Response Matrix:**
  ```json
  {
    "query": "AUM",
    "count": 5,
    "groups": [
      {
        "type": "LEAD",
        "label": "Leads",
        "results": [
          {
            "id": "uuid",
            "title": "AUM CERAMICS",
            "subtitle": "HCCL/2627/0135",
            "meta": "9898541581",
            "status": "NEW",
            "route": "/sales/leads/uuid"
          }
        ]
      }
    ]
  }
  ```
- **UI Behavior:** Debounced (300ms), keyboard accessible (`Cmd+K` / `Ctrl+K`), Escape to close, click navigation.

### 4.2 Page Search Architecture
- **Entity Scope:** Multi-field filtering restricted strictly to the current page entity (e.g., Leads directory filters only Leads).
- **Supported Fields:** Lead Number, Company Name, Contact Person, Project Name, Group Name, Phone, Email, GST Number, Salesperson.
- **Combined State:** Operates seamlessly alongside status tab filters, month/date range filters, and pagination.
- **Dynamic Count:** Counter badge ("Showing: X Leads") reacts in real-time to search results count.
- **Query-Specific Empty States:** Contextual messages (`No leads found for "AUM"` vs `No leads available`).

---

## 5. Role-Based Navigation & Page Maps

The application defines fine-grained page access control mapped per user role via `frontend/lib/navigationConfig.js`:

### 5.1 Sales Role — All Pages (`/sales/*`)

| Route Path | Navigation Label | Operational Purpose & Key Capabilities |
| :--- | :--- | :--- |
| `/sales/dashboard` | **Dashboard** | Sales overview, KPI metrics (leads won, conversion rates, monthly targets). |
| `/sales/daily-task` | **Daily Tasks** | List of pending lead follow-ups, scheduled calls, and customer meetings. |
| `/sales/leads` | **Leads** | CRM lead management, lead creation modal, status updates, converting won leads to customers. |
| `/sales/samples` | **Sample Management** | Raising sample requests (`SAMP-YYYY-XXXXXX`), tracking sample dispatch & testing feedback. |
| `/sales/quotations` | **Quotations** | Price quote generator (`QT-YYYY-XXXXXX`), item discount calculation, sending to client. |
| `/sales/orders` | **Orders** | Sales order booking (`SO-YYYY-XXXXXX`), document upload, order revision & amendment. |
| `/sales/production-status` | **Production Status** | Real-time tracking of work order progress on the factory floor for client updates. |
| `/sales/payment-followup` | **Payment Follow-up** | Tracking unpaid customer invoices, logging collection calls, recording customer payment proofs. |
| `/sales/customers` | **Customers** | Customer directory, credit status check (`ACTIVE`, `CREDIT_HOLD`), ledger history. |
| `/sales/reports` | **Reports** | Sales performance reports, quotation conversion rates, target achievements. |

### 5.2 Plant Head Role — All Pages (`/plant-head/*`)

| Route Path | Navigation Label | Operational Purpose & Key Capabilities |
| :--- | :--- | :--- |
| `/plant-head/dashboard` | **Dashboard** | Plant operational overview, plant load factor, active work orders, bottleneck alerts. |
| `/plant-head/daily-summary` | **Daily Summary** | Shift-wise production output summary, machine utilization, scrap percentage. |
| `/plant-head/products` | **Products** | FRP Product catalog, bill of materials (BOM), mold dimensions, target cycle times. |
| `/plant-head/categories` | **Categories** | Product categories (Cover Blocks, Manhole Covers, Gratings, Structural). |
| `/plant-head/incoming-orders` | **Incoming Orders** | Reviewing newly confirmed Sales Orders awaiting plant acceptance & scheduling. |
| `/plant-head/planning` | **Planning Board** | Master Production Scheduling (MPS), breaking orders into line-assigned Work Orders (`WO-YYYY-XXXXXX`). |
| `/plant-head/material-approvals` | **Material Approvals** | Reviewing and approving store/raw material requests raised by floor supervisors. |
| `/plant-head/indent-approvals` | **Indent Approvals** | Reviewing and approving Purchase Indents (`INDENT-YYYY-XXXXXX`) for low stock materials. |
| `/plant-head/replacements` | **Replacement Requests** | Approving client replacement/RMA requests before replacement production starts. |
| `/plant-head/production-analytics` | **Production Analytics** | Detailed analytics on plant throughput, line efficiency, downtime, scrap metrics. |
| `/plant-head/dispatch-analytics` | **Dispatch Analytics** | Shipping performance metrics, transit times, on-time delivery percentages. |
| `/plant-head/material-analytics` | **Store Analytics** | Raw material consumption rate analysis, stock turn ratio, wastage reports. |
| `/plant-head/raw-inventory` | **Raw Inventory** | Real-time stock levels of raw resins, glass fibers, polymers, and pigments. |
| `/plant-head/finished-goods` | **Finished Goods** | Ready-for-dispatch inventory audit across factory warehouses. |
| `/plant-head/qc-failures` | **QC Failures** | Monitoring batch quality rejections, root-cause analysis, approving rework orders. |
| `/plant-head/testing` | **Production Testing** | Load testing records, tensile strength test reports for FRP products. |

### 5.3 Other Key Role Page Maps Summary

- **Production Role (`/production/*`):** Dashboard, Work Orders, Incoming Orders, Material Requests, Store Releases, Production Floor execution, Completed, QC Failed & Rework, Testing, Stock, Finished Goods.
- **Store Role (`/store/*`):** Dashboard, Raw Inventory, Material Requests, Store Releases, Low Stock Alerts, Purchase Requisitions.
- **QC Role (`/qc/*`):** QC Dashboard, Pending Inspections, Inspected History.
- **Dispatch Role (`/dispatch/*`):** Dashboard, Finished Goods, Create Dispatch (Pending, New, In Transit, Delivered), Sample Dispatch, Replacement Dispatch, Remaining Dispatch, History.
- **Finance Role (`/finance/*`):** Dashboard, Salary Verification & Disbursement, Daily Tasks, Payment Verification & Receipts, Procurement PO Requests (Pending, Create, Draft, Approval, Audit, Closed), Financial Reports.
- **HR Role (`/hr/*`):** Dashboard, Employees Master, Staff Registration, Attendance & Clock-in, Leave Workflows, Exit Clearance, Salary Structure, Prepare Salary, Payslips, Payroll History, HR Notifications.
- **Admin & Super Admin Roles (`/admin/*`, `/super-admin/*`):** User/Role/Permission RBAC, Audit Logs, System Health, Sales & Production Targets, Workflow Monitor, Database Health, Backup & Restore.

---

## 6. Master Business Workflow Engines (Step-by-Step)

### 6.1 Complete Sales Order Flow

```text
LEAD_CREATED
  → CUSTOMER_CONTACTED
  → REQUIREMENT_APPROVED
  → SAMPLE_APPROVED (optional)
  → QUOTATION_APPROVED
  → SALES_ORDER_CREATED
  → CREDIT_CHECK_PASSED
  → PLANT_HEAD_ACCEPTED
  → WORK_ORDER_CREATED
  → MATERIAL_ISSUED
  → PRODUCTION_COMPLETED
  → QC_PASSED
  → FINISHED_GOODS_READY
  → DISPATCH_DELIVERED
  → INVOICE_POSTED
  → PAYMENT_VERIFIED
  → SALES_ORDER_CLOSED
```

### 6.2 Purchase Indent & Procure-to-Pay (P2P) Flow

```text
MATERIAL_REQUEST_RAISED
  → LOW_STOCK_DETECTED
  → PURCHASE_INDENT_CREATED
  → PLANT_HEAD_APPROVED
  → PO_DRAFTED
  → FINANCE_APPROVED
  → PO_ISSUED_TO_VENDOR
  → GOODS_RECEIPT_NOTE_GRN
  → INBOUND_QC_PASSED
  → STOCK_CREDITED
  → VENDOR_INVOICE_POSTED
  → VENDOR_PAYMENT_SETTLED
```

### 6.3 HR & Payroll Flow

```text
STAFF_REGISTRATION
  → EMPLOYEE_ONBOARDING
  → DAILY_ATTENDANCE_CLOCK
  → LEAVE_APPLICATION_APPROVED
  → PAYROLL_PERIOD_INITIATED
  → ATTENDANCE_CUTOFF_SUMMARY
  → PAYROLL_ADJUSTMENTS
  → SUPER_ADMIN_APPROVAL
  → SALARY_DISBURSEMENT
  → PAYSLIP_GENERATED
```

### 6.4 Material Request Flow

```text
FLOOR_MATERIAL_REQUEST
  → PLANT_HEAD_REVIEW
  → STORE_AVAILABILITY_CHECK
  ┌─────────────────────────┴─────────────────────────┐
  ▼                                                   ▼
[Stock Available]                               [Stock Low]
  │                                                   │
  ├─► Store Issue Slip Generated                      ├─► Auto-Trigger Purchase Indent
  ├─► Physical Stock Issued to Floor                ├─► Procurement P2P Flow Initiated
  └─► Raw Inventory Stock Deducted                    └─► Production Waiting / Queued
```

---

## 7. Verification & Certification Commands

```bash
# Execute Full Runtime Certification for Sales Domain
npm run certify:sales

# Execute Playwright Browser E2E Suite
npm run certify:playwright

# Execute Backend Jest E2E Suites
npm run test:backend
```

---
*Refer to workspace files [`search.service.ts`](file:///d:/prototype-next-main/backend/src/modules/search/search.service.ts), [`HeroBanner.jsx`](file:///d:/prototype-next-main/frontend/components/HeroBanner.jsx), and [`LeadsView.jsx`](file:///d:/prototype-next-main/frontend/components/LeadsView.jsx) for live code implementation.*
