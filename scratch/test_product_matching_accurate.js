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

(async () => {
  const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });
  const dbProducts = await p.product.findMany({
    select: { id: true, sku: true, name: true, category: true, size: true, capacity: true }
  });

  const distinctCsv = new Map();
  rows.forEach((r, idx) => {
    const type = (r[15] || '').trim().toUpperCase();
    const size = (r[16] || '').trim().toUpperCase();
    const cap = (r[17] || '').trim().toUpperCase();
    const unitPrice = parseFloat(r[20]) || 0;
    const key = `${type}|${size}|${cap}`;
    if (!distinctCsv.has(key)) {
      distinctCsv.set(key, { type, size, cap, unitPrice, count: 0, rows: [] });
    }
    distinctCsv.get(key).count++;
    distinctCsv.get(key).rows.push(idx + 1);
  });

  console.log(`Found ${distinctCsv.size} distinct CSV product specifications across ${rows.length} rows.`);

  const report = [];
  for (const [key, item] of distinctCsv.entries()) {
    const normType = item.type;
    let normSize = item.size.replace(/\s+/g, '');
    if (normSize === '900MM') normSize = '900MMDIA';
    if (normSize.includes('DIA') && !normSize.includes('MM')) normSize = normSize.replace('DIA', 'MMDIA');
    
    // Exact match in dbProducts
    const match = dbProducts.find(p => {
      const s = (p.size || '').toUpperCase().replace(/\s+/g, '');
      const c = (p.capacity || '').toUpperCase();
      const sku = (p.sku || '').toUpperCase();
      const name = (p.name || '').toUpperCase();

      const hasType = sku.includes(normType) || name.includes(normType);
      const hasSize = s === normSize || sku.includes(normSize) || name.includes(normSize);
      const hasCap = c === item.cap || sku.includes(item.cap) || name.includes(item.cap);
      return hasType && hasSize && hasCap;
    });

    if (match) {
      report.push({ csvKey: key, status: 'MATCH', matchedSku: match.sku, matchedName: match.name });
    } else {
      report.push({ csvKey: key, status: 'MISSING', type: item.type, size: item.size, cap: item.cap, count: item.count });
    }
  }

  const missing = report.filter(r => r.status === 'MISSING');
  console.log(`Matched: ${report.length - missing.length}, Missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log('Missing specifications:', missing);
  }

  await p.$disconnect();
})();
