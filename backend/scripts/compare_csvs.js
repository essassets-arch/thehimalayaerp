const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else { cell += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(cell); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell);
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell); result.push(row); }
  return result;
}

const f1 = fs.readFileSync(path.resolve(__dirname, '../../hussain-fresh.csv'), 'utf8');
const f2 = fs.readFileSync(path.resolve(__dirname, 'hussain_sir(super_sales1) (6).csv'), 'utf8');

const r1 = parseCSV(f1).slice(1).filter(r => r.some(c => c && c.trim()));
const r2 = parseCSV(f2).slice(1).filter(r => r.length > 5 && r[0]);

function groupRows(rows) {
  const groups = [];
  let currentGroup = null;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const date = (r[0] || '').trim();
    const proj = (r[1] || '').trim();
    const grp = (r[2] || '').trim();
    const gstName = (r[3] || '').trim();
    const key = date + '|' + proj + '|' + grp + '|' + gstName;

    if (!currentGroup || currentGroup.key !== key) {
      currentGroup = {
        index: groups.length + 1,
        key,
        date,
        proj,
        grp,
        gstName,
        items: [r]
      };
      groups.push(currentGroup);
    } else {
      currentGroup.items.push(r);
    }
  }
  return groups;
}

const g1 = groupRows(r1);
const g2 = groupRows(r2);

console.log('hussain-fresh.csv groups:', g1.length);
console.log('hussain_sir(super_sales1) (6).csv groups:', g2.length);

for (let i = 0; i < Math.max(g1.length, g2.length); i++) {
  const k1 = g1[i]?.key;
  const k2 = g2[i]?.key;
  if (k1 !== k2) {
    console.log(`Mismatch at index ${i + 1}:`);
    console.log(' g1:', k1);
    console.log(' g2:', k2);
    break;
  }
}
