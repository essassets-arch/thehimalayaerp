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
  if (!value) return null;
  value = value.trim();
  try {
    let clean = value.replace(/[\.\/]/g, '-').replace(/\s+/g, '');
    
    if (clean.includes('-')) {
      const parts = clean.split('-');
      let day = parts[0];
      let month = parts[1];
      let year = parts[2];
      
      if (!year && month && month.length >= 7) {
        const rest = month;
        month = rest.substring(0, 2);
        year = rest.substring(rest.length - 4);
      }
      
      if (year && year.length === 2) {
        year = '20' + year;
      }
      
      if (day && month && year) {
        const d = parseInt(day, 10);
        const m = parseInt(month, 10) - 1;
        const y = parseInt(year, 10);
        const date = new Date(Date.UTC(y, m, d, 0, 0, 0));
        return isNaN(date.getTime()) ? null : date;
      }
    }
    
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function run() {
  const csvPath = 'd:\\prototype-next-main\\hussain_sir(super_sales1) (2).csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const headers = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);
  
  const uniqueDates = new Set();
  
  dataRows.forEach((row, idx) => {
    if (row.length < headers.length) return;
    const dateVal = row[0] ? row[0].trim() : '';
    if (dateVal) uniqueDates.add(dateVal);
  });
  
  console.log('Unique raw dates in CSV:', uniqueDates.size);
  uniqueDates.forEach(d => {
    const parsed = parseDate(d);
    console.log(`Raw: ${d.padEnd(12)} -> Parsed: ${parsed ? parsed.toISOString().split('T')[0] : 'FAILED'}`);
  });
}

run();
