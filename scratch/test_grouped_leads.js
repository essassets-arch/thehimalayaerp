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
        if (row.some(c => c && c.trim().length > 0)) result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (row.some(c => c && c.trim().length > 0)) result.push(row);
  return result;
}

const content = fs.readFileSync('taher_sir(super_sales2) (1) (2).csv', 'utf8').replace(/^\uFEFF/, '');
const rows = parseCSV(content);

console.log('Valid rows count (including header):', rows.length);
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
  const siteIncharge = (r[5] || 'Site Incharge').trim();
  const siteInchargeMobile = (r[6] || r[7] || '').trim();
  const officeContact = (r[7] || '').trim();
  const email = (r[8] || 'info@thehimalaya.co.in').trim();
  const loggedInSales = (r[9] || 'supersales2').trim();
  const loginDateTime = (r[10] || '').trim();
  const address = (r[11] || '').trim();
  const state = (r[12] || 'Gujarat').trim();
  const city = (r[13] || '').trim();
  const pincode = (r[14] || '').trim();

  // Column 15 is PRODUCT, 16 is SIZE, 17 is CAPACITY, 18 is QTY, 19 is COLOR
  const product = (r[15] || '').trim();
  const size = (r[16] || '').trim();
  const capacity = (r[17] || '').trim();
  const qty = parseFloat(r[18]) || 1;
  const color = (r[19] || 'GREY').trim();
  const unitPrice = parseFloat(r[20]) || 0;
  const subTotal = parseFloat(r[21]) || 0;
  const gst = (r[22] || '18%').trim();
  const gstAmount = parseFloat(r[23]) || 0;
  const discount = parseFloat(r[24]) || 0;
  const grandTotal = parseFloat(r[25]) || 0;

  const hasLeadInfo = Boolean(projectName || groupName || gstName || gstNo);
  const hasProductInfo = Boolean(product || size || capacity);
  if (!hasLeadInfo && !hasProductInfo) continue;

  const itemObj = {
    product,
    size,
    capacity,
    qty,
    color,
    unit_price: unitPrice,
    sub_total: subTotal,
    gst,
    gst_amount: gstAmount,
    discount,
    grand_total: grandTotal
  };

  const isSameAsLast = lastLead &&
    (leadDate === lastLead.lead_date || !leadDate) &&
    (projectName === lastLead.project_name || (!projectName && gstName === lastLead.gst_name)) &&
    (gstNo === lastLead.gst_no || !gstNo) &&
    (siteInchargeMobile === lastLead.site_incharge_mobile || !siteInchargeMobile);

  if (isSameAsLast && hasProductInfo) {
    lastLead.items.push(itemObj);
    continue;
  }

  if (hasLeadInfo) {
    lastLead = {
      lead_date: leadDate,
      project_name: projectName,
      group_name: groupName,
      gst_name: gstName,
      gst_no: gstNo,
      site_incharge: siteIncharge,
      site_incharge_mobile: siteInchargeMobile,
      office_contact: officeContact,
      email: email,
      address: address,
      state: state,
      city: city,
      pincode: pincode,
      items: hasProductInfo ? [itemObj] : []
    };
    groupedLeads.push(lastLead);
  } else if (hasProductInfo && lastLead) {
    lastLead.items.push(itemObj);
  }
}

console.log('Total grouped leads:', groupedLeads.length);
groupedLeads.forEach((l, idx) => {
  console.log(`Lead #${idx + 1}: Date: ${l.lead_date} | Project: ${l.project_name} | City: ${l.city} | Items: ${l.items.length}`);
  l.items.forEach((it, i) => {
    console.log(`   Item ${i + 1}: ${it.product} | ${it.size} | ${it.capacity} | Qty: ${it.qty} | Rate: ${it.unit_price} | SubTotal: ${it.sub_total} | Total: ${it.grand_total}`);
  });
});
