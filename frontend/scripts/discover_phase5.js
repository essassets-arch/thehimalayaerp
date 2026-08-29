const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

function getFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFiles(full));
    } else if (/\.(jsx?|tsx?|css)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const targetDirs = [
  'app/(dashboard)/finance',
  'app/(dashboard)/finance-executive',
  'app/(dashboard)/hr',
  'app/(dashboard)/employee',
  'app/(dashboard)/super-admin',
  'app/(dashboard)/admin',
  'app/(dashboard)/back-office',
  'app/(dashboard)/crm',
  'app/(dashboard)/qc',
  'app/(dashboard)/notifications',
  'app/(dashboard)/orders',
  'modules/finance',
  'modules/finance-executive',
  'modules/hr',
  'modules/salary',
  'modules/super-admin',
  'modules/admin',
  'modules/back-office',
  'modules/purchase',
  'modules/notifications',
  'modules/sales-admin'
];

let allPhase5Files = [];
targetDirs.forEach(d => {
  const p = path.join(frontendRoot, d);
  allPhase5Files.push(...getFiles(p));
});

console.log('Total Phase 5 files found:', allPhase5Files.length);

function scanFileRisks(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const risks = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    
    // Large minmax in gridTemplateColumns
    if (/minmax\(\s*(?:3[3-9]\d|[4-9]\d{2}|\d{4,})px/i.test(line) && !line.includes('min(100%')) {
      risks.push({
        line: lineNum,
        type: 'RIGID_GRID_MINMAX',
        code: line.trim(),
        severity: 'P1',
        reason: 'Large fixed minmax in grid causes horizontal page blowout on mobile.'
      });
    }

    // repeat(N, 1fr) with N >= 3
    if (/repeat\(\s*[3-9]\s*,\s*1fr\s*\)/i.test(line) && !line.includes('auto-fit') && !line.includes('auto-fill')) {
      risks.push({
        line: lineNum,
        type: 'FIXED_MULTI_COLUMN_GRID',
        code: line.trim(),
        severity: 'P1',
        reason: 'Fixed multi-column grid (> 2 cols) causes child element compression on mobile viewports.'
      });
    }

    // Hardcoded modal width
    if (/(?:width|maxWidth)\s*:\s*['"](?:4[5-9]\d|[5-9]\d{2}|\d{4,})px['"]/i.test(line) && !line.includes('min(') && !line.includes('100%') && !line.includes('calc(')) {
      risks.push({
        line: lineNum,
        type: 'HARDCODED_MODAL_OR_CONTAINER_WIDTH',
        code: line.trim(),
        severity: 'P1',
        reason: 'Hardcoded pixel width > 450px on modal/card causes mobile viewport clipping.'
      });
    }

    // minWidth on tables without horizontal scroll wrapper
    if (/minWidth\s*:\s*['"](?:[6-9]\d{2}|\d{4,})px['"]/i.test(line)) {
      risks.push({
        line: lineNum,
        type: 'WIDE_TABLE_MIN_WIDTH',
        code: line.trim(),
        severity: 'P1',
        reason: 'Wide table requires explicit .erp-table-responsive container to prevent body scroll.'
      });
    }
  });

  return risks;
}

let totalRisks = 0;
let fileRisksMap = {};

allPhase5Files.forEach(f => {
  const rel = path.relative(frontendRoot, f);
  const fileRisks = scanFileRisks(f);
  if (fileRisks.length > 0) {
    fileRisksMap[rel] = fileRisks;
    totalRisks += fileRisks.length;
  }
});

console.log('Files with responsive risks in Phase 5:', Object.keys(fileRisksMap).length);
console.log('Total static risk candidates found in Phase 5:', totalRisks);

fs.writeFileSync(
  path.join(frontendRoot, 'phase5-discovery-raw.json'),
  JSON.stringify({ files: allPhase5Files.map(f => path.relative(frontendRoot, f)), risks: fileRisksMap }, null, 2)
);
