# Himalaya ERP V2 — HR & Payroll Responsive Inventory

## 1. Overview & Scope

This document inventories all **7 route states, HR dashboard, employee directory, attendance, leaves, recruitment, salary/payslips, and role management** across **HR** (`/hr/*`).

| Route | View | Main Component | Tables | Forms | Modals | Drawers | Charts | Special UI | Responsive Risk | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/hr/dashboard` | HR Command Center & Headcount Overview | `HRDashboard.jsx` | Today Attendance Summary Table, Pending Leaves Table | Department filter, Shift selector | Quick Employee Check-in modal | None | BarChart (Department Headcount), PieChart (Attendance %) | Active Headcount Counters, Present/Absent Split Pill | KPI Card grid compression & chart legend collision on 320/360px | **P1** |
| `/hr/employees` | Employee Directory & Master Record | `EmployeeMasterView.jsx` | Employee Master Directory Table | Employee search, Department dropdown, Status toggle | Add Employee modal, Employee Profile Details dialog | None | None | Designation Chip, Department Color Tag, Avatar Badge | Multi-column Add Employee form grid in modal | **P1** |
| `/hr/attendance` | Biometric Attendance & Shift Logs | `AttendanceMasterView.jsx` | Daily Biometric Attendance Logs Table | Date selector, Shift picker, Overtime filter | Manual Attendance Correction modal | None | None | Biometric Sync Status, Shift Timings Tag | Wide multi-column table without touch-scroll containment | **P1** |
| `/hr/leaves` | Leave Requests, Quotas & Approvals | `LeaveManagementView.jsx` | Leave Applications Queue Table | Leave Type selector, Employee search, Status filter | Leave Approval / Rejection dialog | None | None | Leave Balance Chips, Medical Certificate Attachment Tag | Action button bar wrapping & row spacing on narrow screens | **P1** |
| `/hr/recruitment` | Recruitment, Vacancies & Candidate Tracking | `RecruitmentView.jsx` | Open Job Positions Table, Candidate Applications Table | Department filter, Interview status selector | Candidate Interview Schedule modal | None | None | Hiring Pipeline Stepper, Candidate Score Badge | Table container width blowout on small viewports | **P1** |
| `/hr/salary` | Salary Structure, Payroll Calculation & Payslips | `SalaryPortal.jsx` | Employee Salary Structure & Net Pay Table | Month / Year selector, CTC structure builder form | Generate Payslip modal, Salary Breakdown viewer | None | BarChart (Payroll Cost per Dept) | PF / ESI / TDS Deduction Summary Pill, Gross Pay Card | Dense 5-column metric strip compression on 320px | **P1** |
| `/hr/roles` | Role Management & RBAC Permissions Matrix | `RoleManagementView.jsx` | System Roles & Permissions Matrix Table | Role search, Module permission toggles | Create New Role modal, Permission Preset dialog | None | None | Role Badge, Access Scope Chips (Read/Write/Admin) | Permission checkboxes table horizontal touch containment | **P1** |
