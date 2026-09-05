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

const csvPath = path.resolve(__dirname, 'taher_sir(super_sales2) (3).csv');
const content = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, 'utf8') : fs.readFileSync(path.resolve(__dirname, '../../taher_sir(super_sales2) (3).csv'), 'utf8');
const rows = parseCSV(content);
const headers = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));
const dataRows = rows.slice(1);

let lastLead = null;
const groupedLeads = [];

for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i];
  const obj = {};
  headers.forEach((h, idx) => { obj[h] = r[idx] ? r[idx].trim() : ''; });

  const leadDate = obj.lead_date || '';
  const projectName = obj.project_name || obj.group_name || obj.gst_name || '';
  const groupName = obj.group_name || projectName;
  const gstName = obj.gst_name || projectName;
  const gstNo = obj.gst_no || '';
  const siteIncharge = obj.site_incharge || 'Site Incharge';
  const siteInchargeMobile = obj.site_incharge_mobile || obj.office_contact || '';
  const officeContact = obj.office_contact || '';
  const email = obj.email || 'info@thehimalaya.co.in';
  const address = obj.address || '';
  const state = obj.state || 'Gujarat';
  const city = obj.city || '';
  const pincode = obj.pincode || '';

  const product = obj.product || '';
  const size = obj.size || '';
  const capacity = obj.capcity || obj.capacity || '';
  const qty = parseFloat(obj.qty) || 1;
  const color = obj.specification || obj.color || 'GREY';
  const unitPrice = parseFloat(obj.unit_pricew || obj.unit_price || 0) || 0;
  const subTotal = parseFloat(obj.sub_total || 0) || 0;
  const gst = obj.gst || '18%';
  const gstAmount = parseFloat(obj.gst_amount || 0) || 0;
  const discount = parseFloat(obj.discount || 0) || 0;
  const grandTotal = parseFloat(obj.grand_total || 0) || 0;

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

console.log('Total grouped sequential leads from CSV:', groupedLeads.length);
groupedLeads.forEach((l, i) => {
  console.log(`${i+1}. [${l.lead_date}] Project: ${l.project_name} | GST: ${l.gst_no || 'URD'} | Items: ${l.items.length}`);
});
