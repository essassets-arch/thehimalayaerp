const fs = require('fs');

const csvPath = 'JP_data(sales6) (1).csv';
const content = fs.readFileSync(csvPath, 'utf8');

function parseCSV(text) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
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
        row.push(cell.trim());
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell.trim());
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
    row.push(cell.trim());
    result.push(row);
  }
  
  return result;
}

const rows = parseCSV(content);
const header = rows[0];
const dataRows = rows.slice(1);

console.log('Total data rows:', dataRows.length);
console.log('Header:', header);

// Group rows by Date + Project/Company + Phone/Address
const groups = [];
const groupMap = new Map();

dataRows.forEach((r, idx) => {
  const date = r[0];
  const projectName = r[1];
  const groupName = r[2];
  const gstName = r[3];
  const gstNo = r[4];
  const incharge = r[5];
  const phone = r[6];
  const address = r[11];
  
  const key = `${date}|${projectName}|${phone}`;
  if (!groupMap.has(key)) {
    const groupObj = {
      key,
      date,
      projectName,
      groupName,
      gstName,
      gstNo,
      incharge,
      phone,
      address,
      stateStr: r[12],
      cityStr: r[13],
      pincodeStr: r[14],
      items: []
    };
    groupMap.set(key, groupObj);
    groups.push(groupObj);
  }
  
  groupMap.get(key).items.push({
    product: r[15],
    size: r[16],
    capacity: r[17],
    qty: r[18],
    spec: r[19],
    unitPrice: r[20],
    subTotal: r[21],
    gst: r[22],
    gstAmount: r[23],
    discount: r[24],
    grandTotal: r[25]
  });
});

console.log('Total Distinct Transactions (Groups):', groups.length);
groups.forEach((g, i) => {
  console.log(`[#${i+1}] ${g.date} | ${g.projectName} (Phone: ${g.phone}, GST: ${g.gstNo}) -> ${g.items.length} item(s)`);
});
