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
  const candidatePaths = [
    'ravi_thakor(sales7) (1).csv',
    'backend/scripts/ravi_thakor(sales7) (1).csv',
    'scripts/ravi_thakor(sales7) (1).csv'
  ];
  const csvPath = candidatePaths.find(p => fs.existsSync(p));
  console.log('Found CSV at:', csvPath);

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(csvContent).slice(1).filter(r => r.length > 5 && (r[0] || r[1]) && r[1]);
  console.log(`Found ${rows.length} valid item rows in CSV`);

  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products in DB`);

  // Group transactions
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

  console.log(`Grouped into ${groups.length} distinct orders:`);
  let totalWorkOrders = 0;
  let totalGrand = 0;

  for (let idx = 0; idx < groups.length; idx++) {
    const g = groups[idx];
    console.log(`\nOrder #${idx + 1}: ${g.date} | ${g.proj} | GST: ${g.gstNo} | Items: ${g.items.length}`);
    for (const it of g.items) {
      totalWorkOrders++;
      const prodType = it[15];
      const prodSize = it[16];
      const prodCap = it[17];
      const qty = parseFloat(it[18]) || 1;
      const rate = parseFloat(it[20]) || 0;
      const sub = parseFloat(it[21]) || (qty * rate);
      const gst = parseFloat(it[23]) || (sub * 0.18);
      const grand = parseFloat(it[25]) || (sub + gst);
      totalGrand += grand;
      const matched = findProduct(prodType, prodSize, prodCap, products);
      console.log(`  - ${prodType} ${prodSize} ${prodCap} (Qty: ${qty}, Rate: ${rate}, Total: ${grand}) -> Matched: ${matched?.name || 'NONE'}`);
    }
  }

  console.log(`\nTotal Orders: ${groups.length}, Total WOs: ${totalWorkOrders}, Total Amount: ₹${totalGrand.toFixed(2)}`);

  // Check user sales3
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: 'sales3@himalayaerp.com', mode: 'insensitive' } },
        { name: { equals: 'Sales Three', mode: 'insensitive' } },
        { name: { equals: 'Sales 3', mode: 'insensitive' } }
      ]
    },
    include: { role: true }
  });
  console.log('Sales 3 User in DB:', user ? `${user.name} (${user.email}), role: ${user.role?.name}, ID: ${user.id}` : 'NOT FOUND (Will create)');

  await prisma.$disconnect();
}

main().catch(console.error);
