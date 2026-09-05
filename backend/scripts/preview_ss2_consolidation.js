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

const csvPath = path.resolve('taher_sir(super_sales2) (3).csv');
const content = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(content);
const headers = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));
const dataRows = rows.slice(1);

const companyGroups = {};

for (const r of dataRows) {
  const obj = {};
  headers.forEach((h, idx) => { obj[h] = r[idx] ? r[idx].trim() : ''; });
  
  const comp = obj.project_name || obj.group_name || obj.gst_name || 'UNKNOWN';
  if (!comp || comp === 'UNKNOWN') continue;
  
  const key = comp.trim().toUpperCase();
  if (!companyGroups[key]) {
    companyGroups[key] = {
      name: key,
      gst_no: obj.gst_no,
      contact: obj.site_incharge_mobile || obj.office_contact,
      incharge: obj.site_incharge,
      address: obj.address,
      items: []
    };
  }
  
  if (obj.product || obj.size) {
    companyGroups[key].items.push({
      date: obj.lead_date,
      product: obj.product,
      size: obj.size,
      capacity: obj.capcity || obj.capacity,
      qty: obj.qty,
      color: obj.specification || obj.color || 'GREY',
      unit_price: obj.unit_pricew || obj.unit_price,
      sub_total: obj.sub_total,
      gst_amount: obj.gst_amount,
      grand_total: obj.grand_total
    });
  }
}

console.log(`\n=== STRICTLY CONSOLIDATED UNIQUE COMPANIES IN SUPERSALES 2 (${Object.keys(companyGroups).length}) ===`);
let totalItems = 0;
for (const [k, v] of Object.entries(companyGroups)) {
  console.log(`\nCompany: ${k} | GST: ${v.gst_no} | Phone: ${v.contact} | Total Items: ${v.items.length}`);
  totalItems += v.items.length;
  for (const it of v.items) {
    console.log(`  - [${it.date}] ${it.product} ${it.size} ${it.capacity} (Qty: ${it.qty}, ₹${it.unit_price}, Subtotal: ₹${it.sub_total}, Total: ₹${it.grand_total})`);
  }
}
console.log(`\nTotal unique companies: ${Object.keys(companyGroups).length}`);
console.log(`Total line items across all companies: ${totalItems}`);
