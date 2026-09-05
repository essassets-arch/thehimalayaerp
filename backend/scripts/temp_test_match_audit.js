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

const auditContent = fs.readFileSync('backend/scripts/delivery_history_audit_2026-09-05 (2).csv', 'utf8');
const auditRows = parseCSV(auditContent).slice(1).filter(r => r.length > 1 && r[0]);

const ss1Content = fs.readFileSync('backend/scripts/hussain_sir(super_sales1) (6).csv', 'utf8');
const ss1Rows = parseCSV(ss1Content).slice(1);

console.log(`Audit CSV rows: ${auditRows.length}`);
console.log(`SS1 CSV line items: ${ss1Rows.length}`);

// Group SS1 rows into 144 transactions
const ss1Groups = [];
let currentGroup = null;

for (let i = 0; i < ss1Rows.length; i++) {
  const r = ss1Rows[i];
  const date = (r[0] || '').trim();
  const proj = (r[1] || '').trim();
  const grp = (r[2] || '').trim();
  const gstName = (r[3] || '').trim();
  const key = date + '|' + proj + '|' + grp + '|' + gstName;

  if (!currentGroup || currentGroup.key !== key) {
    currentGroup = {
      index: ss1Groups.length + 1,
      key,
      date,
      proj,
      grp,
      gstName,
      address: r[11],
      items: [r]
    };
    ss1Groups.push(currentGroup);
  } else {
    currentGroup.items.push(r);
  }
}

console.log(`Grouped SS1 transactions (144 target): ${ss1Groups.length}`);

// Check audit SOs vs SS1 Groups
const auditMap = {};
auditRows.forEach(r => {
  const dispNo = r[0].trim();
  const soNo = r[1].trim();
  const custName = r[2].trim();
  const addr = r[3].trim();
  const receiver = r[4].trim();
  const receiverPhone = r[5].trim();
  const driver = r[6].trim();
  const vehicle = r[7].trim();
  const transporter = r[8].trim();
  const deliveredAt = r[9].trim();
  const podUrl = r[10].trim();
  const status = r[11].trim();

  if (!auditMap[soNo]) auditMap[soNo] = [];
  auditMap[soNo].push({
    dispNo, soNo, custName, addr, receiver, receiverPhone, driver, vehicle, transporter, deliveredAt, podUrl, status
  });
});

console.log(`Unique SOs in audit CSV: ${Object.keys(auditMap).length}`);

// Let's see if customer names in audit match SS1 groups
let matched = 0;
for (const soNo in auditMap) {
  const firstAudit = auditMap[soNo][0];
  const foundGroup = ss1Groups.find(g => 
    g.proj.toLowerCase().includes(firstAudit.custName.toLowerCase()) ||
    firstAudit.custName.toLowerCase().includes(g.proj.toLowerCase()) ||
    g.gstName.toLowerCase().includes(firstAudit.custName.toLowerCase())
  );
  if (foundGroup) {
    matched++;
    console.log(`MATCH: ${soNo} (${firstAudit.custName}) -> SS1 Group #${foundGroup.index} (${foundGroup.proj})`);
  } else {
    console.log(`UNMATCHED: ${soNo} (${firstAudit.custName})`);
  }
}

console.log(`\nMatched ${matched} / ${Object.keys(auditMap).length} audit SOs to SS1 Leads!`);
