const fs = require('fs');
const path = require('path');

function getCleanItems() {
  const content = fs.readFileSync(path.resolve(__dirname, '../store (2) (1).csv'), 'utf8');
  const lines = content.split(/\r?\n/);

  const items = [];
  const seenSkus = new Set();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith(',,,') || rawLine.startsWith('STORE INVENTORY') || rawLine.startsWith('SR NO')) {
      continue;
    }

    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        if (inQuotes && rawLine[c + 1] === '"') {
          current += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());

    if (parts.length >= 4 && parts[1] && parts[2]) {
      const srNo = parseInt(parts[0], 10);
      let itemCode = parts[1].trim();
      let itemName = parts[2].replace(/^"+|"+$/g, '').trim();
      let unit = parts[3].replace(/^"+|"+$/g, '').trim();

      itemName = itemName
        .replace(/\uFFFD/g, '-')
        .replace(/\(TiO\?\)/g, '(TiO2)')
        .replace(/\(CaSO\?.*H\?O\)/g, '(CaSO4·½H2O)')
        .replace(/\(5m$/g, '(5m)')
        .replace(/\(3m$/g, '(3m)')
        .replace(/\s+/g, ' ')
        .trim();

      unit = unit
        .replace(/BRL'/g, 'BRL')
        .replace(/BRL\(200LTR\)/g, 'BRL (200 LTR)')
        .toUpperCase()
        .trim();
      if (unit === 'KGS') unit = 'KG';
      if (unit === 'NOS') unit = 'PCS';

      if (itemCode.startsWith('HM')) {
        if (seenSkus.has(itemCode)) {
          // If duplicate SKU like row 187 (HM186 bear disc 80), suffix with -B
          itemCode = `${itemCode}-B`;
        }
        seenSkus.add(itemCode);
        items.push({ srNo, itemCode, itemName, unit });
      }
    }
  }
  return items;
}

async function importAll() {
  console.log('Logging into https://thehimalaya.cloud...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  if (!token) throw new Error('Could not log in to cloud');
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  const items = getCleanItems();
  console.log(`Starting import of ${items.length} items to https://thehimalaya.cloud...`);

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  // Batch in concurrency of 5 for speed and reliability
  const concurrency = 5;
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (item) => {
      try {
        const payload = {
          name: item.itemName,
          sku: item.itemCode,
          category: 'Raw Material',
          productType: 'RAW_MATERIAL',
          unit: item.unit,
          minimumStock: 0,
          storageLocation: 'Raw Material Store'
        };

        const res = await fetch('https://thehimalaya.cloud/api/v1/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (res.ok && json.success) {
          successCount++;
        } else {
          failCount++;
          errors.push({ item: item.itemCode, error: json.error || json.message });
        }
      } catch (err) {
        failCount++;
        errors.push({ item: item.itemCode, error: err.message });
      }
    }));
    process.stdout.write(`\rImported ${successCount}/${items.length} items... (failed: ${failCount})`);
  }

  console.log(`\n\nImport complete!`);
  console.log(`✓ Successfully imported: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
    console.log('Errors sample:', errors.slice(0, 5));
  }
}

importAll().catch(console.error);
