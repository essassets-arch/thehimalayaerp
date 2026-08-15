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

function parseDate(value) {
  if (!value) return '';
  value = value.trim();
  try {
    // DD-MM-YYYY
    if (value.includes('-')) {
      const parts = value.split('-');
      if (parts[2] && parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      if (parts[2] && parts[2].length === 2) {
        return `20${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    // DD.MM.YY
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[2] && parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      if (parts[2] && parts[2].length === 2) {
        return `20${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return value;
  } catch {
    return value;
  }
}

function run() {
  const csvPath = 'd:\\prototype-next-main\\hussain_sir(super_sales1) (2).csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const headers = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);
  
  const leads = {};
  
  dataRows.forEach((row, idx) => {
    if (row.length < headers.length) return;
    
    const rowObj = {};
    headers.forEach((h, i) => {
      rowObj[h] = row[i] ? row[i].trim() : '';
    });
    
    if (!rowObj.project_name && !rowObj.PRODUCT && !rowObj.SIZE) return;
    
    const leadDate = parseDate(rowObj.lead_date);
    const company = rowObj.project_name || rowObj['group name'] || rowObj['gst name'] || 'Unknown Company';
    const project = rowObj.project_name || '';
    const gstNo = rowObj['gst no'] || '';
    const addr = rowObj.ADDRESS || '';
    const phone = rowObj.site_incharge_mobile || rowObj.office_contact || '';
    
    // Grouping key
    const key = `${leadDate}_${company}_${project}_${gstNo}_${addr.substring(0, 30)}_${phone}`;
    
    if (!leads[key]) {
      leads[key] = {
        leadDate,
        company,
        project,
        gstNo,
        address: addr,
        phone,
        itemsCount: 0,
        rows: []
      };
    }
    leads[key].itemsCount++;
    leads[key].rows.push(rowObj);
  });
  
  const keys = Object.keys(leads);
  console.log(`Total grouped leads: ${keys.length}`);
  console.log('Sample groups:');
  keys.slice(0, 10).forEach(k => {
    const l = leads[k];
    console.log(`- Date: ${l.leadDate} | Company: ${l.company} | Items: ${l.itemsCount} | Phone: ${l.phone}`);
  });
}

run();
