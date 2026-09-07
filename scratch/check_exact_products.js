const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

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

const content = fs.readFileSync('backend/scripts/hussain-fresh.csv', 'utf8');
const rows = parseCSV(content).slice(1).filter(r => r.length > 15 && r[0] && r[15]);

const distinctCsvProducts = new Map();
rows.forEach(r => {
  const type = (r[15] || '').trim().toUpperCase();
  const size = (r[16] || '').trim().toUpperCase();
  const cap = (r[17] || '').trim().toUpperCase();
  const key = `${type}|${size}|${cap}`;
  if (!distinctCsvProducts.has(key)) {
    distinctCsvProducts.set(key, { type, size, cap, count: 0, rows: [] });
  }
  const item = distinctCsvProducts.get(key);
  item.count++;
});

console.log(`Total item rows: ${rows.length}`);
console.log(`Distinct CSV products: ${distinctCsvProducts.size}`);

(async () => {
  const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });
  const dbProducts = await p.product.findMany({
    select: { id: true, sku: true, name: true, category: true, size: true, capacity: true }
  });
  console.log(`Total DB products in browser_test: ${dbProducts.length}`);

  let exactMatches = 0;
  let missing = [];

  for (const [key, { type, size, cap, count }] of distinctCsvProducts.entries()) {
    // Look for exact match
    const normalizedSize = size.replace(/\s+/g, '');
    const found = dbProducts.find(p => {
      const s = (p.size || '').toUpperCase().replace(/\s+/g, '');
      const c = (p.capacity || '').toUpperCase();
      const sku = (p.sku || '').toUpperCase();
      const name = (p.name || '').toUpperCase();
      
      const typeMatch = sku.includes(type) || name.includes(type);
      const sizeMatch = s === normalizedSize || sku.includes(normalizedSize) || name.includes(normalizedSize);
      const capMatch = c === cap || sku.includes(cap) || name.includes(cap);
      return typeMatch && sizeMatch && capMatch;
    });

    if (found) {
      exactMatches++;
    } else {
      missing.push({ key, type, size, cap, count });
    }
  }

  console.log(`Exact matches found: ${exactMatches}/${distinctCsvProducts.size}`);
  console.log(`Missing products (${missing.length}):`, missing);

  await p.$disconnect();
})();
