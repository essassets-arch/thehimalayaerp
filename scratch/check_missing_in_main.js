const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prismaMain = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' } } });

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

function findExactProduct(type, size, capacity, products) {
  let t = (type || '').trim().toUpperCase();
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  let baseS = s;
  if (s.match(/^\d+X\d+X\d+$/)) {
    baseS = s.substring(0, s.lastIndexOf('X'));
  }

  let c = (capacity || '').trim().toUpperCase();

  // 1. Strict exact match on type + size + capacity
  let match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    const prodSize = (p.size || '').toUpperCase().replace(/\s+/g, '');
    const prodCap = (p.capacity || '').toUpperCase();

    const typeMatch = sku.includes(t) || name.includes(t);
    const sizeMatch = prodSize === s || prodSize === baseS || sku.includes(s) || sku.includes(baseS) || name.includes(s) || name.includes(baseS);
    const capMatch = prodCap === c || sku.includes(c) || name.includes(c);
    return typeMatch && sizeMatch && capMatch;
  });
  if (match) return match;

  // 2. Secondary fallback
  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) && (sku.includes(s) || name.includes(s));
  });
  return match || null;
}

(async () => {
  const products = await prismaMain.product.findMany();
  console.log('Main DB product count:', products.length);

  const csvPath = 'd:/prototype-next-main/backend/scripts/hussain-fresh.csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content).slice(1);

  const missing = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const product = (r[15] || '').trim();
    const size = (r[16] || '').trim();
    const capacity = (r[17] || '').trim();

    if (!product && !size && !capacity) continue;

    const matched = findExactProduct(product, size, capacity, products);
    if (!matched) {
      missing.push({ row: i + 2, product, size, capacity, rate: r[20] });
    }
  }

  console.log('Missing items in Main DB:', missing.length);
  const uniqueMissing = [];
  const seen = new Set();
  for (const m of missing) {
    const k = `${m.product}|${m.size}|${m.capacity}`;
    if (!seen.has(k)) {
      seen.add(k);
      uniqueMissing.push(m);
    }
  }
  console.log('Unique missing in Main DB:', uniqueMissing);

  await prismaMain.$disconnect();
})();
