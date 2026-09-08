const fs = require('fs');

const content = fs.readFileSync('d:/prototype-next-main/JP_data(sales1) (1).csv', 'utf8');

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
  // If April (4) or later, FY is y to y+1 e.g. 2026-04 -> 2627
  // If Jan-March (1-3), FY is y-1 to y e.g. 2026-03 -> 2526
  if (m >= 4) {
    return `${String(y).slice(-2)}${String(y + 1).slice(-2)}`;
  } else {
    return `${String(y - 1).slice(-2)}${String(y).slice(-2)}`;
  }
}

const rows = parseCSV(content).slice(1);

const orders = [];
let currentOrder = null;

for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  if (!r[1] && !r[0]) continue;
  
  const leadDateStr = r[0] || '';
  const projectName = (r[1] || '').trim();
  const groupName = (r[2] || projectName).trim();
  const gstName = (r[3] || projectName).trim();
  const gstNo = (r[4] || '').trim();
  const siteIncharge = (r[5] || 'JP').trim();
  const siteInchargeMobile = (r[6] || '').trim();
  const officeContact = (r[7] || '').trim();
  const email = (r[8] || 'info@thehimalaya.co.in').trim();
  const salesRep = (r[9] || 'sales1').trim();
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
  const gstRate = (r[22] || '18%').trim();
  const gstAmount = parseFloat(r[23]) || (subTotal * 0.18);
  const discount = parseFloat(r[24]) || 0;
  const grandTotal = parseFloat(r[25]) || (subTotal + gstAmount);

  const orderKey = `${leadDateStr}_${projectName}_${gstNo}_${siteInchargeMobile}`;
  
  const itemObj = {
    product: productType,
    size,
    capacity,
    quantity: qty,
    color,
    unitPrice,
    subTotal,
    gstRate,
    gstAmount,
    discount,
    grandTotal
  };

  let existing = orders.find(o => o.orderKey === orderKey);
  if (!existing) {
    const d = parseCsvDate(leadDateStr);
    const fy = getFinancialYear(d);
    existing = {
      orderKey,
      leadDateStr,
      date: d,
      fy,
      projectName,
      groupName,
      gstName,
      gstNo,
      siteIncharge,
      siteInchargeMobile,
      officeContact,
      email,
      salesRep,
      address,
      state,
      city,
      pincode,
      items: []
    };
    orders.push(existing);
  }
  existing.items.push(itemObj);
}

console.log(`Total parsed grouped orders: ${orders.length}`);
const fyCount = {};
for (const o of orders) {
  fyCount[o.fy] = (fyCount[o.fy] || 0) + 1;
}
console.log('Orders per FY:', fyCount);

let totalItems = 0;
let totalUnits = 0;
for (const o of orders) {
  totalItems += o.items.length;
  for (const it of o.items) {
    totalUnits += it.quantity;
  }
}
console.log(`Total line items: ${totalItems}, Total units: ${totalUnits}`);

console.log('\nSample First 3 Orders:');
orders.slice(0, 3).forEach(o => {
  console.log(`- ${o.leadDateStr} (FY ${o.fy}) | Project: ${o.projectName} | GST: ${o.gstNo} | Items: ${o.items.length}`);
});

console.log('\nSample Last 3 Orders:');
orders.slice(-3).forEach(o => {
  console.log(`- ${o.leadDateStr} (FY ${o.fy}) | Project: ${o.projectName} | GST: ${o.gstNo} | Items: ${o.items.length}`);
});
