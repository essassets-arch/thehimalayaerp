const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

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

async function run() {
  const csvPath = 'd:\\prototype-next-main\\hussain_sir(super_sales1) (2).csv';
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found');
    return;
  }
  
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const headers = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);
  
  const products = await prisma.product.findMany();
  console.log(`Loaded ${products.length} products from database.`);
  
  // Helper to normalize strings for comparison
  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const unmatched = new Set();
  const matched = [];
  
  for (let idx = 0; idx < dataRows.length; idx++) {
    const row = dataRows[idx];
    if (row.length < headers.length) {
      // Skip empty or malformed rows
      continue;
    }
    
    const rowObj = {};
    headers.forEach((h, i) => {
      rowObj[h] = row[i] ? row[i].trim() : '';
    });
    
    // Skip empty lines (all empty fields)
    if (!rowObj.project_name && !rowObj.PRODUCT && !rowObj.SIZE) {
      continue;
    }
    
    const prodType = rowObj.PRODUCT || '';
    const size = rowObj.SIZE || '';
    const capacity = rowObj.CAPCITY || '';
    
    if (!prodType && !size) continue;
    
    // Attempt matching
    // Let's create search terms: e.g. "mhc", "600x600", "b125"
    const sizeNorm = size.toLowerCase().replace(/\s+/g, '');
    const typeNorm = prodType.toLowerCase().replace(/\s+/g, '');
    const capNorm = capacity.toLowerCase().replace(/\s+/g, '');
    
    let candidates = products;
    
    // 1. Filter by SKU / Name containing normalized size (e.g. "600x600" or "600*600" or "600mm" or "900dai" or "900mm")
    let sizeSearch = sizeNorm;
    if (sizeSearch.includes('dai')) sizeSearch = sizeSearch.replace('dai', 'dia');
    
    // Try to match SKU or name
    let found = products.find(p => {
      const pSkuNorm = p.sku.toLowerCase();
      const pNameNorm = p.name.toLowerCase();
      
      // Match size
      if (!pSkuNorm.includes(sizeSearch) && !pNameNorm.includes(sizeSearch)) {
        // Maybe size is like "12x12" and SKU has "12X12"
        return false;
      }
      // Match product type
      if (!pSkuNorm.includes(typeNorm) && !pNameNorm.includes(typeNorm)) {
        return false;
      }
      // Match capacity
      if (capNorm && !pSkuNorm.includes(capNorm) && !pNameNorm.includes(capNorm)) {
        return false;
      }
      return true;
    });
    
    if (found) {
      matched.push({ rowObj, found });
    } else {
      unmatched.add(`${prodType} | ${size} | ${capacity}`);
    }
  }
  
  console.log(`Matched: ${matched.length} rows`);
  console.log(`Unmatched unique product rows: ${unmatched.size}`);
  if (unmatched.size > 0) {
    console.log('Unmatched products list:');
    console.log(Array.from(unmatched).slice(0, 50));
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
