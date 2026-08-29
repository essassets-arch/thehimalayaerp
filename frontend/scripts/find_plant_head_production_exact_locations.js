const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

function scanFileExact(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const findings = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Check minmax >= 320px without min(100%, ...)
    if (/minmax\(\s*(?:3[2-9]\d|[4-9]\d{2}|\d{4,})px/i.test(line) && !line.includes('min(100%')) {
      findings.push({ line: lineNum, issue: 'Large minmax in grid column', text: line.trim() });
    }
    // Check fixed 1fr 1fr or 3+ cols
    if (/gridTemplateColumns:\s*['"`](?:1fr\s+1fr\s+1fr|1\.2fr|repeat\([2-9],\s*1fr\))['"`]/i.test(line)) {
      findings.push({ line: lineNum, issue: 'Multi-column fixed grid', text: line.trim() });
    }
    // Check fixed width modals
    if (/width:\s*['"`]?(?:[4-9]\d{2}|\d{4,})px/i.test(line) && (line.includes('modal') || line.includes('dialog') || line.includes('popup') || line.includes('card'))) {
      findings.push({ line: lineNum, issue: 'Fixed modal/card width', text: line.trim() });
    }
    // Check tables with fixed width
    if (/<table[^>]*style={{[^}]*width:\s*['"`]?\d{3,}px/i.test(line)) {
      findings.push({ line: lineNum, issue: 'Fixed width table', text: line.trim() });
    }
  });

  return findings;
}

const targetFiles = [
  'modules/plant-head/pages/PlantHeadPortal.jsx',
  'modules/plant-head/pages/PlantHeadDashboard.jsx',
  'modules/plant-head/pages/PlantHeadDailySummary.jsx',
  'modules/plant-head/pages/PlantHeadProductionAnalytics.jsx',
  'modules/plant-head/pages/PlantHeadDispatchAnalytics.jsx',
  'modules/plant-head/pages/PlantHeadMaterialAnalytics.jsx',
  'modules/plant-head/pages/PurchaseApproval.jsx',
  'modules/plant-head/pages/ReplacementsView.jsx',
  'modules/plant-head/pages/ReturnsView.jsx',
  'modules/production/pages/ProductionPortal.jsx',
  'modules/production/components/DailyReportEntryView.jsx',
  'modules/production/components/DailyReportHistoryView.jsx',
  'modules/production/components/DailyReportPrintView.jsx',
  'modules/production/components/FinishedGoodsView.jsx',
  'modules/production/components/ProductionReportsView.jsx',
  'modules/production/components/qc/QCDashboardView.jsx',
  'modules/production/components/qc/QCHistoryView.jsx',
  'modules/production/components/qc/QCInspectionDetailsModal.jsx',
  'modules/production/components/qc/QCInspectionModal.jsx',
  'modules/production/components/qc/QCPendingView.jsx',
  'components/material-workflow/PlantHeadMaterialApprovalView.jsx',
  'components/material-workflow/ProductionMaterialCreateView.jsx',
  'components/material-workflow/ProductionMaterialRequestsView.jsx',
  'components/material-workflow/ProductionMaterialReceiptsView.jsx',
  'components/material-workflow/ProductionMaterialConsumptionView.jsx',
  'components/material-workflow/ProductionMaterialReturnsView.jsx',
  'components/material-workflow/ProductionStoreReleasesView.jsx',
  'components/PlantHeadCommandDashboard.jsx',
  'components/ProductionOperationsDashboard.jsx',
  'components/CategoryMasterUI.jsx',
  'components/ProductMasterUI.jsx',
  'components/OrderDetailsModal.jsx'
];

targetFiles.forEach(rel => {
  const full = path.join(frontendRoot, rel);
  if (fs.existsSync(full)) {
    const res = scanFileExact(full);
    if (res.length > 0) {
      console.log(`\n📄 ${rel} (${res.length} issues)`);
      res.forEach(r => console.log(`  Line ${r.line}: [${r.issue}] ${r.text.substring(0, 90)}`));
    }
  }
});
