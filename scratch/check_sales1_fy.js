const fs = require('fs');

const raw = fs.readFileSync('d:\\prototype-next-main\\JP_data(sales1) (1).csv', 'utf8');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = lines[0];
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  while (text[i] !== '\n' && text[i] !== '\r' && i < text.length) i++;
  if (text[i] === '\r') i++;
  if (text[i] === '\n') i++;

  for (; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { currentField += '"'; i++; }
        else { inQuotes = false; }
      } else { currentField += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { currentRow.push(currentField.trim()); currentField = ''; }
      else if (char === '\n' || char === '\r') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.length > 1) rows.push(currentRow);
        currentRow = [];
        if (char === '\r' && text[i + 1] === '\n') i++;
      } else { currentField += char; }
    }
  }
  if (currentRow.length > 1 || currentField) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  return { header, rows };
}

const { rows } = parseCSV(raw);

function getFinancialYear(dateStr) {
  // Format DD-MM-YYYY
  const parts = dateStr.split('-');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (month >= 4) {
    const nextY = String(year + 1).slice(-2);
    return `${String(year).slice(-2)}${nextY}`;
  } else {
    const prevY = String(year - 1).slice(-2);
    return `${prevY}${String(year).slice(-2)}`;
  }
}

const ordersMap = new Map();
rows.forEach((r, idx) => {
  const leadDate = r[0];
  const projectName = r[1];
  const mobile = r[6];
  const key = `${leadDate}|${projectName}|${mobile}`;

  if (!ordersMap.has(key)) {
    ordersMap.set(key, {
      leadDate,
      fy: getFinancialYear(leadDate),
      projectName,
      items: []
    });
  }
  ordersMap.get(key).items.push(r);
});

const fyDistribution = {};
for (const [k, o] of ordersMap.entries()) {
  fyDistribution[o.fy] = (fyDistribution[o.fy] || 0) + 1;
}

console.log(`Orders per Financial Year:`, fyDistribution);
for (const [k, o] of ordersMap.entries()) {
  if (o.fy !== '2627') {
    console.log(`Non-2627 Order: Date=${o.leadDate} FY=${o.fy} Project=${o.projectName}`);
  }
}
