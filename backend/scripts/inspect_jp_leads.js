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

const csvPath = path.resolve('JP_data(sales6) (1).csv');
const content = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(content);
const headers = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));
const dataRows = rows.slice(1);

let lastLead = null;
const leads = [];

dataRows.forEach((r, idx) => {
  const obj = {};
  headers.forEach((h, i) => obj[h] = r[i] ? r[i].trim() : '');
  const leadDate = obj.lead_date || '';
  const projectName = obj.project_name || obj.group_name || obj.gst_name || '';
  const gstNo = obj.gst_no || '';
  const mobile = obj.site_incharge_mobile || obj.office_contact || '';
  
  const isSame = lastLead && (leadDate === lastLead.leadDate || !leadDate) && (projectName === lastLead.projectName) && (gstNo === lastLead.gstNo || !gstNo) && (mobile === lastLead.mobile || !mobile);
  if (isSame) {
    lastLead.items.push(obj);
  } else {
    lastLead = { idx: idx + 2, leadDate, projectName, gstNo, mobile, items: [obj], raw: obj };
    leads.push(lastLead);
  }
});

console.log('Total consolidated leads from JP_data:', leads.length);
leads.forEach((l, idx) => {
  console.log(`${idx + 1}. [${l.leadDate}] ${l.projectName} | GST: ${l.gstNo} | Items: ${l.items.length}`);
});
