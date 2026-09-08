const fs = require('fs');

const content = fs.readFileSync('d:/prototype-next-main/rushi_data(sales2) (6).csv', 'utf8');

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
  return new Date();
}

function getFinancialYear(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1; // 1-12
  if (m >= 4) {
    return `${String(y).slice(-2)}${String(y + 1).slice(-2)}`;
  } else {
    return `${String(y - 1).slice(-2)}${String(y).slice(-2)}`;
  }
}

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
    (gstNo === (lastLead.gstNumber || '') || !gstNo) &&
    (siteInchargeMobile === lastLead.phone || !siteInchargeMobile);

  if (isSameAsLast) {
    lastLead.items.push(itemObj);
    continue;
  }

  const d = parseCsvDate(orderDateStr);
  lastLead = {
    rawDate: orderDateStr,
    leadDate: d,
    fy: getFinancialYear(d),
    companyName: projectName || groupName || gstName || 'Client',
    groupName: groupName || projectName,
    projectName: projectName || groupName,
    gstName: gstName || projectName,
    gstNumber: (gstNo && gstNo !== 'URD') ? gstNo : undefined,
    contactPerson: siteIncharge || 'RS',
    phone: siteInchargeMobile || officeContact || '9825137600',
    email: email || 'info@thehimalaya.co.in',
    salesRep: salesRep || 'sales2',
    address,
    state,
    city,
    pincode,
    items: [itemObj]
  };
  orders.push(lastLead);
}

orders.sort((a, b) => a.leadDate.getTime() - b.leadDate.getTime());

console.log(`Total Grouped Orders: ${orders.length}`);
console.log(`Total Line Items: ${orders.reduce((sum, o) => sum + o.items.length, 0)}`);
console.log(`Total Units: ${orders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0)}`);

const fyDist = {};
orders.forEach(o => { fyDist[o.fy] = (fyDist[o.fy] || 0) + 1; });
console.log('Orders per FY:', fyDist);

orders.forEach((o, idx) => {
  console.log(`${idx + 1}. [${o.rawDate}] (FY ${o.fy}) ${o.companyName} | Items: ${o.items.length} | Qty: ${o.items.reduce((s, i) => s + i.quantity, 0)}`);
});
