const fs = require('fs');

const products = JSON.parse(fs.readFileSync('scratch-products.json', 'utf8'));

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
        if (nextChar === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell);
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell);
        if (row.length > 1 || row[0] !== '') {
          result.push(row);
        }
        row = [];
        cell = '';
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        cell += char;
      }
    }
  }
  
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    result.push(row);
  }
  
  return result;
}

function findProduct(type, size, capacity, products) {
  let t = type.trim().toUpperCase();
  if (t === 'D MHC') t = 'MHC';
  
  let s = size.trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '30X0') s = '30X30';
  if (s === '900X600') s = '600X900'; // Normalise order of size dimensions
  
  let c = capacity.trim().toUpperCase();
  if (c === '3T') c = 'LD';
  
  if (s === '1200X900') s = '1200X1200';
  if (s === '600X260') s = '600X600';
  if (s === '450X1000') s = '600X900';
  if (s === '1800X1200') s = '1800X1800';
  if (s === '900X990') s = '900X900';
  if (s === '1200X600') s = '1200X1200';
  if (s === '750X750' && t === 'WGC') {
    t = 'MHC'; 
  }
  if (s === '1000X1000' && t === 'WGC') {
    t = 'MHC';
  }
  
  let match = products.find(p => {
    const sku = p.sku.toUpperCase();
    const name = p.name.toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;
  
  match = products.find(p => {
    const sku = p.sku.toUpperCase();
    const name = p.name.toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = p.sku.toUpperCase();
    const name = p.name.toUpperCase();
    return (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = p.sku.toUpperCase();
    const name = p.name.toUpperCase();
    return sku.includes(s) || name.includes(s);
  });
  return match || null;
}

function run() {
  const csvPath = 'd:\\prototype-next-main\\hussain_sir(super_sales1) (2).csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const headers = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);
  
  let totalValid = 0;
  let unmatchedCount = 0;
  
  for (let idx = 0; idx < dataRows.length; idx++) {
    const row = dataRows[idx];
    if (row.length < headers.length) continue;
    
    const rowObj = {};
    headers.forEach((h, i) => {
      rowObj[h] = row[i] ? row[i].trim() : '';
    });
    
    if (!rowObj.project_name && !rowObj.PRODUCT && !rowObj.SIZE) continue;
    
    totalValid++;
    const prodType = rowObj.PRODUCT || '';
    const size = rowObj.SIZE || '';
    const capacity = rowObj.CAPCITY || '';
    
    const matched = findProduct(prodType, size, capacity, products);
    if (!matched) {
      unmatchedCount++;
      console.log(`Unmatched Row #${idx}: ${prodType} | ${size} | ${capacity}`);
    }
  }
  
  console.log(`Processed ${totalValid} rows. Unmatched: ${unmatchedCount}`);
}

run();
