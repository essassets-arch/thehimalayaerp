const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

function findProduct(prodType, prodSize, prodCap, allProducts) {
  let t = (prodType || '').toUpperCase().trim();
  if (t === 'D MHC') t = 'MHC';

  let s = (prodSize || '').toUpperCase().trim().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '30X0') s = '30X30';
  if (s === '900X600') s = '600X900';
  
  let c = (prodCap || '').toUpperCase().trim();
  if (c === '3T') c = 'LD';

  let match = allProducts.find(p => {
    const name = (p.name || '').toUpperCase();
    const sku = (p.sku || '').toUpperCase();
    return (name.includes(t) || sku.includes(t)) &&
           (name.includes(s) || sku.includes(s)) &&
           (name.includes(c) || sku.includes(c));
  });

  if (!match) {
    // Fallback 1: match by size and capacity
    match = allProducts.find(p => {
      const name = (p.name || '').toUpperCase();
      const sku = (p.sku || '').toUpperCase();
      return (name.includes(s) || sku.includes(s)) &&
             (name.includes(c) || sku.includes(c));
    });
  }

  if (!match) {
    // Fallback 2: match by type and size
    match = allProducts.find(p => {
      const name = (p.name || '').toUpperCase();
      const sku = (p.sku || '').toUpperCase();
      return (name.includes(t) || sku.includes(t)) &&
             (name.includes(s) || sku.includes(s));
    });
  }

  if (!match) {
    // Fallback 3: match by size
    match = allProducts.find(p => {
      const name = (p.name || '').toUpperCase();
      const sku = (p.sku || '').toUpperCase();
      return name.includes(s) || sku.includes(s);
    });
  }

  return match || allProducts[0];
}

async function analyze() {
  const content = fs.readFileSync('d:/prototype-next-main/jesal.csv', 'utf8');
  const rows = parseCSV(content);
  const dataRows = rows.slice(1).filter(r => r.length > 3 && r[0] && r[1]);
  console.log('Total valid item rows:', dataRows.length);

  const groups = [];
  let currentGroup = null;
  for (const r of dataRows) {
    const date = r[0];
    const proj = r[1];
    const grp = r[2];
    const gstName = r[3];
    const key = date + '|' + proj + '|' + grp + '|' + gstName;
    if (!currentGroup || currentGroup.key !== key) {
      currentGroup = { key, date, proj, grp, gstName, items: [r] };
      groups.push(currentGroup);
    } else {
      currentGroup.items.push(r);
    }
  }
  console.log('Total distinct groups:', groups.length);

  const products = await prisma.product.findMany();
  console.log('Total DB products:', products.length);

  let unmapped = 0;
  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const type = r[15];
    const size = r[16];
    const cap = r[17];
    const match = findProduct(type, size, cap, products);
    if (!match) {
      console.log(`Row ${i + 1} unmapped:`, { type, size, cap, row: r });
      unmapped++;
    }
  }
  console.log('Unmapped items:', unmapped);
}

analyze().catch(console.error).finally(() => prisma.$disconnect());
