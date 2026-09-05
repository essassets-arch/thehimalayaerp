const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const lines = content.replace(/\r/g, '').split('\n');
  const rows = [];
  let inQuotes = false, currentCell = '', currentRow = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') { currentCell += '"'; c++; }
        else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    if (!inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += '\n';
    }
  }
  return rows;
}

const csvPath = [
  path.resolve('taher_sir(super_sales2) (3).csv'),
  path.resolve('backend/scripts/taher_sir(super_sales2) (3).csv')
].find(p => fs.existsSync(p));

const content = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(content).slice(1).filter(r => r.length > 5 && r[0]);

console.log('Total item rows in SS2 CSV:', rows.length);

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

console.log('Total distinct grouped orders/leads for SuperSales 2:', groups.length);
let totalItems = 0;
groups.forEach((g, i) => {
  totalItems += g.items.length;
  console.log(`${i + 1}. Date: ${g.date} | Customer: "${g.gstName || g.proj}" | Items: ${g.items.length} | Contact: ${g.contactPerson} (${g.phone})`);
});
console.log('Total line items across all groups:', totalItems);
