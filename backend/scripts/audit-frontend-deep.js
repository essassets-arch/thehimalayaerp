const fs = require('fs');
const path = require('path');

const frontendDir = 'd:/prototype-next-main/frontend';
const subdirs = ['app', 'components', 'lib', 'services', 'store', 'shared', 'modules', 'hooks', 'engine'];

const targetExts = ['.ts', '.tsx', '.js', '.jsx'];
const keywords = [
  'localStorage',
  'sessionStorage',
  'mockData',
  'mockDB',
  'mockStorage',
  'mock',
  'fallback',
  'dummy',
  'fake',
];

const occurrences = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDir(fullPath);
      }
    } else if (targetExts.includes(path.extname(entry.name).toLowerCase())) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        for (const kw of keywords) {
          if (line.toLowerCase().includes(kw.toLowerCase())) {
            let classification = 'Manual review required';
            if (kw === 'localStorage' || kw === 'sessionStorage') {
              if (line.includes('theme') || line.includes('sidebar') || line.includes('ui')) {
                classification = 'UI preference';
              } else if (line.includes('token') || line.includes('auth') || line.includes('user')) {
                classification = 'Authentication/session';
              } else {
                classification = 'Form draft';
              }
            } else if (fullPath.includes('test') || fullPath.includes('spec') || fullPath.includes('scripts')) {
              classification = 'Test only';
            } else if (fullPath.includes('legacy') || fullPath.includes('old') || line.includes('deprecated')) {
              classification = 'Deprecated';
            } else if (line.includes('fallback') || line.includes('mockData')) {
              classification = 'Dangerous production business state';
            }

            occurrences.push({
              file: path.relative('d:/prototype-next-main', fullPath).replace(/\\/g, '/'),
              line: lineNum,
              keyword: kw,
              code: line.trim(),
              classification,
            });
            break; // one match per line
          }
        }
      });
    }
  }
}

for (const sub of subdirs) {
  scanDir(path.join(frontendDir, sub));
}

console.log(`Found ${occurrences.length} occurrences across frontend codebase.`);

const docDir = 'd:/prototype-next-main/docs/phase-e-plus';
if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });

const classificationCounts = {};
occurrences.forEach((o) => {
  classificationCounts[o.classification] = (classificationCounts[o.classification] || 0) + 1;
});

const report = `# 15 — Frontend LocalStorage, SessionStorage & Mock State Deep Audit

## 1. Executive Summary

- **Total Frontend Files Scanned**: All \`.ts\`, \`.tsx\`, \`.js\`, \`.jsx\` under \`frontend/\` (\`app\`, \`components\`, \`lib\`, \`services\`, \`store\`, \`shared\`, \`modules\`, \`hooks\`, \`engine\`).
- **Total Occurrences Found**: \`${occurrences.length}\` occurrences.

---

## 2. Classification Summary

| Classification Category | Occurrences | Risk Level | Description |
| :--- | :---: | :---: | :--- |
| **Authentication/session** | ${classificationCounts['Authentication/session'] || 0} | **LOW** | Local storage for auth JWT & refresh tokens |
| **UI preference** | ${classificationCounts['UI preference'] || 0} | **LOW** | Dark/light mode theme & sidebar collapse state |
| **Form draft** | ${classificationCounts['Form draft'] || 0} | **LOW** | Client form auto-save drafts |
| **Test only** | ${classificationCounts['Test only'] || 0} | **LOW** | Jest/React testing library mock fixtures |
| **Deprecated** | ${classificationCounts['Deprecated'] || 0} | **MEDIUM** | Unused legacy store helpers |
| **Dangerous production business state** | ${classificationCounts['Dangerous production business state'] || 0} | **HIGH** | Hardcoded fallback business arrays in production pages |
| **Manual review required** | ${classificationCounts['Manual review required'] || 0} | **MEDIUM** | Miscellaneous mock utility references |

---

## 3. Complete Itemized Occurrence List

| File Path | Line | Keyword | Code Snippet | Classification |
| :--- | :---: | :---: | :--- | :--- |
${occurrences.slice(0, 100).map((o) => `| [\`${o.file}\`](file:///${o.file}#L${o.line}) | L${o.line} | \`${o.keyword}\` | \`${o.code.substring(0, 60).replace(/\|/g, '\\|')}\` | **${o.classification}** |`).join('\n')}

*(Note: Truncated to top 100 occurrences for document length. Complete itemized dataset stored in \`frontend-audit-results.json\`)*
`;

fs.writeFileSync(path.join(docDir, '15-FRONTEND-STORAGE-MOCK-AUDIT.md'), report);
fs.writeFileSync(path.join(docDir, 'frontend-audit-results.json'), JSON.stringify(occurrences, null, 2));
console.log('Saved docs/phase-e-plus/15-FRONTEND-STORAGE-MOCK-AUDIT.md');
