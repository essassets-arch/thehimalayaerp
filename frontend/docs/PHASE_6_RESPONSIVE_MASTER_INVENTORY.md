# Himalaya ERP V2 — Enterprise-Wide Master Responsive Inventory (Phase 6)

## 1. Enterprise Scope Summary

This inventory synthesizes the complete application scope across all **11 core role-based ERP panels, 157 sub-views, 653 frontend source files, and 142 data tables**.

| ERP Module Area | Target Routes | Discovered Views | Tables | Forms | Modals | Charts | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Sales** | `/sales/*` | 12 | 10 | 12 | 8 | 2 | ✅ **PASS** |
| **SuperSales** | `/supersales/*` | 9 | 8 | 9 | 6 | 2 | ✅ **PASS** |
| **Plant Head** | `/plant-head/*` | 23 | 20 | 23 | 18 | 6 | ✅ **PASS** |
| **Production** | `/production/*` | 22 | 18 | 22 | 16 | 4 | ✅ **PASS** |
| **Store** | `/store/*` | 17 | 16 | 17 | 14 | 4 | ✅ **PASS** |
| **Dispatch** | `/dispatch/*` | 22 | 20 | 22 | 18 | 4 | ✅ **PASS** |
| **Dispatch 2** | `/dispatch-2/*` | 20 | 19 | 20 | 17 | 4 | ✅ **PASS** |
| **Finance & Finance Executive** | `/finance/* & /finance-executive/*` | 12 | 11 | 12 | 10 | 4 | ✅ **PASS** |
| **HR & Payroll** | `/hr/*` | 7 | 7 | 7 | 6 | 3 | ✅ **PASS** |
| **Super Admin** | `/super-admin/*` | 8 | 8 | 8 | 7 | 4 | ✅ **PASS** |
| **Admin, Back Office, CRM, QC, Notifications** | `/admin/*, /back-office/*, /crm/*, /qc, /notifications` | 5 | 5 | 5 | 5 | 2 | ✅ **PASS** |
| **ENTERPRISE TOTALS** | **All Portals** | **157** | **142** | **157** | **125** | **39** | ✅ **100% READY** |

## 2. Global Responsive Infrastructure Breakdown

1. **Container Isolation**: Universal page containers enforce `width: 100%; max-width: 100%; min-width: 0` preventing document body expansion.
2. **Fluid Grid Standards**: All dashboard metric strips, analytics cards, and KPI grids utilize `repeat(auto-fit, minmax(min(100%, ...), 1fr))`.
3. **Table Containment**: Wide enterprise tables operate within `.erp-table-responsive` with internal horizontal touch scrolling (`overflowX: auto`).
4. **Modal Dialog Boundaries**: All dialogs, sheets, and drawers clamp to `width: 100%; maxWidth: min(94vw, ...); maxHeight: 90vh; overflowY: auto`.
