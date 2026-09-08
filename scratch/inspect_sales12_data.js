const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

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

function parseCsvDate(str) {
  if (!str) return new Date();
  str = str.trim();
  let m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  return new Date();
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

function parseAddressObj(addrStr, stateStr, cityStr, pincodeStr) {
  let line1 = (addrStr || '').trim().replace(/\r\n|\n|\r/g, ', ');
  let city = (cityStr || '').trim();
  let state = (stateStr || '').trim();
  let pincode = (pincodeStr || '').trim();

  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }

  if (!city) {
    if (/GHANDHINAGAR|GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/JAIPUR/i.test(line1)) city = 'Jaipur';
    else if (/KHEDA/i.test(line1)) city = 'Kheda';
    else if (/PETLAD/i.test(line1)) city = 'Petlad';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/RAJASTHAN/i.test(line1) || /JAIPUR/i.test(city)) state = 'Rajasthan';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Address on file',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    pincode: pincode || '380001',
    country: 'India'
  };
}

async function testParse() {
  const content = fs.readFileSync('Jyoti_data(sales12).csv', 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCSV(content);
  console.log(`Total CSV rows: ${rows.length}`);
  const header = rows[0];
  console.log('Header:', header);

  const dataRows = rows.slice(1).filter(r => r[0] && r[1]);
  console.log(`Data rows count: ${dataRows.length}`);

  let lastLead = null;
  const grouped = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const orderDateStr = (r[0] || '').trim();
    const projectName = (r[1] || '').trim();
    const groupName = (r[2] || projectName).trim();
    const gstName = (r[3] || projectName).trim();
    const gstNo = (r[4] || '').trim();
    const siteIncharge = (r[5] || 'JY').trim();
    const siteInchargeMobile = (r[6] || '').trim();
    const officeContact = (r[7] || '').trim();
    const email = (r[8] || 'info@thehimalaya.co.in').trim();
    const salesRep = (r[9] || 'sales12').trim();
    const address = (r[11] || '').trim();
    const state = (r[12] || 'Gujarat').trim();
    const city = (r[13] || 'Ahmedabad').trim();
    const pincode = (r[14] || '').trim();

    const productType = (r[15] || '').trim();
    const size = (r[16] || '').trim();
    const capacity = (r[17] || '').trim();
    const qty = parseFloat(r[18]) || 1;
    const color = (r[19] || 'GREY').trim().toUpperCase();
    const unitPrice = parseFloat(r[20]) || 0;
    const subTotal = parseFloat(r[21]) || (qty * unitPrice);
    const gstRate = 18;
    const gstAmount = parseFloat(r[23]) || (subTotal * 0.18);
    const discount = parseFloat(r[24]) || 0;
    const grandTotal = parseFloat(r[25]) || (subTotal + gstAmount);

    const parsedAddr = parseAddressObj(address, state, city, pincode);

    const exactProductName = `HIMALAYA FRP ${productType} ${size} ${capacity}`.replace(/\s+/g, ' ').trim();
    const productCode = [productType, size.replace(/\s+/g, ''), capacity].filter(Boolean).join('-');

    const itemObj = {
      product: productType,
      size,
      capacity,
      productName: exactProductName,
      productCode,
      specification: `Product: ${productType} | Size: ${size} | Capacity: ${capacity} | Color: ${color} | Qty: ${qty} | Rate: ₹${unitPrice}`,
      color,
      quantity: qty,
      unitPrice,
      subTotal,
      tax: gstRate,
      gstRate,
      gstAmount,
      discount,
      grandTotal
    };

    const hasLeadInfo = Boolean(projectName || groupName || gstName);
    const isSameAsLast = lastLead &&
      (orderDateStr === lastLead.rawDate || !orderDateStr) &&
      (projectName === lastLead.companyName || (!projectName && gstName === lastLead.gstName)) &&
      (gstNo === (lastLead.gstNumber || 'URD') || !gstNo) &&
      (siteInchargeMobile === lastLead.phone || !siteInchargeMobile);

    if (isSameAsLast) {
      lastLead.items.push(itemObj);
      continue;
    }

    if (hasLeadInfo) {
      lastLead = {
        rawDate: orderDateStr,
        leadDate: parseCsvDate(orderDateStr),
        companyName: projectName || groupName || gstName || 'Client',
        groupName: groupName || projectName,
        projectName: projectName || groupName,
        gstName: gstName || projectName,
        gstNumber: (gstNo && gstNo !== 'URD') ? gstNo : undefined,
        contactPerson: siteIncharge || 'JY',
        phone: siteInchargeMobile || officeContact || '9925010258',
        email: email || 'info@thehimalaya.co.in',
        salesRep: salesRep || 'sales12',
        address: parsedAddr,
        remarks: 'Sales 12 Lead (Converted to Quotation, Order & Ready for Dispatch)',
        source: 'OTHER',
        items: [itemObj]
      };
      grouped.push(lastLead);
    } else if (lastLead) {
      lastLead.items.push(itemObj);
    }
  }

  grouped.sort((a, b) => a.leadDate.getTime() - b.leadDate.getTime());
  console.log(`Parsed & sorted ${grouped.length} distinct grouped transactions.`);
  
  const totalItems = grouped.reduce((acc, g) => acc + g.items.length, 0);
  const totalUnits = grouped.reduce((acc, g) => acc + g.items.reduce((s, it) => s + it.quantity, 0), 0);
  console.log(`Total line items: ${totalItems}, Total units: ${totalUnits}`);

  const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } } });
  const products = await prisma.product.findMany({ select: { id: true, name: true, sku: true, size: true, type: true, capacity: true } });

  console.log('\nTesting Product Matching:');
  let matchedCount = 0;
  let totalCount = 0;
  for (const g of grouped) {
    for (const it of g.items) {
      totalCount++;
      const m = findProduct(it.product, it.size, it.capacity, products);
      if (m) {
        matchedCount++;
      } else {
        console.log(`❌ NO MATCH: type="${it.product}", size="${it.size}", capacity="${it.capacity}"`);
      }
    }
  }
  console.log(`Matched ${matchedCount}/${totalCount} (${((matchedCount/totalCount)*100).toFixed(1)}%)`);

  fs.writeFileSync('backend/scripts/sales12_leads_data.json', JSON.stringify(grouped, null, 2));
  console.log('Saved to backend/scripts/sales12_leads_data.json');
  await prisma.$disconnect();
}

testParse();
