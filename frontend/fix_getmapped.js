const fs = require('fs');
const path = 'd:/prototype-next/modules/store/pages/StorePortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the corrupted getMappedInventory region
// The bad line is:  const def = defaults[item.material]defaults[item.material]:...
// followed by a duplicate of the defaults object up to line ~155

const corruptedStr = `      const def = defaults[item.material]defaults[item.material]: { code: 'RM001', category: 'Cement', rate: 150, reorderLevel: 1000, description: 'High grade cement clinker.' },\r\n        'Gypsum Raw': { code: 'RM002', category: 'Additive', rate: 220, reorderLevel: 200, description: 'Raw gypsum additive.' },\r\n        'River Sand': { code: 'RM003', category: 'Aggregate', rate: 800, reorderLevel: 100, description: 'Fine-grain clean river sand.' },\r\n        'Coarse Aggregate 20mm': { code: 'RM004', category: 'Aggregate', rate: 1200, reorderLevel: 120, description: 'Coarse aggregate 20mm.' },\r\n        'Fine Aggregate 10mm': { code: 'RM005', category: 'Aggregate', rate: 1000, reorderLevel: 150, description: 'Fine aggregate 10mm.' },\r\n        'Superplasticizer Admixture': { code: 'RM006', category: 'Chemical', rate: 1500, reorderLevel: 500, description: 'Liquid chemical concrete admixture.' },\r\n        'Waterproofing Compound': { code: 'RM007', category: 'Chemical', rate: 2500, reorderLevel: 100, description: 'Liquid waterproofing chemical.' }\r\n      };\r\n      const def = defaults[item.material] || {`;

const fixedStr = `      const def = defaults[item.material] || {`;

if (content.includes(corruptedStr)) {
  content = content.replace(corruptedStr, fixedStr);
  fs.writeFileSync(path, content);
  console.log('getMappedInventory corruption fixed!');
} else {
  console.log('Corrupted string not found exactly. Trying line-by-line approach...');
  // Find index of the bad line
  const lines = content.split('\n');
  const badLineIdx = lines.findIndex(l => l.includes("const def = defaults[item.material]defaults[item.material]"));
  if (badLineIdx === -1) {
    console.log('Bad line not found');
    process.exit(1);
  }
  console.log('Found bad line at index:', badLineIdx);
  // Remove lines badLineIdx through badLineIdx+9 (the duplicate defaults block + "const def = defaults...")
  // and replace with single correct line
  const before = lines.slice(0, badLineIdx);
  const after = lines.slice(badLineIdx + 9);
  const fixed = [...before, "      const def = defaults[item.material] || {", ...after];
  fs.writeFileSync(path, fixed.join('\n'));
  console.log('Fixed via line removal!');
}
