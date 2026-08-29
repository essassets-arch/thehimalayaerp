const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

const scanDirs = [
  path.join(frontendRoot, 'app/(dashboard)/plant-head'),
  path.join(frontendRoot, 'app/(dashboard)/production'),
  path.join(frontendRoot, 'modules/plant-head'),
  path.join(frontendRoot, 'modules/production'),
  path.join(frontendRoot, 'components/material-workflow'),
];

function getAllFiles(dir, exts = ['.jsx', '.tsx', '.js', '.ts', '.css']) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(full, exts));
    } else if (exts.includes(path.extname(item))) {
      files.push(full);
    }
  }
  return files;
}

let allFiles = [];
scanDirs.forEach(d => {
  allFiles = allFiles.concat(getAllFiles(d));
});

// Also check components that might be specific to plant-head or production
const extraComponents = [
  'PlantHeadCommandDashboard.jsx',
  'ProductionOperationsDashboard.jsx',
  'CategoryMasterUI.jsx',
  'ProductMasterUI.jsx',
  'OrderDetailsModal.jsx',
  'Timeline.jsx',
  'PlanningBoard.jsx',
  'BrandAnalysisViewModal.jsx',
  'O2PWorkflowBanner.jsx'
].map(c => path.join(frontendRoot, 'components', c)).filter(fs.existsSync);

allFiles = allFiles.concat(extraComponents);
const uniqueFiles = Array.from(new Set(allFiles));

console.log(`Total files to scan: ${uniqueFiles.length}`);

const riskPatterns = [
  { id: 'FIXED_LARGE_WIDTH', name: 'Fixed pixel width >= 400px', regex: /(?:width|minWidth|maxWidth)\s*:\s*['"`]?([4-9]\d{2}|\d{4,})px/g, severity: 'P1' },
  { id: 'HARDCODED_MODAL_WIDTH', name: 'Hardcoded modal width without clamp/min', regex: /(?:modal|dialog|popup|sheet)[^{]*\{[^}]*(?:width\s*:\s*['"]?[4-9]\d{2}px)/gi, severity: 'P1' },
  { id: 'FIXED_TABLE_NOWRAP', name: 'Fixed table or nowrap without scroll container', regex: /(?:<table[^>]*style={{[^}]*width:\s*['"]?\d{3,}px)|(?:whiteSpace:\s*['"]nowrap['"](?![^}]*overflow))/g, severity: 'P1' },
  { id: 'RIGID_GRID_COLS', name: 'Rigid grid columns (e.g., grid-cols-4+ or 1fr 1fr 1fr)', regex: /gridTemplateColumns\s*:\s*['"`](?:1fr\s+1fr\s+1fr|repeat\([3-9],\s*1fr\))['"`]/g, severity: 'P2' },
  { id: 'FLEX_NOWRAP_OVERFLOW', name: 'Flex without wrap on action bar or filter', regex: /(?:display:\s*['"]flex['"][^}]*flexWrap:\s*['"]nowrap['"])|(?:className=["'][^"']*flex\s+nowrap)/g, severity: 'P2' },
  { id: 'UNCONTAINED_GANTT_TIMELINE', name: 'Gantt or Timeline wide board without responsive container', regex: /(?:gantt|planning-board|timeline-board|timeline-row)[^{]*\{[^}]*(?:width:\s*['"]?\d{3,}px)/gi, severity: 'P1' },
  { id: 'INLINE_OVERFLOW_HIDDEN', name: 'Overflow hidden cutting off responsive content', regex: /overflow\s*:\s*['"]hidden['"]/g, severity: 'P3' }
];

const riskReport = [];

uniqueFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(frontendRoot, file).replace(/\\/g, '/');
  const fileRisks = [];

  riskPatterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(content)) !== null) {
      // Find line number
      const lineNum = content.substring(0, match.index).split('\n').length;
      fileRisks.push({
        id: pattern.id,
        name: pattern.name,
        severity: pattern.severity,
        line: lineNum,
        snippet: match[0].substring(0, 80)
      });
    }
  });

  if (fileRisks.length > 0) {
    riskReport.push({
      file: relPath,
      totalRisks: fileRisks.length,
      risks: fileRisks
    });
  }
});

fs.writeFileSync(
  path.join(frontendRoot, 'plant-head-production-responsive-risk-inventory.json'),
  JSON.stringify(riskReport, null, 2)
);

console.log(`Scan complete. ${riskReport.length} files with responsive risks identified.`);
const severityCounts = { P0: 0, P1: 0, P2: 0, P3: 0 };
riskReport.forEach(fr => {
  fr.risks.forEach(r => {
    severityCounts[r.severity] = (severityCounts[r.severity] || 0) + 1;
  });
});
console.log('Severity counts:', severityCounts);
