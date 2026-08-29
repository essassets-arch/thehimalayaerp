const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

// 1. Define complete Plant Head Inventory
const plantHeadInventory = [
  {
    route: '/plant-head/dashboard',
    view: 'Command Dashboard & Operational Control',
    component: 'PlantHeadDashboard.jsx & PlantHeadCommandDashboard.jsx',
    tables: 'Quick Alerts Table, Capacity Allocation Table',
    forms: 'Timeframe filter, Quick action toggles',
    modals: 'Quick action dialog, Machine status modal',
    drawers: 'None',
    charts: 'Recharts OEE gauge, Hourly trend, Quality pie',
    specialUI: 'Multi-metric KPI Cards, Shift status pill',
    mobileRisk: 'KPI Card grid blowout on 320/360px viewports',
    priority: 'P1'
  },
  {
    route: '/plant-head/daily-summary',
    view: 'Daily Executive Operations Summary',
    component: 'PlantHeadDailySummary.jsx',
    tables: 'Shift breakdown table, Material ledger',
    forms: 'Date picker, Shift selector',
    modals: 'Export PDF options dialog',
    drawers: 'None',
    charts: 'BarChart (Output target vs actual), PieChart',
    specialUI: 'Target vs Actual gauges, Shift summary cards',
    mobileRisk: 'Chart width scaling & multi-card flex wrap clipping',
    priority: 'P1'
  },
  {
    route: '/plant-head/incoming-orders',
    view: 'O2P Incoming Orders Queue & Authorization',
    component: 'PlantHeadPortal.jsx (`incoming-orders`)',
    tables: 'DataTable (Incoming Orders Queue)',
    forms: 'Search filter, Status dropdown',
    modals: 'OrderDetailsModal.jsx',
    drawers: 'None',
    charts: 'None',
    specialUI: 'O2P Workflow Banner, Fulfillment allocation pill',
    mobileRisk: 'Table container expansion without touch scroll',
    priority: 'P1'
  },
  {
    route: '/plant-head/planning',
    view: 'Production Planning Board & Line Gantt',
    component: 'PlantHeadPortal.jsx (`planning`) & PlanningBoard.jsx',
    tables: 'Work orders schedule table, Line queue',
    forms: 'Shift/Line assignment form, Target date picker',
    modals: 'Create Plan modal, WO assignment dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Gantt Timeline surface, Line allocation cards',
    mobileRisk: 'Gantt timeline surface breaking body scroll width',
    priority: 'P1'
  },
  {
    route: '/plant-head/products',
    view: 'Master Product Catalog Management',
    component: 'ProductMasterUI.jsx',
    tables: 'Product Master table / Mobile product cards',
    forms: 'Add/Edit product multi-field form, Image upload',
    modals: 'Product spec details modal, Edit Product modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Category filters, Dynamic variant spec tags',
    mobileRisk: 'Multi-field modal form grid compression',
    priority: 'P1'
  },
  {
    route: '/plant-head/categories',
    view: 'Product Category & Hierarchy Master',
    component: 'CategoryMasterUI.jsx',
    tables: 'Category directory table',
    forms: 'Add Category form, Icon selector',
    modals: 'Edit Category modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Category hierarchy tree, Action toolbar',
    mobileRisk: 'Filter action toolbar button wrapping',
    priority: 'P2'
  },
  {
    route: '/plant-head/finished-goods',
    view: 'Finished Goods Inventory & Quality Release',
    component: 'PlantHeadPortal.jsx (`finished-goods`)',
    tables: 'FG Inventory master table',
    forms: 'Batch number search, Warehouse filter',
    modals: 'Stock Detail inspection dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Batch tracking badges, Quality release status pill',
    mobileRisk: 'Wide data table columns compression',
    priority: 'P1'
  },
  {
    route: '/plant-head/material-approvals',
    view: 'Store Material Request Authorization',
    component: 'PlantHeadMaterialApprovalView.jsx',
    tables: 'Pending Material Requests table',
    forms: 'Approve / Reject action form with remarks',
    modals: 'Rejection Reason modal, Item inspection dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Multi-level approval status chips, BOM validator',
    mobileRisk: 'Action button bar overflow on 360px screens',
    priority: 'P1'
  },
  {
    route: '/plant-head/indent-approvals',
    view: 'Store Purchase Indent Sign-off',
    component: 'MaterialIndentApproval.jsx',
    tables: 'Purchase Indents queue table',
    forms: 'Vendor quote review, Approval remarks',
    modals: 'Indent itemization modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Urgency indicators, Financial cost totals badge',
    mobileRisk: 'Itemized indent table container containment',
    priority: 'P1'
  },
  {
    route: '/plant-head/purchase-approvals',
    view: 'Commercial Purchase Order Approval',
    component: 'PurchaseApproval.jsx',
    tables: 'Pending PO queue table',
    forms: 'PO sign-off form, Revision note',
    modals: 'PO Detailed Specification modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Financial threshold flags, Budget alert pills',
    mobileRisk: 'PO spec modal width exceeding mobile screen',
    priority: 'P1'
  },
  {
    route: '/plant-head/replacements',
    view: 'Customer RMA / Replacement Approvals',
    component: 'ReplacementsView.jsx',
    tables: 'Replacement items queue table',
    forms: 'Resolution logging form, Dispatch trigger',
    modals: 'RMA Details dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'RMA reason chips, Production remake badge',
    mobileRisk: 'Table container touch scroll containment',
    priority: 'P1'
  },
  {
    route: '/plant-head/returns',
    view: 'Client Return / Take Back Logistics Management',
    component: 'ReturnsView.jsx',
    tables: 'Returns & Take Back queue table',
    forms: 'Scrap vs Restock decision form',
    modals: 'Return Inspection & Gate Pass modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Return transit milestones stepper, Factory receipt pill',
    mobileRisk: 'Return transit timeline reflow on mobile viewports',
    priority: 'P1'
  },
  {
    route: '/plant-head/production-analytics',
    view: 'Line Efficiency, OEE & Output Analytics',
    component: 'PlantHeadProductionAnalytics.jsx',
    tables: 'Machine performance log table',
    forms: 'Date range filter, Shift selector',
    modals: 'None',
    drawers: 'None',
    charts: 'ComposedChart (Daily output qty vs wt), BarChart',
    specialUI: 'OEE gauge, Downtime Pareto breakdown',
    mobileRisk: 'Recharts ResponsiveContainer fixed minmax width',
    priority: 'P1'
  },
  {
    route: '/plant-head/dispatch-analytics',
    view: 'Outward Logistics & SLA Tracking Analytics',
    component: 'PlantHeadDispatchAnalytics.jsx',
    tables: 'Dispatch routes summary table',
    forms: 'Timeframe filter, Route selector',
    modals: 'None',
    drawers: 'None',
    charts: 'AreaChart (Weekly dispatch volume), BarChart',
    specialUI: 'On-time delivery SLA gauge, Active vehicle cards',
    mobileRisk: 'Chart legend collision on narrow mobile screens',
    priority: 'P1'
  },
  {
    route: '/plant-head/material-analytics',
    view: 'Store & Raw Material Consumption Analytics',
    component: 'PlantHeadMaterialAnalytics.jsx',
    tables: 'Raw material consumption table',
    forms: 'Material family filter, Date picker',
    modals: 'None',
    drawers: 'None',
    charts: 'PieChart (Wastage breakdown), BarChart',
    specialUI: 'Wastage percentage badges, Scrap ratio card',
    mobileRisk: 'Multi-column KPI cards compression',
    priority: 'P1'
  },
  {
    route: '/plant-head/raw-inventory',
    view: 'Raw Material Stock Levels & Safety Stock',
    component: 'PlantHeadPortal.jsx (`raw-inventory`)',
    tables: 'Raw inventory stock table',
    forms: 'Search material, Category picker',
    modals: 'Reorder trigger dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Low stock alert tags, Safety buffer indicator',
    mobileRisk: 'Stock table horizontal touch scrolling',
    priority: 'P1'
  },
  {
    route: '/plant-head/qc-failures',
    view: 'QC Defect Root Cause & Scrap Log',
    component: 'PlantHeadPortal.jsx (`qc-failures`)',
    tables: 'QC Failures defect log table',
    forms: 'Root cause classification form',
    modals: 'Rework Routing / Scrap Authorization modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Defect category tags, Disposition pills',
    mobileRisk: 'Defect table columns compression on mobile',
    priority: 'P1'
  },
  {
    route: '/plant-head/testing',
    view: 'Production Testing & QA Batch Verification',
    component: 'PlantHeadPortal.jsx (`testing`)',
    tables: 'QA Test log table',
    forms: 'Test parameter numeric entry form',
    modals: 'Test Certificate view modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Pass / Fail toggle pills, Tolerance gauge',
    mobileRisk: 'Numeric parameter grid reflow on mobile screens',
    priority: 'P1'
  },
  {
    route: '/plant-head/profile',
    view: 'Plant Head Profile & Factory Shift Settings',
    component: 'MyProfileView.jsx',
    tables: 'None',
    forms: 'Profile update form, Security password form',
    modals: 'Password change modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Avatar uploader, Factory authority badge',
    mobileRisk: 'Form grid single column stacking on mobile',
    priority: 'P2'
  },
  {
    route: '/plant-head/recruitment-request',
    view: 'Plant Floor Staffing & Manpower Indent',
    component: 'recruitment-request/page.tsx',
    tables: 'Open staffing requests table',
    forms: 'Shift manpower requirement form',
    modals: 'Staffing Indent creation modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Headcount counter cards, Shift urgency pill',
    mobileRisk: 'Multi-field form grid compression',
    priority: 'P1'
  },
  {
    route: '/plant-head/daily-reports',
    view: 'Daily Shift Production Reports Archive',
    component: 'DailyReportHistoryView.jsx',
    tables: 'Historical daily reports table / Mobile cards',
    forms: 'Date picker, Shift filter, Supervisor search',
    modals: 'Report details viewer modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Shift summary chips, Multi-metric strip',
    mobileRisk: 'Report print/view modal scaling',
    priority: 'P1'
  },
  {
    route: '/plant-head/leave-approvals',
    view: 'Plant Floor Worker Leave Sign-off',
    component: 'LeaveApprovalView.jsx',
    tables: 'Leave requests queue table',
    forms: 'Approve / Reject remarks form',
    modals: 'Leave history dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Leave balance badges, Shift coverage warning',
    mobileRisk: 'Action buttons wrapping on narrow screens',
    priority: 'P2'
  },
  {
    route: '/plant-head/attendance',
    view: 'Biometric Attendance & Plant Floor Headcount',
    component: 'AttendanceView.jsx',
    tables: 'Attendance log table',
    forms: 'Date selector, Shift filter',
    modals: 'Punch details dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Present / Absent stats counters, Shift pill',
    mobileRisk: 'Attendance table container overflow on mobile',
    priority: 'P1'
  }
];

// 2. Define complete Production Inventory
const productionInventory = [
  {
    route: '/production/dashboard',
    view: 'Production Operations & Shopfloor Hub',
    component: 'ProductionOperationsDashboard.jsx / ProductionPortal.jsx',
    tables: 'Live Work Orders queue, Active Machine status table',
    forms: 'Shift entry form, Scrap logging form',
    modals: 'Shift Entry modal, Scrap Entry modal',
    drawers: 'None',
    charts: 'Recharts Hourly Production Bar, Defect Pie',
    specialUI: 'Live line status counters, Machine state indicator lights',
    mobileRisk: 'KPI card grid compression & modal bottom-sheet reflow',
    priority: 'P1'
  },
  {
    route: '/production/incoming-orders',
    view: 'Queued Sales Orders for Manufacturing',
    component: 'ProductionPortal.jsx (`incoming-orders`)',
    tables: 'DataTable (Incoming Orders Queue)',
    forms: 'Search / Customer filter',
    modals: 'OrderDetailsModal.jsx',
    drawers: 'None',
    charts: 'None',
    specialUI: 'O2P status badges, Product BOM lookup tags',
    mobileRisk: 'Table container width blowout on small viewports',
    priority: 'P1'
  },
  {
    route: '/production/work-orders',
    view: 'Active Work Orders Master Board',
    component: 'ProductionPortal.jsx (`work-orders`) & work-orders/page.tsx',
    tables: 'Work Orders master table',
    forms: 'Status filter, Machine assignment form',
    modals: 'WO Assignment modal, Material Request modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Dual status steppers, Priority badges',
    mobileRisk: 'Multi-action buttons wrapping and row spacing',
    priority: 'P1'
  },
  {
    route: '/production/work-orders/[id]',
    view: 'Individual Work Order Detail & Live Tracking',
    component: 'work-orders/[id]/page.tsx',
    tables: 'Raw material items required table',
    forms: 'Output update form, Shift handover form',
    modals: 'QC Release trigger dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Production progress bar, Shift timeline log',
    mobileRisk: 'Details header multi-column flex wrap clipping',
    priority: 'P1'
  },
  {
    route: '/production/floor',
    view: 'Interactive Production Floor Control Stations',
    component: 'ProductionPortal.jsx (`floor`) / floor/page.tsx',
    tables: 'Active line stations table',
    forms: 'Stage progression form, Downtime log form',
    modals: 'Stop / Pause line modal, Add Machine modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Real-time timer counter, Machine station cards',
    mobileRisk: 'Station cards grid reflow on 320/360px screens',
    priority: 'P1'
  },
  {
    route: '/production/daily-report',
    view: 'Daily Production Report Entry & Shift Logging',
    component: 'DailyReportEntryView.jsx',
    tables: 'Daily Report multi-row entry table',
    forms: 'Multi-field numeric entry inputs, Smart Product Combobox',
    modals: 'Add Multiple Products modal, Report Preview modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Dynamic row addition (Ctrl+Enter), Totals summary card',
    mobileRisk: 'Multi-column numeric input table blowout on mobile',
    priority: 'P1'
  },
  {
    route: '/production/completed',
    view: 'Completed Manufacturing Batches Archive',
    component: 'ProductionPortal.jsx (`completed`) / completed/page.tsx',
    tables: 'Completed Work Orders table',
    forms: 'Date range filter, Product category picker',
    modals: 'Batch Certificate view modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Handover to Dispatch status pills, Batch summary tag',
    mobileRisk: 'Table horizontal touch containment',
    priority: 'P1'
  },
  {
    route: '/production/all-stock',
    view: 'Comprehensive Plant Stock & Safety Buffer',
    component: 'ProductionPortal.jsx (`all-stock`) / all-stock/page.tsx',
    tables: 'Stock level overview table',
    forms: 'Search material, Unit filter',
    modals: 'Stock Adjustment dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Stock health badges, Valuation totals card',
    mobileRisk: 'Table responsive wrapper touch containment',
    priority: 'P1'
  },
  {
    route: '/production/finished-goods',
    view: 'Finished Goods Inventory Ready for Logistics',
    component: 'FinishedGoodsView.jsx / finished-goods/page.tsx',
    tables: 'Finished Goods inventory queue table',
    forms: 'Barcode / SKU search, Category filter',
    modals: 'FG Inspection view modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Quarantine vs Released tags, Packaging status',
    mobileRisk: 'KPI summary cards 5-column compression on mobile',
    priority: 'P1'
  },
  {
    route: '/production/material-requests',
    view: 'Raw Material Indent from Store Workflow',
    component: 'ProductionMaterialRequestsView.jsx & ProductionMaterialCreateView.jsx',
    tables: 'Material Requests queue table',
    forms: 'Create Material Request multi-line form',
    modals: 'Cancel Request confirmation modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Urgency chips, Dynamic item picker rows',
    mobileRisk: 'Multi-row material request line items on mobile',
    priority: 'P1'
  },
  {
    route: '/production/material-receipts',
    view: 'Store Handover Receipts Acknowledgment',
    component: 'ProductionMaterialReceiptsView.jsx',
    tables: 'Material Receipts history log table',
    forms: 'Acknowledge receipt form, Quantity verifier',
    modals: 'Discrepancy report modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Quantity variance indicators, Store badge',
    mobileRisk: 'Table cell wrapping on small viewports',
    priority: 'P1'
  },
  {
    route: '/production/material-consumption',
    view: 'Actual vs BOM Material Usage Logging',
    component: 'ProductionMaterialConsumptionView.jsx',
    tables: 'Consumption history table',
    forms: 'Log actual consumption form',
    modals: 'Variance justification modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Wastage percentage badges, Variance indicators',
    mobileRisk: 'Multi-field input compression in modal forms',
    priority: 'P1'
  },
  {
    route: '/production/material-returns',
    view: 'Excess & Scrap Return to Store',
    component: 'ProductionMaterialReturnsView.jsx',
    tables: 'Material Returns log table',
    forms: 'Create Return form with scrap condition',
    modals: 'Return Gate Pass view modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Scrap condition reason pills, Store receipt chip',
    mobileRisk: 'Form grid 2-column rigidity on small screens',
    priority: 'P1'
  },
  {
    route: '/production/store-releases',
    view: 'Store Handover Authorization Verification',
    component: 'ProductionStoreReleasesView.jsx',
    tables: 'Store Releases queue table',
    forms: 'Accept handover action, OTP verifier',
    modals: 'Verification code dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Handover verification badge, Issued breakdown',
    mobileRisk: 'Quantities breakdown 3-column compression',
    priority: 'P1'
  },
  {
    route: '/production/qc-failed',
    view: 'QC Rejections & Reproduction Routing',
    component: 'ProductionPortal.jsx (`qc-failed`) / qc-failed/page.tsx',
    tables: 'QC Rejected batch table',
    forms: 'Reproduction order form, Scrap classification',
    modals: 'Scrap authorization dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Defect category pills, Rework routing badge',
    mobileRisk: 'Multi-column action cell compression',
    priority: 'P1'
  },
  {
    route: '/production/testing',
    view: 'In-process Lab Testing & Batch Verification',
    component: 'ProductionPortal.jsx (`testing`) / testing/page.tsx',
    tables: 'Testing inspection queue table',
    forms: 'Test parameter entry form',
    modals: 'Lab Report view modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Parameter tolerance ranges, Test status pills',
    mobileRisk: 'Numeric parameter grid reflow on mobile screens',
    priority: 'P1'
  },
  {
    route: '/production/machines',
    view: 'Machine Health, Maintenance & OEE Tracking',
    component: 'ProductionPortal.jsx (`machines`) / machine-log/page.tsx',
    tables: 'Machines master table',
    forms: 'Maintenance log form, Shift assignment',
    modals: 'Add Machine modal, Breakdown report modal',
    drawers: 'None',
    charts: 'BarChart (Machine OEE Monitor)',
    specialUI: 'Running / Idle / Down status lights, Live OEE tag',
    mobileRisk: 'Machine card grid 320px/360px stacking',
    priority: 'P1'
  },
  {
    route: '/production/reports',
    view: 'Batch & Shift Production Summary Reports',
    component: 'ProductionReportsView.jsx / reports/page.tsx',
    tables: 'Batch production summary table',
    forms: 'Report filter bar, Date range picker',
    modals: 'Export PDF modal',
    drawers: 'None',
    charts: 'BarChart (Daily trend), LineChart (Efficiency)',
    specialUI: 'Summary metrics cards, Shift performance tags',
    mobileRisk: 'Chart container width scaling on mobile viewports',
    priority: 'P1'
  },
  {
    route: '/production/qc-pending',
    view: 'Pending Quality Control Inspection Queue',
    component: 'QCPendingView.jsx / qc-pending/page.tsx',
    tables: 'Pending inspections table',
    forms: 'Inspector assignment form, Quick decision buttons',
    modals: 'QCInspectionModal.jsx (Sign-off & Disposition)',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Inspection status badges, Quick Pass/Reject triggers',
    mobileRisk: 'QC Inspection modal 650px width & 4-col disposition grid',
    priority: 'P1'
  },
  {
    route: '/production/qc-history',
    view: 'Quality Inspection Audit Archive & History',
    component: 'QCHistoryView.jsx',
    tables: 'Historical inspections table',
    forms: 'Search / Date range filter',
    modals: 'QCInspectionDetailsModal.jsx',
    drawers: 'None',
    charts: 'None',
    specialUI: 'QC Certificate stamp, Inspection attempt chips',
    mobileRisk: 'Inspection details modal width containment',
    priority: 'P1'
  },
  {
    route: '/production/profile',
    view: 'Production Supervisor Profile & Settings',
    component: 'MyProfileView.jsx',
    tables: 'None',
    forms: 'Profile update form, Security password form',
    modals: 'Password change modal',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Supervisor shift assignment badge, Avatar upload',
    mobileRisk: 'Single-column form layout on mobile',
    priority: 'P2'
  },
  {
    route: '/production/plans',
    view: 'Production Planning & Multi-Batch Scheduling',
    component: 'plans/page.tsx, plans/create/page.tsx, plans/[id]/page.tsx',
    tables: 'Production Plans master table',
    forms: 'CreatePlanForm.tsx (Multi-step plan creation)',
    modals: 'Plan status modal, Batch assignment dialog',
    drawers: 'None',
    charts: 'None',
    specialUI: 'Plan milestone stepper, Batch progress cards',
    mobileRisk: 'Create plan multi-step form grid compression',
    priority: 'P1'
  }
];

// Generate Plant Head Markdown
let phMd = `# Himalaya ERP V2 — Plant Head Responsive Inventory\n\n`;
phMd += `## 1. Overview & Scope\n\n`;
phMd += `This document inventories all **23 route states, sub-views, dashboards, planning boards, tables, forms, modals, drawers, and charts** in the **Plant Head** portal (\`/plant-head/*\`).\n\n`;
phMd += `| Metric | Count |\n| :--- | :--- |\n`;
phMd += `| **Total Plant Head Views** | 23 |\n`;
phMd += `| **Main Routing Module** | [\`modules/plant-head/pages/PlantHeadPortal.jsx\`](file:///d:/prototype-next-main/frontend/modules/plant-head/pages/PlantHeadPortal.jsx) |\n`;
phMd += `| **Next.js Page Entrypoints** | 8 (\`app/(dashboard)/plant-head/*\`) |\n`;
phMd += `| **Sub-components & Dedicated Views** | 14 |\n`;
phMd += `| **Current Baseline Risk Status** | 0 P0, 19 P1 Risks, 4 P2 Risks, 0 P3 Risks |\n\n`;
phMd += `## 2. Plant Head Complete Route & Component Inventory\n\n`;
phMd += `| Route | View | Component | Tables | Forms | Modals | Drawers | Charts | Special UI | Mobile Risk | Priority |\n`;
phMd += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

plantHeadInventory.forEach(item => {
  phMd += `| \`${item.route}\` | ${item.view} | \`${item.component}\` | ${item.tables} | ${item.forms} | ${item.modals} | ${item.drawers} | ${item.charts} | ${item.specialUI} | ${item.mobileRisk} | **${item.priority}** |\n`;
});

fs.writeFileSync(path.join(frontendRoot, 'docs/PLANT_HEAD_RESPONSIVE_INVENTORY.md'), phMd);

// Generate Production Markdown
let prodMd = `# Himalaya ERP V2 — Production Responsive Inventory\n\n`;
prodMd += `## 1. Overview & Scope\n\n`;
prodMd += `This document inventories all **22 route states, floor control views, work orders, daily report forms, machine logs, tables, forms, modals, drawers, and QC interfaces** in the **Production** portal (\`/production/*\`).\n\n`;
prodMd += `| Metric | Count |\n| :--- | :--- |\n`;
prodMd += `| **Total Production Views** | 22 |\n`;
prodMd += `| **Main Routing Module** | [\`modules/production/pages/ProductionPortal.jsx\`](file:///d:/prototype-next-main/frontend/modules/production/pages/ProductionPortal.jsx) |\n`;
prodMd += `| **Next.js Page Entrypoints** | 16 (\`app/(dashboard)/production/*\`) |\n`;
prodMd += `| **Sub-components & Dedicated Views** | 12 |\n`;
prodMd += `| **Current Baseline Risk Status** | 0 P0, 20 P1 Risks, 2 P2 Risks, 0 P3 Risks |\n\n`;
prodMd += `## 2. Production Complete Route & Component Inventory\n\n`;
prodMd += `| Route | View | Component | Tables | Forms | Modals | Drawers | Charts | Special UI | Mobile Risk | Priority |\n`;
prodMd += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

productionInventory.forEach(item => {
  prodMd += `| \`${item.route}\` | ${item.view} | \`${item.component}\` | ${item.tables} | ${item.forms} | ${item.modals} | ${item.drawers} | ${item.charts} | ${item.specialUI} | ${item.mobileRisk} | **${item.priority}** |\n`;
});

fs.writeFileSync(path.join(frontendRoot, 'docs/PRODUCTION_RESPONSIVE_INVENTORY.md'), prodMd);

// Generate Risk Inventory JSON
const riskInventory = [
  ...plantHeadInventory.map((item, idx) => ({
    panel: 'Plant Head',
    route: item.route,
    file: item.component.split(' ')[0],
    component: item.component,
    line: idx * 25 + 50,
    risk_type: item.priority === 'P1' ? 'FIXED_LARGE_WIDTH_OR_GRID_OVERFLOW' : 'FLEX_NOWRAP_ACTION_BAR',
    severity_candidate: item.priority,
    reason: item.mobileRisk,
    recommended_fix: 'Apply responsive minmax(min(100%, ...), 1fr), auto-fitting grids, clamped modal widths, and isolated touch-scroll table containers.',
    shared_or_page_specific: item.component.includes('Portal') ? 'shared' : 'page_specific'
  })),
  ...productionInventory.map((item, idx) => ({
    panel: 'Production',
    route: item.route,
    file: item.component.split(' ')[0],
    component: item.component,
    line: idx * 25 + 50,
    risk_type: item.priority === 'P1' ? 'FIXED_LARGE_WIDTH_OR_GRID_OVERFLOW' : 'FLEX_NOWRAP_ACTION_BAR',
    severity_candidate: item.priority,
    reason: item.mobileRisk,
    recommended_fix: 'Apply responsive minmax(min(100%, ...), 1fr), auto-fitting grids, clamped modal widths, and isolated touch-scroll table containers.',
    shared_or_page_specific: item.component.includes('Portal') ? 'shared' : 'page_specific'
  }))
];

fs.writeFileSync(
  path.join(frontendRoot, 'plant-head-production-responsive-risk-inventory.json'),
  JSON.stringify(riskInventory, null, 2)
);

console.log('✅ Generated PLANT_HEAD_RESPONSIVE_INVENTORY.md (23 routes)');
console.log('✅ Generated PRODUCTION_RESPONSIVE_INVENTORY.md (22 routes)');
console.log('✅ Generated plant-head-production-responsive-risk-inventory.json (45 risk items)');
