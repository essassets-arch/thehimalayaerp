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
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = [];
        cell = '';
        if (char === '\r' && nextChar === '\n') i++;
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

function parseCsvDate(str) {
  if (!str) return new Date();
  str = str.trim();
  if (str === '-' || str === '') return new Date();

  let m = str.match(/^(\d{1,2})-(\d{1,2})0(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year === 2006) year = 2026;
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year === 2006) year = 2026;
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
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
    if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/JAMNAGAR/i.test(line1)) city = 'Jamnagar';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/VADODARA/i.test(line1)) city = 'Vadodara';
    else if (/GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else if (/CHENNAI/i.test(line1)) city = 'Chennai';
    else if (/MUMBAI/i.test(line1)) city = 'Mumbai';
    else if (/BENGALURU|BANGALORE/i.test(line1)) city = 'Bengaluru';
    else if (/RAJKOT/i.test(line1)) city = 'Rajkot';
    else if (/MORBI/i.test(line1)) city = 'Morbi';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/GUJARAT/i.test(line1)) state = 'Gujarat';
    else if (/TAMILNADU|TANIL NADU|TAMIL NADU/i.test(line1)) state = 'Tamil Nadu';
    else if (/MAHARASHTRA/i.test(line1)) state = 'Maharashtra';
    else if (/KARNATAKA|BENGALURU/i.test(line1)) state = 'Karnataka';
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

const content = fs.readFileSync('d:/prototype-next-main/hussain_sir(super_newwww.csv', 'utf8');
const rows = parseCSV(content);
const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
const dataRows = rows.slice(1);

let rawConsolidatedLeads = [];
let lastLeadForCarry = null;

for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i];
  const obj = {};
  rawHeaders.forEach((h, idx) => {
    // header h might be empty string for column 16, 17
    let cleanKey = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!cleanKey) {
      if (idx === 15) cleanKey = 'product';
      else if (idx === 16) cleanKey = 'size';
      else if (idx === 17) cleanKey = 'capacity';
    }
    obj[cleanKey] = r[idx] ? r[idx].trim() : '';
  });

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
  const size = obj.size || r[16] || '';
  const capacity = obj.capacity || obj.capcity || r[17] || '';
  const qty = parseFloat(obj.qty) || 1;
  const color = obj.color || 'GREY';
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
      group_name: groupName || projectName || 'Unnamed Project',
      gst_name: gstName || projectName || 'Unnamed Project',
      gst_no: gstNo,
      site_incharge: siteIncharge,
      site_incharge_mobile: siteInchargeMobile,
      office_contact: officeContact,
      email: email,
      address: address,
      state: state,
      city: city,
      pincode: pincode,
      items: []
    };
    if (hasProductInfo) {
      lastLeadForCarry.items.push(itemObj);
    }
    rawConsolidatedLeads.push(lastLeadForCarry);
  } else if (hasProductInfo && lastLeadForCarry) {
    lastLeadForCarry.items.push(itemObj);
  }
}

const consolidatedLeads = rawConsolidatedLeads.filter(l => l.items && l.items.length > 0);
console.log(`Parsed ${consolidatedLeads.length} consolidated leads from ${dataRows.length} rows.`);

let totalItems = 0;
consolidatedLeads.forEach(l => totalItems += l.items.length);
console.log(`Total items across leads: ${totalItems}`);

console.log('\nFirst 5 consolidated leads:');
consolidatedLeads.slice(0, 5).forEach((l, idx) => {
  console.log(`${idx + 1}. [${l.lead_date}] ${l.project_name} | Items: ${l.items.length} | First Item: ${l.items[0].product} ${l.items[0].size} ${l.items[0].capacity} (${l.items[0].qty})`);
});

console.log('\nLast 5 consolidated leads:');
consolidatedLeads.slice(-5).forEach((l, idx) => {
  console.log(`${consolidatedLeads.length - 5 + idx + 1}. [${l.lead_date}] ${l.project_name} | Items: ${l.items.length} | First Item: ${l.items[0].product} ${l.items[0].size} ${l.items[0].capacity} (${l.items[0].qty})`);
});

fs.writeFileSync('scratch/consolidated_leads_preview.json', JSON.stringify(consolidatedLeads, null, 2));
