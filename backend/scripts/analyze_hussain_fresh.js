const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../../hussain-fresh.csv');
const content = fs.readFileSync(csvPath, 'utf8');

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

const rows = parseCSV(content).slice(1).filter(r => r.some(c => c && c.trim()));

const groups = [];
let currentGroup = null;

for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const date = (r[0] || '').trim();
  const proj = (r[1] || '').trim();
  const grp = (r[2] || '').trim();
  const gstName = (r[3] || '').trim();
  const gstNo = (r[4] || '').trim();
  const key = date + '|' + proj + '|' + grp + '|' + gstName;

  if (!currentGroup || currentGroup.key !== key) {
    currentGroup = {
      index: groups.length + 1,
      key,
      date,
      proj,
      grp,
      gstName,
      gstNo,
      siteIncharge: (r[5] || '').trim(),
      phone: (r[6] || '').trim(),
      email: (r[8] || '').trim(),
      address: (r[11] || '').trim(),
      state: (r[12] || '').trim(),
      city: (r[13] || '').trim(),
      pincode: (r[14] || '').trim(),
      items: [r]
    };
    groups.push(currentGroup);
  } else {
    currentGroup.items.push(r);
  }
}

console.log('Total grouped leads/orders in hussain-fresh.csv:', groups.length);
console.log('Total items across groups:', groups.reduce((acc, g) => acc + g.items.length, 0));
console.log('Sample group 1 items count:', groups[0].items.length);
console.log('Sample group 2 items count:', groups[1].items.length);
console.log('Sample group 3 (Tasneem) items count:', groups[2].items.length);
