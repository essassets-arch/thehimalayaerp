const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

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

function normalizeProductParams(type, size, capacity) {
  let t = (type || '').trim().toUpperCase();
  if (t === 'D MHC') t = 'MHC';
  
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '450X600') s = '600X450';
  
  let c = (capacity || '').trim().toUpperCase();
  if (c === '3T') c = 'LD';
  
  return { t, s, c };
}

function findProduct(type, size, capacity, products) {
  const { t, s, c } = normalizeProductParams(type, size, capacity);
  
  let match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;
  
  match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return sku.includes(s) || name.includes(s);
  });
  return match || null;
}

async function testMatch() {
  const products = await prisma.product.findMany({ where: { isActive: true } });
  console.log(`Loaded ${products.length} products from DB.`);

  const content = fs.readFileSync('d:/prototype-next-main/rushi_data(sales2) (6).csv', 'utf8');
  const rows = parseCSV(content).slice(1).filter(r => r[0] && r[1]);

  let matched = 0;
  let unmatched = [];

  for (const r of rows) {
    const type = r[15];
    const size = r[16];
    const cap = r[17];
    const p = findProduct(type, size, cap, products);
    if (p) {
      matched++;
    } else {
      unmatched.push({ type, size, cap, row: r[1] });
    }
  }

  console.log(`Matched: ${matched}/${rows.length}`);
  if (unmatched.length > 0) {
    console.log('Unmatched:', unmatched);
  }
}

testMatch().catch(console.error).finally(() => prisma.$disconnect());
