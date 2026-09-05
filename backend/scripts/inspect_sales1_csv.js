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
      else if (char === ',') { row.push(cell.trim()); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell.trim());
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell.trim()); result.push(row); }
  return result;
}

const candidatePaths = [
  path.join(__dirname, 'JP_data(sales6) (1).csv'),
  path.resolve('JP_data(sales6) (1).csv'),
  path.resolve('../JP_data(sales6) (1).csv')
];
const csvPath = candidatePaths.find(p => fs.existsSync(p));
const content = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(content).slice(1).filter(r => r.length > 5 && r[0]);

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
      gstNo: (r[4] || '').trim(),
      contactPerson: (r[5] || '').trim(),
      phone: (r[6] || '').trim(),
      email: (r[8] || '').trim() || 'info@thehimalaya.co.in',
      addressStr: r[11],
      stateStr: r[12],
      cityStr: r[13],
      pincodeStr: r[14],
      items: [r]
    };
    groups.push(currentGroup);
  } else {
    currentGroup.items.push(r);
  }
}

console.log('Total item rows:', rows.length);
console.log('Total groups:', groups.length);
console.log('Total items across groups:', groups.reduce((acc, g) => acc + g.items.length, 0));

console.log('\nFirst 5 groups:');
groups.slice(0, 5).forEach((g, idx) => {
  const seqStr = String(168 + idx).padStart(4, '0');
  console.log(`[#${idx + 1}] Order: HCPPL/2627/${seqStr} | Date: ${g.date} | Customer: ${g.gstName || g.proj} | Items: ${g.items.length}`);
});

console.log('\nLast 5 groups:');
groups.slice(-5).forEach((g, idx) => {
  const actualIdx = groups.length - 5 + idx;
  const seqStr = String(168 + actualIdx).padStart(4, '0');
  console.log(`[#${actualIdx + 1}] Order: HCPPL/2627/${seqStr} | Date: ${g.date} | Customer: ${g.gstName || g.proj} | Items: ${g.items.length}`);
});
