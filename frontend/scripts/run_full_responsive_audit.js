const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

// Read existing inventory data
const routeInventoryPath = path.join(frontendRoot, 'responsive-route-inventory.json');
const riskInventoryPath = path.join(frontendRoot, 'responsive-risk-inventory.json');

let routeInventory = {};
let riskInventory = {};

if (fs.existsSync(routeInventoryPath)) {
  routeInventory = JSON.parse(fs.readFileSync(routeInventoryPath, 'utf8'));
}
if (fs.existsSync(riskInventoryPath)) {
  riskInventory = JSON.parse(fs.readFileSync(riskInventoryPath, 'utf8'));
}

const panelsList = [
  { name: 'Super Admin', prefix: '/super-admin', role: 'SUPER_ADMIN' },
  { name: 'Admin', prefix: '/admin', role: 'ADMIN' },
  { name: 'Plant Head', prefix: '/plant-head', role: 'PLANT_HEAD' },
  { name: 'Production', prefix: '/production', role: 'PRODUCTION' },
  { name: 'Store', prefix: '/store', role: 'STORE' },
  { name: 'Quality Control', prefix: '/qc', role: 'QC' },
  { name: 'Dispatch', prefix: '/dispatch', role: 'DISPATCH' },
  { name: 'Dispatch 2', prefix: '/dispatch-2', role: 'DISPATCH_2' },
  { name: 'Sales', prefix: '/sales', role: 'SALES' },
  { name: 'SuperSales', prefix: '/supersales', role: 'SUPER_SALES' },
  { name: 'Finance', prefix: '/finance', role: 'FINANCE' },
  { name: 'Finance Executive', prefix: '/finance-executive', role: 'FINANCE_EXECUTIVE' },
  { name: 'Human Resources', prefix: '/hr', role: 'HR' },
  { name: 'Back Office', prefix: '/back-office', role: 'BACK_OFFICE' },
  { name: 'CRM', prefix: '/crm', role: 'SALES' },
  { name: 'Orders', prefix: '/orders', role: 'SHARED' },
  { name: 'Employee', prefix: '/employee', role: 'EMPLOYEE' },
  { name: 'Notifications', prefix: '/notifications', role: 'ALL' }
];

const viewports = [
  { name: 'Mobile 320', width: 320, height: 568, category: 'Mobile (Small)' },
  { name: 'Mobile 360', width: 360, height: 800, category: 'Mobile (Standard Android)' },
  { name: 'Mobile 390', width: 390, height: 844, category: 'Mobile (iPhone 12/13/14)' },
  { name: 'Mobile 412', width: 412, height: 915, category: 'Mobile (Large Android)' },
  { name: 'Tablet 600', width: 600, height: 960, category: 'Tablet (Small / 7-inch)' },
  { name: 'Tablet 768', width: 768, height: 1024, category: 'Tablet (iPad Portrait)' },
  { name: 'Tablet 1024', width: 1024, height: 768, category: 'Tablet (iPad Landscape)' },
  { name: 'Desktop 1280', width: 1280, height: 720, category: 'Desktop (HD)' },
  { name: 'Desktop 1440', width: 1440, height: 900, category: 'Desktop (Standard Laptop)' },
  { name: 'Desktop 1920', width: 1920, height: 1080, category: 'Desktop (FHD Monitor)' }
];

// Scan all components in a page/route to identify responsive issues
function analyzeRoute(panel, routePath, pageFile) {
  const fullPagePath = pageFile ? path.join(frontendRoot, pageFile) : null;
  let code = '';
  if (fullPagePath && fs.existsSync(fullPagePath)) {
    code = fs.readFileSync(fullPagePath, 'utf8');
  }

  // Find related module/component files
  const relatedFiles = [];
  if (fullPagePath) relatedFiles.push(pageFile);

  const routeClean = routePath.replace(/^\//, '').split('/')[0];
  const moduleDir = path.join(frontendRoot, 'modules', routeClean);
  if (fs.existsSync(moduleDir)) {
    // Read all files in moduleDir
    const getFiles = (dir) => {
      fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && !e.name.startsWith('.')) getFiles(p);
        else if (e.isFile() && (e.name.endsWith('.jsx') || e.name.endsWith('.tsx') || e.name.endsWith('.css'))) {
          relatedFiles.push(path.relative(frontendRoot, p).replace(/\\/g, '/'));
        }
      });
    };
    getFiles(moduleDir);
  }

  // Aggregate code from related files
  let totalCode = code;
  relatedFiles.forEach(f => {
    const full = path.join(frontendRoot, f);
    if (fs.existsSync(full)) {
      totalCode += '\n' + fs.readFileSync(full, 'utf8');
    }
  });

  const issues = [];
  let severity = 'PASS';

  // Check 1: Fixed large width
  const fixedLargeMatches = totalCode.match(/width:\s*([4-9]\d\d|1\d\d\d+)px/g) || [];
  const minWidthMatches = totalCode.match(/min-width:\s*([4-9]\d\d|1\d\d\d+)px/g) || [];
  if (minWidthMatches.length > 0) {
    issues.push({
      type: 'OVERFLOW_RISK',
      severity: 'P1',
      details: `Contains ${minWidthMatches.length} instances of fixed min-width >= 400px (e.g., ${minWidthMatches.slice(0, 2).join(', ')}) causing mobile viewport horizontal overflow.`,
      fix: 'Replace fixed min-width with responsive min-w-0, w-full, or wrap inside an overflow-x-auto container.'
    });
  }

  // Check 2: Table without horizontal scroll container
  const hasTable = totalCode.includes('<table') || totalCode.includes('DataTable') || totalCode.includes('TabulatorTable') || totalCode.includes('SharedPaymentTable');
  const hasTableScroll = totalCode.includes('overflow-x-auto') || totalCode.includes('overflowX: "auto"') || totalCode.includes('overflowX: \'auto\'') || totalCode.includes('table-responsive') || totalCode.includes('scroll-area');
  
  if (hasTable && !hasTableScroll) {
    issues.push({
      type: 'TABLE_RESPONSIVE',
      severity: 'P1',
      details: 'Large data table lacks an explicit responsive scroll container (`overflow-x-auto`), causing wide tables to clip or expand page width on mobile viewports.',
      fix: 'Enclose table in a container with `overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%;` and apply mobile card reflow for primary columns where appropriate.'
    });
  }

  // Check 3: Multi-column grid without mobile collapse
  const fixedGridMatches = totalCode.match(/grid-template-columns:\s*repeat\([3-9]/g) || totalCode.match(/grid-cols-[3-9]/g) || [];
  const responsiveGridMatches = totalCode.match(/grid-cols-1\s+(?:sm|md|lg):grid-cols-/g) || totalCode.match(/@media\s*\(max-width/g) || [];
  if (fixedGridMatches.length > 0 && responsiveGridMatches.length === 0) {
    issues.push({
      type: 'GRID_RESPONSIVE',
      severity: 'P2',
      details: `Grid layout defines ${fixedGridMatches.length} multi-column structures without responsive collapse for screen widths below 640px.`,
      fix: 'Use `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` or `@media(max-width: 640px) { grid-template-columns: 1fr; }`.'
    });
  }

  // Check 4: Modal width issues
  const hasModal = totalCode.includes('modal') || totalCode.includes('Dialog') || totalCode.includes('sheet-panel') || totalCode.includes('erp-modal');
  const modalFixedMatches = totalCode.match(/width:\s*['"]?(?:6\d\d|7\d\d|8\d\d|9\d\d|1\d\d\d)px/g) || [];
  if (hasModal && modalFixedMatches.length > 0) {
    issues.push({
      type: 'MODAL_RESPONSIVE',
      severity: 'P1',
      details: `Modal/dialog component uses fixed desktop width (e.g. ${modalFixedMatches.slice(0, 2).join(', ')}), causing overflow on screens <= 412px.`,
      fix: 'Set `width: min(92vw, [desktopWidth]px); max-height: 90vh; overflow-y: auto; margin: auto;`'
    });
  }

  // Check 5: Form inputs in multi-column flex without wrapping
  const hasForm = totalCode.includes('<form') || totalCode.includes('<input') || totalCode.includes('<select');
  const nowrapFlex = totalCode.includes('display: flex') && !totalCode.includes('flex-wrap') && !totalCode.includes('flex-direction: column');
  if (hasForm && nowrapFlex && totalCode.includes('gap:')) {
    issues.push({
      type: 'FORM_RESPONSIVE',
      severity: 'P2',
      details: 'Form input rows or filter action bars do not specify `flex-wrap: wrap`, risking button/field push-out on narrow viewports.',
      fix: 'Add `flex-wrap: wrap` or stack inputs in a single column on `< 640px`.'
    });
  }

  // Calculate overall severity
  if (issues.some(i => i.severity === 'P0')) severity = 'FAIL (P0)';
  else if (issues.some(i => i.severity === 'P1')) severity = 'FAIL (P1)';
  else if (issues.some(i => i.severity === 'P2')) severity = 'WARNING (P2)';
  else if (issues.some(i => i.severity === 'P3')) severity = 'WARNING (P3)';
  else severity = 'PASS';

  return {
    panel: panel.name,
    route: routePath,
    pageFile: pageFile || 'Dynamic Catch-All / Module Render',
    hasTable,
    hasForm,
    hasModal,
    hasChart: totalCode.includes('Chart') || totalCode.includes('ResponsiveContainer'),
    issues,
    severity,
    status: severity.startsWith('PASS') ? 'PASS' : (severity.startsWith('WARNING') ? 'WARNING' : 'FAIL')
  };
}

// Run audit for all routes
const auditResults = [];

// Add all navigation routes
if (routeInventory.navPanels) {
  Object.keys(routeInventory.navPanels).forEach(panelKey => {
    const items = routeInventory.navPanels[panelKey];
    items.forEach(item => {
      if (!item.path) return;
      const matchedFs = (routeInventory.fsRoutes || []).find(r => r.route === item.path || item.path.startsWith(r.route.replace('/[[...slug]]', '')));
      const pageFile = matchedFs ? matchedFs.pageFile : null;
      auditResults.push(analyzeRoute({ name: panelKey }, item.path, pageFile));
    });
  });
}

// Add remaining standalone Next.js routes not in nav
if (routeInventory.fsRoutes) {
  routeInventory.fsRoutes.forEach(fsR => {
    if (!auditResults.some(a => a.route === fsR.route)) {
      const panel = panelsList.find(p => fsR.route.startsWith(p.prefix)) || { name: 'Shared / Standalone' };
      auditResults.push(analyzeRoute(panel, fsR.route, fsR.pageFile));
    }
  });
}

console.log('Total audited routes:', auditResults.length);
const p0Count = auditResults.filter(r => r.severity.includes('P0')).length;
const p1Count = auditResults.filter(r => r.severity.includes('P1')).length;
const p2Count = auditResults.filter(r => r.severity.includes('P2')).length;
const p3Count = auditResults.filter(r => r.severity.includes('P3')).length;
const passCount = auditResults.filter(r => r.status === 'PASS').length;
const failCount = auditResults.filter(r => r.status === 'FAIL').length;
const warnCount = auditResults.filter(r => r.status === 'WARNING').length;

console.log(`PASS: ${passCount} | WARNING: ${warnCount} | FAIL: ${failCount}`);
console.log(`P0: ${p0Count} | P1: ${p1Count} | P2: ${p2Count} | P3: ${p3Count}`);

fs.writeFileSync(
  path.join(frontendRoot, 'responsive-audit-results.json'),
  JSON.stringify(auditResults, null, 2)
);

console.log('Wrote responsive-audit-results.json successfully.');
