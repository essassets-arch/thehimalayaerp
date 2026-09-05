const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' }
  }
});

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
        row.push(cell.trim());
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell.trim());
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
    row.push(cell.trim());
    result.push(row);
  }
  
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
  const csvContent = fs.readFileSync('MK_data(sales4) (2).csv', 'utf8');
  const rows = parseCSV(csvContent).slice(1).filter(r => r.length > 5 && (r[0] || r[1]) && r[1]);
  console.log(`Found ${rows.length} valid rows in MK CSV`);

  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products in DB`);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const date = r[0];
    const proj = r[1];
    const gstNo = r[4];
    const prod = r[15];
    const size = r[16];
    const cap = r[17];
    const qty = r[18];
    const rate = r[20];
    const sub = r[21];
    const gst = r[23];
    const total = r[25];

    const matched = findProduct(prod, size, cap, products);
    console.log(`Row ${i + 1}: ${date} | ${proj} | ${prod} ${size} ${cap} (Qty: ${qty}, Rate: ${rate}) -> Matched: ${matched?.name || 'NONE'} (${matched?.sku || 'NONE'})`);
  }

  // Check Sales 13 user
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'sales13@himalayaerp.com', mode: 'insensitive' } },
    include: { role: true }
  });
  console.log('Sales 13 user in DB:', user ? `${user.name} (${user.email}), role: ${user.role?.name}` : 'NOT FOUND (Will be created)');

  await prisma.$disconnect();
}

main().catch(console.error);
