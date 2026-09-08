const fs = require('fs');
const path = require('path');

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
    if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else city = 'Surat';
  }

  if (!state) state = 'Gujarat';

  return {
    line1: line1 || 'Address on file',
    city: city || 'Surat',
    state: state || 'Gujarat',
    pincode: pincode || '395001',
    country: 'India'
  };
}

const csvPath = 'd:/prototype-next-main/backend/scripts/rushi_data_sales2.csv';
const content = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
const rows = parseCSV(content);
const dataRows = rows.slice(1).filter(r => r[0] && r[1]);

const orders = [];
let lastLead = null;

for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i];
  const orderDateStr = (r[0] || '').trim();
  const projectName = (r[1] || '').trim();
  const groupName = (r[2] || projectName).trim();
  const gstName = (r[3] || projectName).trim();
  const gstNo = (r[4] || '').trim();
  const siteIncharge = (r[5] || 'RS').trim();
  const siteInchargeMobile = (r[6] || '').trim();
  const officeContact = (r[7] || '').trim();
  const email = (r[8] || 'info@thehimalaya.co.in').trim();
  const salesRep = (r[9] || 'sales2').trim();
  const address = (r[11] || '').trim();
  const state = (r[12] || 'Gujarat').trim();
  const city = (r[13] || 'Surat').trim();
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

  const isSameAsLast = lastLead &&
    (orderDateStr === lastLead.rawDate || !orderDateStr) &&
    (projectName === lastLead.companyName || (!projectName && gstName === lastLead.gstName)) &&
    (gstNo === (lastLead.gstNumber || 'URD') || !gstNo) &&
    (siteInchargeMobile === lastLead.phone || !siteInchargeMobile);

  if (isSameAsLast) {
    lastLead.items.push(itemObj);
    continue;
  }

  const d = parseCsvDate(orderDateStr);
  lastLead = {
    rawDate: orderDateStr,
    leadDate: d,
    companyName: projectName || groupName || gstName || 'Client',
    groupName: groupName || projectName,
    projectName: projectName || groupName,
    gstName: gstName || projectName,
    gstNumber: (gstNo && gstNo !== 'URD') ? gstNo : undefined,
    contactPerson: siteIncharge || 'RS',
    phone: siteInchargeMobile || officeContact || '9825137600',
    email: email || 'info@thehimalaya.co.in',
    salesRep: salesRep || 'sales2',
    address: parsedAddr,
    remarks: 'Sales 2 Lead (Converted to Quotation, Order & Ready for Dispatch)',
    source: 'OTHER',
    items: [itemObj]
  };
  orders.push(lastLead);
}

orders.sort((a, b) => a.leadDate.getTime() - b.leadDate.getTime());

console.log(`Generated ${orders.length} orders, total items: ${orders.reduce((sum, o) => sum + o.items.length, 0)}`);

fs.writeFileSync('d:/prototype-next-main/backend/scripts/sales2_leads_data.json', JSON.stringify(orders, null, 2), 'utf8');
console.log('Saved to backend/scripts/sales2_leads_data.json');
