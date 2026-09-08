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
  // Strip frame depth e.g. 600X600X32 -> 600X600
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  
  let c = (capacity || '').trim().toUpperCase();
  if (c === '3T') c = 'LD'; // 3T is Light Duty (3 Tonne)
  
  return { t, s, c };
}

function findProduct(type, size, capacity, products) {
  const { t, s, c } = normalizeProductParams(type, size, capacity);
  
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

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true }
  });
  console.log(`Total active products in DB: ${products.length}`);

  const salesUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'sales1@himalayaerp.com' },
        { name: { contains: 'Sales 1', mode: 'insensitive' } }
      ]
    }
  });
  console.log('Sales 1 User in DB:', salesUser?.id, salesUser?.name, salesUser?.email, salesUser?.role);

  const content = fs.readFileSync('d:/prototype-next-main/JP_data(sales1) (1).csv', 'utf8');
  const rows = parseCSV(content).slice(1);

  const unmatched = [];
  const matched = [];

  for (const r of rows) {
    const type = r[15];
    const size = r[16];
    const cap = r[17];
    const p = findProduct(type, size, cap, products);
    if (!p) {
      unmatched.push({ type, size, cap });
    } else {
      matched.push({ type, size, cap, matchedSku: p.sku, matchedName: p.name });
    }
  }

  console.log(`Matched: ${matched.length}, Unmatched: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('Unmatched items:', unmatched);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
