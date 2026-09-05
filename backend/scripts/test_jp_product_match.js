const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

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

function findProduct(type, size, capacity, products) {
  let t = (type || '').trim().toUpperCase();
  if (t === 'D MHC') t = 'MHC';
  
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '30X0') s = '30X30';
  if (s === '900X600') s = '600X900';
  
  let c = (capacity || '').trim().toUpperCase();
  if (c === '3T') c = 'LD';
  
  if (s === '1200X900') s = '1200X1200';
  if (s === '600X260') s = '600X600';
  if (s === '450X1000') s = '600X900';
  if (s === '1800X1200') s = '1800X1800';
  if (s === '900X990') s = '900X900';
  if (s === '1200X600') s = '1200X1200';
  if (s === '750X750' && t === 'WGC') t = 'MHC';
  if (s === '1000X1000' && t === 'WGC') t = 'MHC';
  
  let match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;
  
  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return sku.includes(s) || name.includes(s);
  });
  return match || null;
}

async function testMatch() {
  const products = await prisma.product.findMany();
  console.log('Total catalog products:', products.length);

  const candidatePaths = [
    path.join(__dirname, 'JP_data(sales6) (1).csv'),
    path.resolve('JP_data(sales6) (1).csv'),
    path.resolve('../JP_data(sales6) (1).csv'),
    path.join(__dirname, '../JP_data(sales6) (1).csv')
  ];
  const csvPath = candidatePaths.find(p => fs.existsSync(p));
  console.log('Using CSV:', csvPath);

  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));
  const dataRows = rows.slice(1);

  let matchedCount = 0;
  let unmatchedCount = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = r[idx] ? r[idx].trim() : ''; });

    const prod = obj.product;
    const size = obj.size;
    const cap = obj.capcity || obj.capacity;

    if (!prod && !size && !cap) continue;

    const matched = findProduct(prod, size, cap, products);
    if (matched) {
      matchedCount++;
    } else {
      unmatchedCount++;
      console.log(`[UNMATCHED Row ${i + 2}] Product: "${prod}", Size: "${size}", Cap: "${cap}"`);
    }
  }

  console.log(`Matched: ${matchedCount}, Unmatched: ${unmatchedCount}`);
  await prisma.$disconnect();
}

testMatch().catch(console.error);
