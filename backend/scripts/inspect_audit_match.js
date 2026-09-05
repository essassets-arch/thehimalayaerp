const fs = require('fs');

function parseCSV(content) {
  const lines = content.replace(/\r/g, '').split('\n');
  const rows = [];
  let inQuotes = false, currentCell = '', currentRow = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') { currentCell += '"'; c++; }
        else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    if (!inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += '\n';
    }
  }
  return rows;
}

const auditRows = parseCSV(fs.readFileSync('backend/scripts/delivery_history_audit_2026-09-05 (2).csv', 'utf8')).slice(1);
const ss1Rows = parseCSV(fs.readFileSync('backend/scripts/hussain_sir(super_sales1) (6).csv', 'utf8')).slice(1).filter(r => r.length > 5 && r[0]);

const groups = [];
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
      index: groups.length + 1,
      key,
      date,
      proj,
      grp,
      gstName,
      customerName: gstName || proj || grp || `Customer ${groups.length + 1}`,
      items: [r]
    };
    groups.push(currentGroup);
  } else {
    currentGroup.items.push(r);
  }
}

const auditItems = auditRows.map(r => ({
  dispNo: r[0],
  soNo: r[1],
  cust: r[2],
  addr: r[3],
  receiver: r[4],
  receiverPhone: r[5],
  driver: r[6],
  vehicle: r[7],
  transporter: r[8],
  deliveredAt: r[9],
  podUrl: r[10]
}));

console.log('Total groups:', groups.length);
console.log('Total audit items:', auditItems.length);

// Assign 1 audit item per matching group
const groupAssignments = new Array(groups.length).fill(null);
const assignedAuditIndices = new Set();

// Pass 1: Try exact soNo match if soNo exists in format HCPPL/2627/XXXX
for (let gIdx = 0; gIdx < groups.length; gIdx++) {
  const seqStr = String(gIdx + 1).padStart(4, '0');
  const expectedSoNo = `HCPPL/2627/${seqStr}`;
  const aIdx = auditItems.findIndex((a, idx) => !assignedAuditIndices.has(idx) && a.soNo === expectedSoNo);
  if (aIdx !== -1) {
    groupAssignments[gIdx] = auditItems[aIdx];
    assignedAuditIndices.add(aIdx);
  }
}
console.log(`Pass 1 (exact SO No match): assigned ${assignedAuditIndices.size} of 49`);

// Pass 2: Customer Name match
for (let gIdx = 0; gIdx < groups.length; gIdx++) {
  if (groupAssignments[gIdx]) continue;
  const g = groups[gIdx];
  const c1 = (g.gstName || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const c2 = (g.proj || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const c3 = (g.grp || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  const aIdx = auditItems.findIndex((a, idx) => {
    if (assignedAuditIndices.has(idx)) return false;
    const cleanA = a.cust.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    return c1 === cleanA || c2 === cleanA || c3 === cleanA ||
           (c1 && cleanA.includes(c1)) || (c1 && c1.includes(cleanA)) ||
           (c2 && cleanA.includes(c2)) || (c2 && c2.includes(cleanA));
  });

  if (aIdx !== -1) {
    groupAssignments[gIdx] = auditItems[aIdx];
    assignedAuditIndices.add(aIdx);
  }
}
console.log(`Pass 2 (Customer name match): assigned ${assignedAuditIndices.size} of 49`);

// Pass 3: If any remaining unassigned audit items, assign them to remaining unassigned groups
if (assignedAuditIndices.size < auditItems.length) {
  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    if (groupAssignments[gIdx]) continue;
    const aIdx = auditItems.findIndex((a, idx) => !assignedAuditIndices.has(idx));
    if (aIdx !== -1) {
      groupAssignments[gIdx] = auditItems[aIdx];
      assignedAuditIndices.add(aIdx);
    }
  }
}
console.log(`Final total assigned audit items: ${assignedAuditIndices.size} of ${auditItems.length}`);
console.log(`Total groups with DELIVERED + POD: ${groupAssignments.filter(x => x !== null).length}`);
console.log(`Total groups with PENDING_DISPATCH: ${groupAssignments.filter(x => x === null).length}`);
