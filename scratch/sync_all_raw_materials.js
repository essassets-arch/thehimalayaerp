const fs = require('fs');
const path = require('path');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function loadCsvData() {
  const csvPath = path.resolve(__dirname, '../Raw_Material_Inventory_Export_2026-08-18.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  const rawItems = lines.slice(1).map(line => {
    const parts = parseCsvLine(line);
    return {
      code: parts[0].trim(),
      name: parts[1].trim(),
      category: parts[2].trim() || 'Raw Material',
      unit: parts[3].trim() || 'PCS',
      currentStock: Number(parts[4]) || 0,
      minStock: Number(parts[5]) || 0,
      reorderLevel: Number(parts[6]) || 0,
      unitRate: Number(parts[7]) || 0,
      totalStockValue: Number(parts[8]) || 0,
      stockStatus: parts[9].trim(),
      fsnVelocity: parts[10].trim(),
      storageLocation: parts[11].trim() || 'Raw Material Store',
    };
  });

  // Sort numerically so HM001 comes first
  rawItems.sort((a, b) => {
    const numA = parseInt(a.code.replace('HM', '').replace('-B', ''), 10);
    const numB = parseInt(b.code.replace('HM', '').replace('-B', ''), 10);
    if (numA !== numB) return numA - numB;
    return a.code.localeCompare(b.code);
  });

  return rawItems;
}

async function runSync() {
  console.log('=== SYNCING RAW MATERIALS TO THEHIMALAYA.CLOUD ===\n');

  const items = loadCsvData();
  console.log(`Loaded ${items.length} master materials from CSV.`);

  // 1. Login
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  if (!loginRes.ok) throw new Error(`Login failed with status ${loginRes.status}`);
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  if (!token) throw new Error('No access token returned from login');
  console.log('✅ Authenticated successfully as super.admin@himalayaerp.com');

  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  // 2. Clear old/stale raw materials to start with pristine state
  console.log('\n🧹 Clearing any previous raw materials & dummy items...');
  const clearRes = await fetch('https://thehimalaya.cloud/api/v1/products/raw-materials/clear-all', {
    method: 'DELETE',
    headers
  });
  console.log(`Clear status: ${clearRes.status}`);

  // 3. Sync materials with batching
  console.log(`\n📦 Importing ${items.length} materials into https://thehimalaya.cloud/store/raw-inventory...`);
  const BATCH_SIZE = 5;
  let successCount = 0;
  let txCount = 0;
  let failCount = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (item) => {
      try {
        const matRes = await fetch('https://thehimalaya.cloud/api/v1/inventory/raw-materials', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            code: item.code,
            material: item.name,
            category: item.category,
            unit: item.unit,
            minimumStock: item.minStock,
            storageLocation: item.storageLocation
          })
        });

        if (!matRes.ok) {
          const errText = await matRes.text();
          console.error(`❌ Failed to create ${item.code}: ${matRes.status} - ${errText}`);
          failCount++;
          return;
        }

        const matData = (await matRes.json()).data;
        successCount++;

        // If material has current stock > 0, record opening stock transaction
        if (item.currentStock > 0) {
          const txRes = await fetch('https://thehimalaya.cloud/api/v1/inventory/transactions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              productId: matData.id,
              type: 'IN',
              quantity: item.currentStock,
              referenceType: 'OPENING_STOCK',
              referenceId: 'MASTER_INVENTORY_IMPORT'
            })
          });

          if (!txRes.ok) {
            console.error(`⚠️ Failed to record stock for ${item.code}: ${txRes.status}`);
          } else {
            txCount++;
          }
        }
      } catch (err) {
        console.error(`❌ Error importing ${item.code}:`, err.message);
        failCount++;
      }
    }));

    if ((i + BATCH_SIZE) % 25 === 0 || i + BATCH_SIZE >= items.length) {
      console.log(`  Progress: ${Math.min(i + BATCH_SIZE, items.length)} / ${items.length} materials processed...`);
    }
  }

  console.log(`\n🎉 IMPORT FINISHED!`);
  console.log(`  - Successfully imported materials: ${successCount}`);
  console.log(`  - Stock transactions created: ${txCount}`);
  console.log(`  - Failures: ${failCount}`);

  // 4. Validate snapshot
  console.log('\n🔍 Verifying raw material snapshot from live API...');
  const snapRes = await fetch('https://thehimalaya.cloud/api/backend/inventory/raw-material-snapshot', { headers });
  const snapJson = await snapRes.json();
  const snapItems = snapJson.data || [];
  console.log(`✅ Live snapshot returned: ${snapItems.length} materials`);

  let inStockCount = 0;
  let outOfStockCount = 0;
  let totalQuantity = 0;

  for (const s of snapItems) {
    totalQuantity += (s.quantity || 0);
    if ((s.quantity || 0) > 0) inStockCount++;
    else outOfStockCount++;
  }

  console.log(`  - In Stock: ${inStockCount}`);
  console.log(`  - Out of Stock: ${outOfStockCount}`);
  console.log(`  - Total Stock Quantity across all items: ${totalQuantity}`);
  console.log(`\nFirst 5 materials in live snapshot:`);
  console.log(snapItems.slice(0, 5).map(m => `  [${m.sku}] ${m.name} - ${m.quantity} ${m.unit} (${m.stockStatus})`).join('\n'));
  console.log(`\nLast 5 materials in live snapshot:`);
  console.log(snapItems.slice(-5).map(m => `  [${m.sku}] ${m.name} - ${m.quantity} ${m.unit} (${m.stockStatus})`).join('\n'));
}

runSync().catch(console.error);
