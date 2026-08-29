const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

const salesComponents = [
  'components/CreateQuotation.jsx',
  'components/QuotationsView.jsx',
  'components/CreateLead.jsx',
  'components/LeadsView.jsx',
  'components/CreateOrder.jsx',
  'components/OrdersView.jsx',
  'components/CustomersView.jsx',
  'components/CreateSample.jsx',
  'components/EditSample.jsx',
  'components/SamplesView.jsx',
  'components/PaymentFollowupERPView.jsx',
  'components/PaymentHistoryView.jsx',
  'components/PaymentsView.jsx',
  'components/CustomerComplaintManagement.jsx',
  'components/DashboardView.jsx',
  'components/DailyTaskView.jsx',
  'components/SalesProductionStatusView.jsx',
  'components/ReportsView.jsx',
  'modules/sales/pages/SalesPortal.jsx',
  'modules/sales/pages/SalesOrdersView.jsx',
  'components/SalesDashboardResponsive.css',
  'components/CustomerComplaints.css',
  'components/OrdersView.module.css'
];

const results = [];

salesComponents.forEach(fileRel => {
  const full = path.join(frontendRoot, fileRel);
  if (!fs.existsSync(full)) {
    results.push({ file: fileRel, status: 'NOT FOUND' });
    return;
  }

  const content = fs.readFileSync(full, 'utf8');
  const fixedWidths = content.match(/width:\s*['"]?([4-9]\d\d|1\d\d\d+)px/g) || [];
  const minWidths = content.match(/min-width:\s*['"]?([4-9]\d\d|1\d\d\d+)px/g) || content.match(/minWidth:\s*['"]?([4-9]\d\d|1\d\d\d+)px/g) || [];
  const fixedGrids = content.match(/grid-template-columns:\s*repeat\([3-9]/g) || content.match(/gridTemplateColumns:\s*['"]repeat\([3-9]/g) || [];
  const nowrapMatches = content.match(/white-space:\s*nowrap/g) || content.match(/whiteSpace:\s*['"]nowrap['"]/g) || [];

  const hasTable = content.includes('<table') || content.includes('DataTable');
  const hasForm = content.includes('<form') || content.includes('<input') || content.includes('<select');
  const hasModal = content.includes('modal') || content.includes('Dialog') || content.includes('sheet-panel') || content.includes('drawer');

  results.push({
    file: fileRel,
    sizeBytes: fs.statSync(full).size,
    fixedWidthsCount: fixedWidths.length,
    fixedWidthsSample: fixedWidths.slice(0, 3),
    minWidthsCount: minWidths.length,
    minWidthsSample: minWidths.slice(0, 3),
    fixedGridsCount: fixedGrids.length,
    nowrapCount: nowrapMatches.length,
    hasTable,
    hasForm,
    hasModal
  });
});

console.log('=== SALES & SUPERSALES COMPONENT AUDIT ===');
results.forEach(r => {
  console.log(`${r.file.padEnd(45)} | FixedW: ${r.fixedWidthsCount} | MinW: ${r.minWidthsCount} | Grids: ${r.fixedGridsCount} | Nowrap: ${r.nowrapCount}`);
});

fs.writeFileSync(
  path.join(frontendRoot, 'sales-component-audit.json'),
  JSON.stringify(results, null, 2)
);
