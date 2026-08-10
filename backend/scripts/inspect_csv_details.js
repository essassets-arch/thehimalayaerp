const fs = require('fs');
const path = require('path');

function parseCsvStrict(content) {
  const records = [];
  let currentRecord = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];
    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        currentField += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
    } else if (char === ',' && !inQuotes) {
      currentRecord.push(currentField);
      currentField = '';
      i++;
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++;
      currentRecord.push(currentField);
      currentField = '';
      if (currentRecord.length > 1 || currentRecord[0] !== '') {
        records.push(currentRecord);
      }
      currentRecord = [];
      i++;
    } else {
      currentField += char;
      i++;
    }
  }

  if (currentField !== '' || currentRecord.length > 0) {
    currentRecord.push(currentField);
    records.push(currentRecord);
  }

  const rawHeaders = records[0].map(h => h.trim().replace(/^"/, '').replace(/"$/, ''));
  const rows = [];

  for (let r = 1; r < records.length; r++) {
    const rec = records[r];
    if (rec.length < rawHeaders.length) continue;
    const rowObj = {};
    rawHeaders.forEach((h, idx) => {
      let val = rec[idx] !== undefined ? rec[idx] : '';
      if (val === 'NULL' || val === 'null') val = null;
      rowObj[h] = val;
    });
    rows.push(rowObj);
  }

  return { headers: rawHeaders, rows };
}

function main() {
  const csvPath = path.join(__dirname, '../../leads.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const { rows } = parseCsvStrict(content);

  console.log('======================================================================');
  console.log(' 🔍 LEADS.CSV COMPLETE CODE & UUID INVENTORY');
  console.log('======================================================================\n');

  const groups = {};
  rows.forEach(r => {
    const code = (r.contactPerson || 'EMPTY').trim();
    const execId = r.salesExecutiveId || r.assignedToId;
    groups[code] = groups[code] || { count: 0, uuid: execId, companies: [] };
    groups[code].count++;
    if (groups[code].companies.length < 5) {
      groups[code].companies.push(`${r.leadNumber} (${r.companyName})`);
    }
  });

  Object.entries(groups).forEach(([code, info]) => {
    console.log(`Code "${code}": ${info.count} leads | UUID: ${info.uuid}`);
    console.log(`  Samples: ${info.companies.join(', ')}`);
    console.log('');
  });
}

main();
