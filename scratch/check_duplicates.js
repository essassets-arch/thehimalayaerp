const fs = require('fs');

const raw = fs.readFileSync(__dirname + '/raw_full_user_request.txt', 'utf8');
const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

const nameCounts = new Map();
let total = 0;
let m;
while ((m = fullRowRegex.exec(raw)) !== null) {
  total++;
  let cleanName = m[2].trim().replace(/\s+/g, ' ').replace(/^HIMLAYA\b/i, 'HIMALAYA');
  nameCounts.set(cleanName.toUpperCase(), (nameCounts.get(cleanName.toUpperCase()) || 0) + 1);
}

console.log('Total rows in user prompt:', total);
console.log('Unique product names in user prompt:', nameCounts.size);

const duplicates = [];
for (const [name, count] of nameCounts.entries()) {
  if (count > 1) duplicates.push({ name, count });
}
console.log('Number of duplicate product names:', duplicates.length);
console.log('Sample duplicates:', duplicates.slice(0, 15));
