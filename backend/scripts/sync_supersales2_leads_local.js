const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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
      else if (char === ',') { row.push(cell); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell);
        if (row.some(c => c && c.trim().length > 0)) result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (row.some(c => c && c.trim().length > 0)) result.push(row);
  return result;
}

function parseCsvDate(str) {
  if (!str) return new Date();
  str = str.trim();
  if (str === '-' || str === '') return new Date();
  
  let m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

function parseAddressObj(addrStr, stateStr, cityStr, pincodeStr) {
  let line1 = (addrStr || '').trim().replace(/\r\n|\n|\r/g, ', ').replace(/\s+/g, ' ');
  let city = (cityStr || '').trim();
  let state = (stateStr || '').trim();
  let pincode = (pincodeStr || '').trim();

  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }

  if (!city) {
    if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/RAJKOT/i.test(line1)) city = 'Rajkot';
    else if (/VADODARA/i.test(line1)) city = 'Vadodara';
    else if (/MUMBAI/i.test(line1)) city = 'Mumbai';
    else if (/MAHESANA|MEHSANA/i.test(line1)) city = 'Mehsana';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/MAHARASHTRA|MUMBAI/i.test(line1)) state = 'Maharashtra';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Address on file',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '380001'
  };
}

function cleanPhone(str) {
  if (!str) return '9998184929';
  return str.replace(/^MO\s*:\s*/i, '')
            .replace(/^MOB\s*[\.:]\s*/i, '')
            .replace(/^MO-\s*/i, '')
            .replace(/^mo:\s*/i, '')
            .replace(/^Mo:\s*/i, '')
            .trim();
}

function findProduct(type, size, capacity, products) {
  let t = (type || '').trim().toUpperCase();
  if (t === 'D MHC') t = 'MHC';
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  if (s.match(/^\d+X\d+X\d+$/)) s = s.substring(0, s.lastIndexOf('X'));
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
  return products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return sku.includes(s) || name.includes(s);
  }) || null;
}

function loadAllSuperSales2Leads(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCSV(content);
  const dataRows = rows.slice(1);

  const groupedLeads = [];
  let lastLead = null;

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    
    const leadDate = (r[0] || '').trim();
    const projectName = (r[1] || '').trim();
    const groupName = (r[2] || projectName).trim();
    const gstName = (r[3] || projectName).trim();
    const gstNo = (r[4] || '').trim();
    let siteIncharge = (r[5] || 'Site Incharge').trim();
    let siteInchargeMobile = cleanPhone(r[6] || r[7] || '');
    let officeContact = cleanPhone(r[7] || '');
    const email = (r[8] || 'info@thehimalaya.co.in').trim();
    const address = (r[11] || '').trim();
    const state = (r[12] || 'Gujarat').trim();
    const city = (r[13] || '').trim();
    const pincode = (r[14] || '').trim();

    if (siteInchargeMobile.includes(':')) {
      const parts = siteInchargeMobile.split(':');
      siteIncharge = parts[0].trim();
      siteInchargeMobile = parts[1].trim();
    }

    const product = (r[15] || '').trim();
    const size = (r[16] || '').trim();
    const capacity = (r[17] || '').trim();
    const qty = parseFloat(r[18]) || 1;
    const color = (r[19] || 'GREY').trim().toUpperCase();
    const unitPrice = parseFloat(r[20]) || 0;
    const subTotal = parseFloat(r[21]) || (unitPrice * qty);
    const gst = (r[22] || '18%').trim();
    const gstAmount = parseFloat(r[23]) || Math.round(subTotal * 0.18 * 100) / 100;
    const discount = parseFloat(r[24]) || 0;
    const grandTotal = parseFloat(r[25]) || (subTotal + gstAmount - discount);

    const hasLeadInfo = Boolean(projectName || groupName || gstName || gstNo);
    const hasProductInfo = Boolean(product || size || capacity);
    if (!hasLeadInfo && !hasProductInfo) continue;

    const itemObj = {
      product,
      size,
      capacity,
      quantity: qty,
      color,
      unitPrice,
      subTotal,
      tax: 18,
      gstRate: 18,
      gstAmount,
      discount,
      grandTotal,
      specification: `Product: ${product} | Size: ${size} | Capacity: ${capacity} | Color: ${color} | Qty: ${qty} | Rate: ₹${unitPrice}`
    };

    const isSameAsLast = lastLead &&
      (leadDate === lastLead.rawDate || !leadDate) &&
      (projectName === lastLead.companyName || (!projectName && gstName === lastLead.gstName)) &&
      (gstNo === lastLead.gstNumber || !gstNo) &&
      (siteInchargeMobile === lastLead.phone || !siteInchargeMobile);

    if (isSameAsLast && hasProductInfo) {
      lastLead.items.push(itemObj);
      continue;
    }

    if (hasLeadInfo) {
      const parsedAddr = parseAddressObj(address, state, city, pincode);
      lastLead = {
        rawDate: leadDate,
        leadDate: parseCsvDate(leadDate),
        companyName: projectName || groupName || gstName || 'Client',
        groupName: groupName || projectName,
        projectName: projectName || groupName,
        gstName: gstName || projectName,
        gstNumber: (gstNo && gstNo !== 'URD') ? gstNo : undefined,
        contactPerson: siteIncharge || 'Site Incharge',
        phone: siteInchargeMobile || officeContact || '9998184929',
        email: email || 'info@thehimalaya.co.in',
        address: parsedAddr,
        remarks: 'Imported from SuperSales 2 CSV',
        source: 'OTHER',
        items: hasProductInfo ? [itemObj] : []
      };
      groupedLeads.push(lastLead);
    } else if (hasProductInfo && lastLead) {
      lastLead.items.push(itemObj);
    }
  }

  for (const lead of groupedLeads) {
    const totalQty = lead.items.reduce((sum, it) => sum + (it.quantity || 1), 0);
    lead.estimatedQuantity = totalQty;
    lead.unit = 'SET';
    
    if (lead.items.length === 1) {
      const it = lead.items[0];
      lead.productInterest = `${it.product} ${it.size} ${it.capacity} (${it.quantity} Qty, ${it.color})`;
    } else {
      const summaryList = lead.items.map(it => `${it.product} ${it.size} ${it.capacity}`).slice(0, 3).join(', ');
      lead.productInterest = `${lead.items.length} Products: ${summaryList}${lead.items.length > 3 ? '...' : ''}`;
    }
    lead.detailedItems = lead.items;
  }

  return groupedLeads;
}

async function main() {
  console.log('--- SYNCING SUPERSALES 2 LEADS TO LOCAL POSTGRESQL DB ---');
  
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } }
  });
  if (!user) throw new Error('User supersales2@himalayaerp.com not found!');

  const company = await prisma.company.findFirst();
  const companyId = user.companyId || company.id;
  console.log(`Resolved User: ${user.name} (${user.id}), Company: ${companyId}`);

  let products = await prisma.product.findMany();
  console.log(`Found ${products.length} products in local database.`);

  const candidateCsvPaths = [
    path.join(__dirname, 'taher_sir(super_sales2) (1) (2).csv'),
    path.join(__dirname, '../../taher_sir(super_sales2) (1) (2).csv'),
    path.resolve('taher_sir(super_sales2) (1) (2).csv'),
    path.resolve('/app/scripts/taher_sir(super_sales2) (1) (2).csv'),
    path.resolve('/app/taher_sir(super_sales2) (1) (2).csv'),
    path.join(__dirname, 'taher_sir(super_sales2) (3).csv'),
    path.resolve('backend/scripts/taher_sir(super_sales2) (3).csv'),
  ];
  const csvPath = candidateCsvPaths.find(p => fs.existsSync(p));
  if (!csvPath) throw new Error(`CSV not found in paths: ${candidateCsvPaths.join(', ')}`);
  console.log(`Using CSV from: ${csvPath}`);

  const leads = loadAllSuperSales2Leads(csvPath);
  console.log(`Loaded ${leads.length} leads.`);

  // Enrich items with catalog data
  for (const l of leads) {
    for (const it of l.items) {
      const p = findProduct(it.product, it.size, it.capacity, products);
      if (p) {
        it.productId = p.id;
        it.productCode = p.code || p.sku;
        it.productName = p.name;
      } else {
        it.productCode = 'FRP';
        it.productName = `HIMALAYA FRP ${it.product} ${it.size} ${it.capacity}`;
      }
    }
  }

  // Clear existing SuperSales 2 leads
  const deleted = await prisma.lead.deleteMany({
    where: {
      OR: [
        { createdById: user.id },
        { salesExecutiveId: user.id },
        { assignedToId: user.id }
      ]
    }
  });
  console.log(`Cleared ${deleted.count} old leads for SuperSales 2.`);

  // Clear or align customers
  const customerMap = new Map();
  for (const l of leads) {
    const name = l.companyName.trim();
    if (!customerMap.has(name.toLowerCase())) {
      customerMap.set(name.toLowerCase(), l);
    }
  }

  const customerEntities = {};
  let custSeq = 1;
  for (const [key, l] of customerMap.entries()) {
    const isDuplicateGstin = (l.companyName === 'D.D RETAILS SALES');
    const validGstin = (l.gstNumber && !isDuplicateGstin) ? l.gstNumber : null;

    let cust = null;
    if (validGstin) {
      cust = await prisma.customer.findFirst({
        where: { companyId, gstin: validGstin }
      });
    }
    if (!cust) {
      cust = await prisma.customer.findFirst({
        where: { companyId, companyName: { equals: l.companyName, mode: 'insensitive' } }
      });
    }

    if (!cust) {
      const customerCode = `CUST-${String(custSeq).padStart(6, '0')}`;
      cust = await prisma.customer.create({
        data: {
          customerCode,
          companyName: l.companyName,
          contactPerson: l.contactPerson,
          email: l.email,
          phone: l.phone,
          gstin: validGstin,
          billingAddress: l.address,
          shippingAddress: l.address,
          companyId,
          createdById: user.id,
          status: 'ACTIVE'
        }
      });
      custSeq++;
    }
    customerEntities[key] = cust;
  }
  console.log(`Customer master aligned with ${Object.keys(customerEntities).length} companies.`);

  const leadState = await prisma.workflowState.findFirst({
    where: { workflow: { code: 'LEAD' }, isInitial: true }
  }) || await prisma.workflowState.findFirst({
    where: { workflow: { code: 'LEAD' } }
  });

  // Track sequence numbers by financial year
  let seq2627 = 1;
  let seq2526 = 1;

  for (let i = 0; i < leads.length; i++) {
    const l = leads[i];
    const fy = (l.leadDate.getUTCFullYear() === 2026 && l.leadDate.getUTCMonth() >= 3) ? '2627' : '2526';
    let seqNum = fy === '2627' ? seq2627++ : seq2526++;
    let leadNumber = `LEAD/${fy}/${String(seqNum).padStart(4, '0')}`;

    const cust = customerEntities[l.companyName.toLowerCase().trim()];

    await prisma.lead.create({
      data: {
        leadNumber,
        leadDate: l.leadDate,
        companyName: l.companyName,
        groupName: l.groupName,
        projectName: l.projectName,
        contactPerson: l.contactPerson,
        email: l.email,
        phone: l.phone,
        gstName: l.gstName,
        gstNumber: l.gstNumber || null,
        address: l.address,
        source: 'OTHER',
        productInterest: l.productInterest,
        detailedItems: l.detailedItems,
        estimatedQuantity: new Prisma.Decimal(l.estimatedQuantity || 1),
        unit: l.unit,
        remarks: l.remarks,
        workflowStateId: leadState?.id || null,
        assignedToId: user.id,
        salesExecutiveId: user.id,
        createdById: user.id,
        companyId,
        customerId: cust ? cust.id : null
      }
    });
    console.log(`✓ [${i + 1}/27] Created ${leadNumber}: ${l.companyName} (${l.rawDate})`);
  }

  // Set sequence generator
  await prisma.idSequence.upsert({
    where: { key: 'lead_number_2627' },
    update: { nextValue: seq2627 },
    create: { key: 'lead_number_2627', nextValue: seq2627 }
  });
  await prisma.idSequence.upsert({
    where: { key: 'lead_number_2526' },
    update: { nextValue: seq2526 },
    create: { key: 'lead_number_2526', nextValue: seq2526 }
  });
  await prisma.idSequence.upsert({
    where: { key: 'lead_number' },
    update: { nextValue: seq2627 },
    create: { key: 'lead_number', nextValue: seq2627 }
  });

  const totalLeads = await prisma.lead.count({ where: { salesExecutiveId: user.id } });
  console.log(`\n======================================================================`);
  console.log(`✅ LOCAL SYNC COMPLETE: ${totalLeads} Leads Created for SuperSales 2!`);
  console.log(`======================================================================`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
