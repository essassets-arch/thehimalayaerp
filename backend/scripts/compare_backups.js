const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');

const backupFiles = [
  'himalaya_erp_backup_20260905_090751.sql.gz',
  'himalaya_erp_backup_20260905_091151.sql.gz',
  'himalaya_erp_backup_20260905_091212.sql.gz',
  'himalaya_erp_backup_20260905_091844.sql.gz',
  'himalaya_erp_backup_20260905_091933.sql.gz',
  'himalaya_erp_backup_20260905_095553.sql.gz',
  'himalaya_erp_backup_20260905_100419.sql.gz',
  'himalaya_erp_backup_20260905_101223.sql.gz',
  'himalaya_erp_backup_20260905_111843.sql.gz',
  'himalaya_erp_backup_20260905_113045.sql.gz'
];

async function inspectBackup(fileName) {
  const filePath = path.join(backupsDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return null;
  }

  const fileStream = fs.createReadStream(filePath);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  const stats = {
    fileName,
    tableRowCounts: {},
    idSequences: [],
    sampleLeadNumbers: [],
    sampleQuotationNumbers: [],
    sampleOrderNumbers: [],
    leadCount: 0,
    quotationCount: 0,
    salesOrderCount: 0,
    userCount: 0,
  };

  let currentTable = null;

  for await (const line of rl) {
    // Check for COPY table_name (Postgres dump format) or INSERT INTO (MySQL/Postgres)
    const copyMatch = line.match(/^COPY public\."?([a-zA-Z0-9_]+)"?\s*\((.*)\)\s*FROM stdin;/i);
    const insertMatch = line.match(/^INSERT INTO `?([a-zA-Z0-9_]+)`?/i);

    if (copyMatch) {
      currentTable = copyMatch[1];
      stats.tableRowCounts[currentTable] = 0;
      continue;
    }

    if (line === '\\.' && currentTable) {
      currentTable = null;
      continue;
    }

    if (currentTable) {
      stats.tableRowCounts[currentTable] = (stats.tableRowCounts[currentTable] || 0) + 1;

      if (currentTable.toLowerCase() === 'idsequence') {
        const parts = line.split('\t');
        stats.idSequences.push(parts);
      } else if (currentTable.toLowerCase() === 'lead') {
        stats.leadCount++;
        const parts = line.split('\t');
        // Let's capture some sample lead numbers or IDs
        if (stats.sampleLeadNumbers.length < 5) {
          stats.sampleLeadNumbers.push(parts[1] || parts[0]); // lead number is usually col 1 or 2
        }
      } else if (currentTable.toLowerCase() === 'quotation') {
        stats.quotationCount++;
        const parts = line.split('\t');
        if (stats.sampleQuotationNumbers.length < 5) {
          stats.sampleQuotationNumbers.push(parts[1] || parts[0]);
        }
      } else if (currentTable.toLowerCase() === 'salesorder') {
        stats.salesOrderCount++;
        const parts = line.split('\t');
        if (stats.sampleOrderNumbers.length < 5) {
          stats.sampleOrderNumbers.push(parts[1] || parts[0]);
        }
      } else if (currentTable.toLowerCase() === 'user') {
        stats.userCount++;
      }
    }
  }

  return stats;
}

async function run() {
  console.log('Analyzing 10 backups...');
  const results = [];
  for (const f of backupFiles) {
    const res = await inspectBackup(f);
    if (res) results.push(res);
  }

  console.log('\n--- BACKUP COMPARISON TABLE ---');
  console.table(results.map(r => ({
    File: r.fileName.replace('himalaya_erp_backup_20260905_', ''),
    Leads: r.tableRowCounts['Lead'] || r.tableRowCounts['lead'] || 0,
    Quotations: r.tableRowCounts['Quotation'] || r.tableRowCounts['quotation'] || 0,
    SalesOrders: r.tableRowCounts['SalesOrder'] || r.tableRowCounts['sales_orders'] || 0,
    Users: r.tableRowCounts['User'] || r.tableRowCounts['users'] || 0,
    Customers: r.tableRowCounts['Customer'] || r.tableRowCounts['customers'] || 0,
    IdSequences: (r.idSequences || []).length
  })));

  console.log('\n--- ID SEQUENCES DUMP (LATEST BACKUP) ---');
  const latest = results[results.length - 1];
  console.log('Latest file:', latest.fileName);
  console.log('IdSequence rows:', latest.idSequences);

  console.log('\n--- ALL TABLES IN LATEST BACKUP ---');
  console.log(latest.tableRowCounts);
}

run().catch(console.error);
