const fs = require('fs');

async function testProductMatching() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const prodRes = await fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', { headers });
  const prodJson = await prodRes.json();
  const products = Array.isArray(prodJson.data) ? prodJson.data : (prodJson.data?.data || []);
  console.log(`Loaded ${products.length} products from live database.`);

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
          if (text[i + 1] === '"') {
            currentField += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          currentRow.push(currentField.trim());
          currentField = '';
        } else if (char === '\n' || char === '\r') {
          currentRow.push(currentField.trim());
          currentField = '';
          if (currentRow.length > 1) rows.push(currentRow);
          currentRow = [];
          if (char === '\r' && text[i + 1] === '\n') i++;
        } else {
          currentField += char;
        }
      }
    }
    if (currentRow.length > 1 || currentField) {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
    }
    return { header, rows };
  }

  const { rows } = parseCSV(raw);
  console.log(`Checking ${rows.length} items from CSV...`);

  // Product normalization helper
  function findMatchingProduct(prodType, size, grade) {
    let t = (prodType || '').trim().toUpperCase().replace(/\s+/g, ' ');
    if (t === 'D MHC') t = 'MHC';
    let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
    let g = (grade || '').trim().toUpperCase();
    if (g === '3T') g = 'LD'; // 3T is standard Light Duty (LD / B125)

    // Normalize size mm
    // e.g. 10X10, 600X600, 600X600X32, 28X28, 750X750
    const norm = (str) => (str || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

    const targetPattern1 = norm(`${t}${s}${g}`);
    const targetPattern2 = norm(`HIMALAYAFRP${t}${s}${g}`);

    for (const p of products) {
      const pSkuNorm = norm(p.sku);
      const pNameNorm = norm(p.name);
      if (pSkuNorm === targetPattern1 || pSkuNorm === targetPattern2) return p;
      if (pNameNorm === targetPattern1 || pNameNorm === targetPattern2) return p;
    }

    // Partial search
    for (const p of products) {
      const pSkuNorm = norm(p.sku);
      const pNameNorm = norm(p.name);
      if (pSkuNorm.includes(norm(t)) && pSkuNorm.includes(norm(s)) && pSkuNorm.includes(norm(g))) return p;
      if (pNameNorm.includes(norm(t)) && pNameNorm.includes(norm(s)) && pNameNorm.includes(norm(g))) return p;
    }

    return null;
  }

  const unmatched = [];
  const matchedMap = new Map();

  for (const r of rows) {
    const prodType = r[15];
    const size = r[16];
    const grade = r[17];
    const key = `${prodType} | ${size} | ${grade}`;
    if (!matchedMap.has(key)) {
      const p = findMatchingProduct(prodType, size, grade);
      if (p) {
        matchedMap.set(key, { matched: true, product: p });
      } else {
        matchedMap.set(key, { matched: false });
        unmatched.push(key);
      }
    }
  }

  console.log(`Unique product specs: ${matchedMap.size}`);
  console.log(`Matched specs: ${matchedMap.size - unmatched.length}`);
  console.log(`Unmatched specs: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('Unmatched items:', unmatched);
  } else {
    console.log('All product specifications successfully matched!');
  }
}

testProductMatching().catch(console.error);
