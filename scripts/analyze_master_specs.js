const fs = require('fs');

const raw = fs.readFileSync(__dirname + '/../scratch/raw_full_user_request.txt', 'utf8');

// Lines in raw
const lines = raw.split(/\r?\n/).filter(Boolean);
console.log('Total non-empty lines in raw:', lines.length);

const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS|DMHC)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

const compBySize = {};
let m;
while ((m = fullRowRegex.exec(raw)) !== null) {
  let [_, strayNum, rawName, col1, col2, col3] = m;
  let cleanName = rawName.trim().replace(/\s+/g, ' ').replace(/^HIMLAYA\b/i, 'HIMALAYA');
  const parts = cleanName.split(' ');
  const type = parts[2]; // WGC, MHC, ONGC, RCS
  const size = parts[3]; // e.g. 300X300, 600X600, 900X900, 1200X1200
  const covers = parseInt(col1, 10);
  const frames = parseInt(col2, 10);

  const key = `${type} ${size}`;
  if (!compBySize[key]) {
    compBySize[key] = new Set();
  }
  compBySize[key].add(`${covers}C + ${frames}F`);
}

console.log('Summary of composition by Product Type and Size in user master specs:');
for (const [k, v] of Object.entries(compBySize)) {
  console.log(`${k.padEnd(20)}: ${Array.from(v).join(', ')}`);
}
