const fs = require('fs');

const content = fs.readFileSync('d:/prototype-next-main/rushi_data(sales2) (6).csv', 'utf8');

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

const rows = parseCSV(content);
console.log('Total parsed rows:', rows.length);
console.log('Header row:', rows[0]);
const dataRows = rows.slice(1).filter(r => r[0] && r[1]);
console.log('Valid data rows:', dataRows.length);
console.log('First data row:', dataRows[0]);
console.log('Last data row:', dataRows[dataRows.length - 1]);

const uniqueProjects = new Set(dataRows.map(r => r[1]));
console.log('Unique project count:', uniqueProjects.size);
console.log('Unique projects:', Array.from(uniqueProjects));

// Check products
const productsMap = {};
for (const r of dataRows) {
  const pKey = `${r[15]} | ${r[16]} | ${r[17]}`;
  productsMap[pKey] = (productsMap[pKey] || 0) + 1;
}
console.log('Product combinations:', Object.keys(productsMap).length);
console.log(productsMap);
