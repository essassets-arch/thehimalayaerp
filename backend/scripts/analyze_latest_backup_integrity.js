const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');
const latestFile = path.join(backupsDir, 'himalaya_erp_backup_20260905_113045.sql.gz');

async function checkIntegrity() {
  const fileStream = fs.createReadStream(latestFile);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  let currentTable = null;
  let currentColumns = [];

  const leadNums = [];
  const quoteNums = [];
  const orderNums = [];
  const idSeq = {};

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

      if (currentTable === 'Lead') {
        leadNums.push(obj.leadNumber);
      } else if (currentTable === 'Quotation') {
        quoteNums.push(obj.quotationNumber);
      } else if (currentTable === 'SalesOrder') {
        orderNums.push(obj.orderNumber);
      } else if (currentTable === 'IdSequence') {
        idSeq[obj.key] = parseInt(obj.nextValue, 10);
      }
    }
  }

  function analyzeSequence(name, list, seqKey) {
    console.log(`\n=================== ${name} ===================`);
    console.log(`Total count: ${list.length}`);
    
    // Check duplicates
    const counts = {};
    list.forEach(n => {
      counts[n] = (counts[n] || 0) + 1;
    });
    const duplicates = Object.entries(counts).filter(([k, v]) => v > 1);
    console.log(`Duplicate numbers: ${duplicates.length ? JSON.stringify(duplicates) : 'None (0 duplicates)'}`);

    // Parse numeric parts
    const parsed = [];
    const invalidFormats = [];
    list.forEach(n => {
      const match = n.match(/^(?:LEAD|QU|QUOT|HCPPL|ORD)\/(\d{4})\/(\d+)$/);
      if (match) {
        parsed.push({ num: n, fy: match[1], seq: parseInt(match[2], 10) });
      } else {
        invalidFormats.push(n);
      }
    });

    console.log(`Invalid formats: ${invalidFormats.length ? JSON.stringify(invalidFormats) : 'None'}`);

    if (parsed.length > 0) {
      parsed.sort((a, b) => a.seq - b.seq);
      const minSeq = parsed[0].seq;
      const maxSeq = parsed[parsed.length - 1].seq;
      console.log(`Min sequence: ${minSeq} (${parsed[0].num})`);
      console.log(`Max sequence: ${maxSeq} (${parsed[parsed.length - 1].num})`);

      // Check gaps
      const seqSet = new Set(parsed.map(p => p.seq));
      const gaps = [];
      for (let i = minSeq; i <= maxSeq; i++) {
        if (!seqSet.has(i)) gaps.push(i);
      }
      console.log(`Sequence gaps count: ${gaps.length} (out of ${maxSeq - minSeq + 1} range)`);
      if (gaps.length > 0 && gaps.length <= 20) {
        console.log(`Gaps: ${gaps.join(', ')}`);
      } else if (gaps.length > 20) {
        console.log(`Sample gaps: ${gaps.slice(0, 10).join(', ')} ... ${gaps.slice(-5).join(', ')}`);
      }

      const currentSeqInDb = idSeq[seqKey];
      console.log(`IdSequence key in DB '${seqKey}': nextValue = ${currentSeqInDb}`);
      console.log(`Is DB nextValue > max sequence? ${currentSeqInDb > maxSeq ? 'YES (Safe)' : 'NO - RISK OF COLLISION'}`);
    }
  }

  analyzeSequence('LEAD', leadNums, 'lead_number_2627');
  analyzeSequence('QUOTATION', quoteNums, 'quotation_number_2627');
  analyzeSequence('SALES ORDER', orderNums, 'sales_order_number_2627');
}

checkIntegrity().catch(console.error);
