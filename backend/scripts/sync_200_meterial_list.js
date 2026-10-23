const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const csvPath = path.resolve(__dirname, '../../meterial list.csv');
const content = fs.readFileSync(csvPath, 'utf8');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let inQuotes = false;
    let field = '';
    const cols = [];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        if (inQuotes && line[j+1] === '"') {
          field += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        cols.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    cols.push(field.trim());
    if (cols[0]) {
      rows.push({
        code: cols[0].trim(),
        name: cols[1]?.trim() || '',
        unit: cols[2]?.trim() || 'Pcs'
      });
    }
  }
  return rows;
}

const items = parseCSV(content);
console.log(`Loaded ${items.length} materials from meterial list.csv`);

async function syncToCloud() {
  console.log('\n--- Syncing to https://thehimalaya.cloud ---');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data?.accessToken;
  if (!token) throw new Error('Cloud login failed: ' + JSON.stringify(auth));

  let successCount = 0;
  let errorCount = 0;

  // Process in small batches of 10 concurrent requests
  const batchSize = 10;
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    await Promise.all(chunk.map(async (item) => {
      try {
        const res = await fetch('https://thehimalaya.cloud/api/v1/inventory/raw-materials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            code: item.code,
            name: item.name,
            unit: item.unit,
            category: 'Raw Material',
            minimumStock: 0,
            storageLocation: 'Raw Material Store'
          })
        });
        const resData = await res.json();
        if (res.status === 200 || res.status === 201) {
          successCount++;
        } else {
          console.error(`Failed ${item.code}:`, res.status, resData);
          errorCount++;
        }
      } catch (err) {
        console.error(`Error ${item.code}:`, err.message);
        errorCount++;
      }
    }));
  }

  console.log(`Cloud sync finished: ${successCount} succeeded, ${errorCount} failed.`);

  const snapRes = await fetch('https://thehimalaya.cloud/api/v1/inventory/raw-material-snapshot', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const snap = await snapRes.json();
  console.log(`Cloud raw-material-snapshot total materials: ${snap.data?.length}`);
}

async function syncToLocal() {
  console.log('\n--- Syncing to Local Database ---');
  const prisma = new PrismaClient();
  try {
    let company = await prisma.company.findFirst({
      where: {
        OR: [
          { id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015' },
          { publicId: 'HIMALAYA-BROWSER-TEST' },
        ],
      },
    });
    if (!company) {
      company = await prisma.company.findFirst();
    }
    const targetCompanyId = company ? company.id : '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

    let localCount = 0;
    for (const item of items) {
      const rm = await prisma.rawMaterial.upsert({
        where: { sku: item.code },
        update: {
          name: item.name,
          unit: item.unit,
          category: 'Raw Material',
          storageLocation: 'Raw Material Store',
          companyId: targetCompanyId,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          publicId: `RM-${item.code}`,
          companyId: targetCompanyId,
          name: item.name,
          sku: item.code,
          category: 'Raw Material',
          unit: item.unit,
          minimumStock: 0,
          storageLocation: 'Raw Material Store',
          isActive: true
        }
      });

      // Mirror Product
      await prisma.product.upsert({
        where: { id: rm.id },
        update: {
          name: item.name,
          sku: item.code,
          unit: item.unit,
          category: 'Raw Material',
          productType: 'RAW_MATERIAL',
          description: 'Raw Material Store',
          companyId: targetCompanyId,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          id: rm.id,
          publicId: `PROD-${item.code}`,
          companyId: targetCompanyId,
          name: item.name,
          sku: item.code,
          category: 'Raw Material',
          productType: 'RAW_MATERIAL',
          brand: 'HIMALAYA',
          unit: item.unit,
          unitPrice: 0,
          minimumStock: 0,
          isActive: true
        }
      });
      localCount++;
    }
    console.log(`Local sync finished: ${localCount} materials upserted in Local DB.`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await syncToCloud();
  await syncToLocal();
}

main().catch(console.error);
