const fs = require('fs');
const path = require('path');

const csvPath = 'd:/prototype-next-main/hussain_sir(super_sales1) (2).csv';
const content = fs.readFileSync(csvPath, 'utf8');

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

const rows = parseCSV(content);
const headers = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
console.log('Headers:', headers);
console.log('Total rows in CSV (including header):', rows.length);

const dataRows = rows.slice(1);
let nonEmpty = 0;
const leadGroups = new Map();

let lastKnownLead = null;

for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i];
  const obj = {};
  headers.forEach((h, idx) => obj[h] = r[idx] ? r[idx].trim() : '');
  
  const hasLeadInfo = Boolean(obj.project_name || obj['group name'] || obj['gst name'] || obj['gst no'] || obj.lead_date || obj.Site_incharge || obj.site_incharge_mobile || obj.ADDRESS);
  const hasProductInfo = Boolean(obj.PRODUCT || obj.SIZE || obj.CAPCITY || obj.QTY);

  if (!hasLeadInfo && !hasProductInfo) {
    // Completely empty row
    continue;
  }

  nonEmpty++;

  if (hasLeadInfo) {
    // New lead or lead header row
    const leadKey = `${obj.lead_date || 'nodate'}_${obj.project_name || obj['group name'] || obj['gst name'] || 'noproject'}_${obj['gst no'] || ''}_${obj.site_incharge_mobile || ''}_${i}`;
    lastKnownLead = {
      lead_date: obj.lead_date,
      project_name: obj.project_name,
      group_name: obj['group name'],
      gst_name: obj['gst name'],
      gst_no: obj['gst no'],
      Site_incharge: obj.Site_incharge,
      site_incharge_mobile: obj.site_incharge_mobile,
      office_contact: obj.office_contact,
      email: obj.email,
      logged_in_sales_representive: obj.logged_in_sales_representive,
      login_datetime: obj['login_date&time'],
      address: obj.ADDRESS,
      state: obj.state,
      city: obj.city,
      pincode: obj.pincode,
      items: []
    };
    leadGroups.set(leadKey, lastKnownLead);
  }

  if (hasProductInfo && lastKnownLead) {
    lastKnownLead.items.push({
      product: obj.PRODUCT,
      size: obj.SIZE,
      capacity: obj.CAPCITY,
      qty: parseFloat(obj.QTY) || 1,
      color: obj.COLOR || 'GREY',
      unit_price: parseFloat(obj.unit_pricew) || 0,
      sub_total: parseFloat(obj.sub_total) || 0,
      gst: obj.gst || '18%',
      gst_amount: parseFloat(obj.gst_amount) || 0,
      discount: parseFloat(obj.discount) || 0,
      grand_total: parseFloat(obj.grand_total) || 0,
      row_index: i + 2
    });
  }
}

console.log('Non-empty rows count:', nonEmpty);

let emptyProjectCount = 0;
let emptyDateCount = 0;
let consecutiveItemsForSameLead = 0;
let lastLeadForCarry = null;
const consolidatedLeads = [];

for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i];
  const obj = {};
  headers.forEach((h, idx) => obj[h] = r[idx] ? r[idx].trim() : '');
  
  const hasLeadInfo = Boolean(obj.project_name || obj['group name'] || obj['gst name'] || obj['gst no']);
  const hasProductInfo = Boolean(obj.PRODUCT || obj.SIZE || obj.CAPCITY);

  if (!hasLeadInfo && !hasProductInfo) continue;

  if (hasLeadInfo) {
    // Check if this is the exact same lead as the previous row (same date, project, gst, contact)
    const isSameAsLast = lastLeadForCarry &&
      (obj.lead_date === lastLeadForCarry.lead_date || !obj.lead_date) &&
      (obj.project_name === lastLeadForCarry.project_name || (!obj.project_name && obj.gst_name === lastLeadForCarry.gst_name)) &&
      (obj.gst_no === lastLeadForCarry.gst_no || !obj.gst_no) &&
      (obj.site_incharge_mobile === lastLeadForCarry.site_incharge_mobile || !obj.site_incharge_mobile);

    if (isSameAsLast && hasProductInfo) {
      consecutiveItemsForSameLead++;
      lastLeadForCarry.items.push({
        product: obj.PRODUCT,
        size: obj.SIZE,
        capacity: obj.CAPCITY,
        qty: parseFloat(obj.QTY) || 1,
        color: obj.COLOR || 'GREY',
        unit_price: parseFloat(obj.unit_pricew) || 0,
        sub_total: parseFloat(obj.sub_total) || 0,
        gst: obj.gst || '18%',
        gst_amount: parseFloat(obj.gst_amount) || 0,
        discount: parseFloat(obj.discount) || 0,
        grand_total: parseFloat(obj.grand_total) || 0,
        row_index: i + 2
      });
      continue;
    }

    lastLeadForCarry = {
      lead_date: obj.lead_date,
      project_name: obj.project_name || obj['group name'] || obj['gst name'] || 'Unnamed Project',
      group_name: obj['group name'] || obj.project_name || '',
      gst_name: obj['gst name'] || obj.project_name || '',
      gst_no: obj['gst no'] || '',
      Site_incharge: obj.Site_incharge || 'Site Incharge',
      site_incharge_mobile: obj.site_incharge_mobile || obj.office_contact || '',
      office_contact: obj.office_contact || '',
      email: obj.email || 'info@thehimalaya.co.in',
      logged_in_sales_representive: obj.logged_in_sales_representive || 'supersales1',
      login_datetime: obj['login_date&time'] || '',
      address: obj.ADDRESS || '',
      state: obj.state || 'Gujarat',
      city: obj.city || '',
      pincode: obj.pincode || '',
      items: []
    };
    if (hasProductInfo) {
      lastLeadForCarry.items.push({
        product: obj.PRODUCT,
        size: obj.SIZE,
        capacity: obj.CAPCITY,
        qty: parseFloat(obj.QTY) || 1,
        color: obj.COLOR || 'GREY',
        unit_price: parseFloat(obj.unit_pricew) || 0,
        sub_total: parseFloat(obj.sub_total) || 0,
        gst: obj.gst || '18%',
        gst_amount: parseFloat(obj.gst_amount) || 0,
        discount: parseFloat(obj.discount) || 0,
        grand_total: parseFloat(obj.grand_total) || 0,
        row_index: i + 2
      });
    }
    consolidatedLeads.push(lastLeadForCarry);
  } else if (hasProductInfo && lastLeadForCarry) {
    // Row has no lead header info, but has product info -> it's an item for the preceding lead!
    consecutiveItemsForSameLead++;
    lastLeadForCarry.items.push({
      product: obj.PRODUCT,
      size: obj.SIZE,
      capacity: obj.CAPCITY,
      qty: parseFloat(obj.QTY) || 1,
      color: obj.COLOR || 'GREY',
      unit_price: parseFloat(obj.unit_pricew) || 0,
      sub_total: parseFloat(obj.sub_total) || 0,
      gst: obj.gst || '18%',
      gst_amount: parseFloat(obj.gst_amount) || 0,
      discount: parseFloat(obj.discount) || 0,
      grand_total: parseFloat(obj.grand_total) || 0,
      row_index: i + 2
    });
  }
}

console.log('Consolidated Leads count (grouping multi-items):', consolidatedLeads.length);
console.log('Consecutive additional items merged:', consecutiveItemsForSameLead);

let totalItems = 0;
consolidatedLeads.forEach(l => totalItems += l.items.length);
console.log('Total items across consolidated leads:', totalItems);

// Inspect leads with multi-items
const multiItemLeads = consolidatedLeads.filter(l => l.items.length > 1);
console.log('Number of leads with multiple items:', multiItemLeads.length);
if (multiItemLeads.length > 0) {
  console.log('Example multi-item lead:', multiItemLeads[0].project_name, multiItemLeads[0].items.length, 'items');
}
