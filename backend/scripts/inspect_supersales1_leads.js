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

const csvPath = path.resolve('backend/scripts/hussain_sir(super_sales1) (6).csv');
const content = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(content);
const headers = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));
const dataRows = rows.slice(1);

let lastLead = null;
const leads = [];

for (let i = 0; i < dataRows.length; i++) {
  const r = dataRows[i];
  const obj = {};
  headers.forEach((h, idx) => obj[h] = r[idx] ? r[idx].trim() : '');

  const leadDate = obj.lead_date || '';
  const projectName = obj.project_name || obj.group_name || obj.gst_name || '';
  const gstNo = obj.gst_no || '';
  const mobile = obj.site_incharge_mobile || obj.office_contact || '';
  const hasProduct = Boolean(obj.product || obj.size || obj.capcity || obj.capacity);
  const hasLead = Boolean(projectName || gstNo || mobile);

  if (!hasLead && !hasProduct) continue;

  const isSame = lastLead && (leadDate === lastLead.leadDate || !leadDate) && (projectName === lastLead.projectName) && (gstNo === lastLead.gstNo || !gstNo);
  if (isSame && hasProduct) {
    lastLead.items.push(obj);
  } else if (hasLead) {
    lastLead = { idx: i + 2, leadDate, projectName, gstNo, mobile, items: hasProduct ? [obj] : [], raw: obj };
    leads.push(lastLead);
  } else if (hasProduct && lastLead) {
    lastLead.items.push(obj);
  }
}

const validLeads = leads.filter(l => l.items.length > 0);
console.log('Total valid consolidated leads for Super Sales 1:', validLeads.length);
console.log('Total items across all leads:', validLeads.reduce((acc, l) => acc + l.items.length, 0));
