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
        row.push(cell);
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell);
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
    row.push(cell);
    result.push(row);
  }
  
  return result;
}

const csvPath = path.resolve('ravi_thakor(sales7) (1).csv');
const content = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(content);
const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
const dataRows = rows.slice(1);

let lastLeadForCarry = null;
const consolidatedLeads = [];

for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i];
  const obj = {};
  rawHeaders.forEach((h, idx) => {
    const cleanKey = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    obj[cleanKey] = r[idx] ? r[idx].trim() : '';
  });

  const leadDate = obj.lead_date || obj.order_date || '';
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
  const unitPrice = parseFloat(obj.unit_price || obj.unit_pricew || 0) || 0;
  let subTotal = parseFloat(obj.sub_total || 0) || (unitPrice * qty);
  const gst = obj.gst || '18%';
  let gstAmount = parseFloat(obj.gst_amount || 0) || (subTotal * 0.18);
  const discount = parseFloat(obj.discount || 0) || 0;
  let grandTotal = parseFloat(obj.grand_total || 0);
  if (!grandTotal || isNaN(grandTotal)) {
    grandTotal = subTotal + gstAmount - discount;
  }

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
    grand_total: grandTotal,
    row_index: i + 2
  };

  const isSameAsLast = lastLeadForCarry &&
    (leadDate === lastLeadForCarry.lead_date || !leadDate) &&
    (projectName === lastLeadForCarry.project_name || (!projectName && gstName === lastLeadForCarry.gst_name)) &&
    (gstNo === lastLeadForCarry.gst_no || !gstNo) &&
    (siteInchargeMobile === lastLeadForCarry.site_incharge_mobile || !siteInchargeMobile);

  if (isSameAsLast && hasProductInfo) {
    lastLeadForCarry.items.push(itemObj);
    continue;
  }

  if (hasLeadInfo) {
    lastLeadForCarry = {
      lead_date: leadDate,
      project_name: projectName || 'Unnamed Project',
      group_name: groupName,
      gst_name: gstName,
      gst_no: gstNo,
      site_incharge: siteIncharge,
      site_incharge_mobile: siteInchargeMobile,
      office_contact: officeContact,
      email: email,
      logged_in_sales_representive: 'sales3',
      address: address,
      state: state,
      city: city,
      pincode: pincode,
      items: hasProductInfo ? [itemObj] : []
    };
    consolidatedLeads.push(lastLeadForCarry);
  } else if (hasProductInfo && lastLeadForCarry) {
    lastLeadForCarry.items.push(itemObj);
  }
}

console.log(`Consolidated ${consolidatedLeads.length} leads:`);
let grandSum = 0;
consolidatedLeads.forEach((l, idx) => {
  console.log(`\nLead ${idx + 1}: ${l.project_name} | Date: ${l.lead_date} | Mobile: ${l.site_incharge_mobile} | GST: ${l.gst_no} | Items: ${l.items.length}`);
  l.items.forEach(it => {
    grandSum += it.grand_total;
    console.log(`   - Item (Row ${it.row_index}): ${it.product} ${it.size} ${it.capacity} | Qty: ${it.qty} | Rate: ${it.unit_price} | Sub: ${it.sub_total} | GST: ${it.gst_amount} | Total: ${it.grand_total}`);
  });
});

console.log(`\nTotal Pipeline Value across all items: ₹${grandSum.toFixed(2)}`);
