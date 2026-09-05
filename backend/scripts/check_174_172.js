const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');
const latestFile = path.join(backupsDir, 'himalaya_erp_backup_20260905_113045.sql.gz');

async function check174And172() {
  const fileStream = fs.createReadStream(latestFile);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  let currentTable = null;
  let currentColumns = [];

  const rawLeads = [];
  const users = {};

  for await (const line of rl) {
    const copyMatch = line.match(/^COPY public\."?([a-zA-Z0-9_]+)"?\s*\((.*)\)\s*FROM stdin;/i);
    if (copyMatch) {
      currentTable = copyMatch[1];
      currentColumns = copyMatch[2].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      continue;
    }

    if (line === '\\.' && currentTable) {
      currentTable = null;
      currentColumns = [];
      continue;
    }

    if (currentTable) {
      const row = line.split('\t');
      const obj = {};
      currentColumns.forEach((col, i) => {
        obj[col] = row[i];
      });

      if (currentTable === 'User') {
        users[obj.id] = obj.email;
      } else if (currentTable === 'Lead') {
        rawLeads.push(obj);
      }
    }
  }

  const l174 = rawLeads.find(l => l.leadNumber === 'LEAD/2627/0174');
  const l172 = rawLeads.find(l => l.leadNumber === 'LEAD/2627/0172');

  console.log('Lead 174 in 113045 backup:', l174 ? {
    num: l174.leadNumber,
    company: l174.companyName,
    createdById: l174.createdById,
    user: users[l174.createdById],
    deletedAt: l174.deletedAt
  } : 'NOT FOUND');

  console.log('Lead 172 in 113045 backup:', l172 ? {
    num: l172.leadNumber,
    company: l172.companyName,
    createdById: l172.createdById,
    user: users[l172.createdById],
    deletedAt: l172.deletedAt
  } : 'NOT FOUND');

  // How many total leads in 113045 backup?
  console.log('Total leads in 113045 backup:', rawLeads.length);
  const byUser = {};
  rawLeads.forEach(l => {
    const u = users[l.createdById] || users[l.assignedToId] || 'unknown';
    byUser[u] = (byUser[u] || 0) + 1;
  });
  console.log('Leads by user in 113045 backup:', byUser);
}

check174And172().catch(console.error);
