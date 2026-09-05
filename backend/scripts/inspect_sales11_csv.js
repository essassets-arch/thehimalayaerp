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

async function analyze() {
  const products = await prisma.product.findMany();
  console.log('Total catalog products:', products.length);

  const candidatePaths = [
    path.join(__dirname, 'HL_data(sales3) (1).csv'),
    path.resolve('HL_data(sales3) (1).csv'),
    path.resolve('../HL_data(sales3) (1).csv'),
    path.join(__dirname, '../HL_data(sales3) (1).csv')
  ];
  const csvPath = candidatePaths.find(p => fs.existsSync(p));
  console.log('Using CSV:', csvPath);

  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content).slice(1).filter(r => r.length > 5 && (r[0] || r[1]) && r[1]);

  console.log('Total valid item rows:', rows.length);

  // Check product matching
  let matchedCount = 0;
  let unmatchedCount = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const prod = r[15];
    const size = r[16];
    const cap = r[17];
    const matched = findProduct(prod, size, cap, products);
    if (matched) {
      matchedCount++;
    } else {
      unmatchedCount++;
      console.log(`[UNMATCHED Row ${i + 2}] Prod: "${prod}", Size: "${size}", Cap: "${cap}"`);
    }
  }
  console.log(`Product Matching: ${matchedCount} matched, ${unmatchedCount} unmatched.`);

  // Grouping
  const groups = [];
  let currentGroup = null;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    let date = (r[0] || '').trim();
    if (!date && r[10]) date = r[10].trim();
    if (!date) date = '01-07-2026';

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

  console.log(`Total Grouped Orders: ${groups.length}`);
  console.log(`Total items across groups: ${groups.reduce((acc, g) => acc + g.items.length, 0)}`);

  console.log('\n--- ALL GROUPS ---');
  groups.forEach((g, idx) => {
    const seqStr = String(260 + idx + 1).padStart(4, '0');
    console.log(`[#${idx + 1}] Order: HCPPL/2627/${seqStr} | Date: ${g.date} | Customer: ${g.gstName || g.proj} | Items: ${g.items.length}`);
  });
}

analyze().catch(console.error).finally(() => prisma.$disconnect());
