const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');
const latestFile = path.join(backupsDir, 'himalaya_erp_backup_20260905_113045.sql.gz');

async function simulateFrontend() {
  const fileStream = fs.createReadStream(latestFile);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  let currentTable = null;
  let currentColumns = [];

  const rawLeads = [];
  const rawQuotes = [];
  const rawOrders = [];
  const ss1UserId = 'b1515d86-b153-406c-93da-5d50748b7e75';

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

      if (currentTable === 'Lead' && (obj.createdById === ss1UserId || obj.assignedToId === ss1UserId)) {
        rawLeads.push(obj);
      } else if (currentTable === 'Quotation' && obj.createdById === ss1UserId) {
        rawQuotes.push(obj);
      } else if (currentTable === 'SalesOrder' && obj.createdById === ss1UserId) {
        rawOrders.push(obj);
      }
    }
  }

  // Exact reproduction of DashboardView getCreatedAtDate and isTimeWithinFilter
  const getCreatedAtDate = (item) => {
    if (!item) return null;
    let rawDate = 
      item?.createdAt || 
      item?.leadDate || 
      item?.quotationDate || 
      item?.orderDate || 
      item?.date || 
      item?.confirmedAt || 
      item?.approvedAt || 
      item?.created_at || 
      item?.updatedAt || 
      item?.followUpDate ||
      (Array.isArray(item?.timeline) && item.timeline[0]?.date) ||
      (item?._raw && (item?._raw?.created_at || item?._raw?.createdAt));
    if (!rawDate || rawDate === '\\N') return null;
    
    try {
      if (typeof rawDate === 'number') return new Date(rawDate);
      if (typeof rawDate === 'string') {
        const trimmed = rawDate.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return new Date(trimmed + 'T00:00:00');
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) return parsed;
      }
      if (rawDate instanceof Date && !isNaN(rawDate.getTime())) return rawDate;
      const parsed = new Date(rawDate);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch (err) {
      return null;
    }
  };

  const isTimeWithinFilter = (itemTime, timeFilter) => {
    if (!itemTime) return true;
    const now = new Date('2026-09-05T17:50:00.000Z');
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    switch (timeFilter) {
      case 'Today': return itemTime >= todayStart && itemTime <= todayStart + 86400000;
      case 'This Week': return itemTime >= startOfWeek && itemTime <= startOfWeek + (7 * 86400000);
      case 'This Month': {
        const start = startOfMonth;
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime() + 86400000;
        return itemTime >= start && itemTime <= end;
      }
      case 'This Year': {
        const start = startOfYear;
        const end = new Date(now.getFullYear(), 11, 31).getTime() + 86400000;
        return itemTime >= start && itemTime <= end;
      }
      case 'All Time':
      default: return true;
    }
  };

  console.log('Total Leads:', rawLeads.length);
  console.log('Total Quotes:', rawQuotes.length);
  console.log('Total Orders:', rawOrders.length);

  ['Today', 'This Week', 'This Month', 'This Year', 'All Time'].forEach(tf => {
    const fLeads = rawLeads.filter(l => {
      const d = getCreatedAtDate(l);
      return d && isTimeWithinFilter(d.getTime(), tf);
    });
    const fQuotes = rawQuotes.filter(q => {
      const d = getCreatedAtDate(q);
      return d && isTimeWithinFilter(d.getTime(), tf);
    });
    const fOrders = rawOrders.filter(o => {
      const d = getCreatedAtDate(o);
      return d && isTimeWithinFilter(d.getTime(), tf);
    });

    console.log(`\n[TimeFilter = ${tf}]:`);
    console.log(`  Filtered Leads:  ${fLeads.length}`);
    console.log(`  Filtered Quotes: ${fQuotes.length}`);
    console.log(`  Filtered Orders: ${fOrders.length}`);
  });
}

simulateFrontend().catch(console.error);
