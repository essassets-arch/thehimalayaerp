const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
          itemCode = `${itemCode}-B`;
        }
        seenSkus.add(itemCode);
        items.push({ srNo, itemCode, itemName, unit });
      }
    }
  }
  return items;
}

async function importLocal() {
  const items = getCleanItems();
  const dbs = [
    { name: 'Docker PostgreSQL (Port 5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
    { name: 'Local Test DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' }
  ];

  for (const db of dbs) {
    console.log(`\nImporting to ${db.name}...`);
    try {
      const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
      await prisma.$connect();

      const company = await prisma.company.findFirst();
      const companyId = company?.id || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

      let count = 0;
      for (const item of items) {
        const randomId = crypto.randomBytes(5).toString('hex');
        await prisma.rawMaterial.upsert({
          where: { sku: item.itemCode },
          update: {
            name: item.itemName,
            unit: item.unit,
            category: 'Raw Material',
            storageLocation: 'Raw Material Store'
          },
          create: {
            publicId: `RM-${randomId}`,
            companyId,
            name: item.itemName,
            sku: item.itemCode,
            category: 'Raw Material',
            unit: item.unit,
            minimumStock: 0,
            storageLocation: 'Raw Material Store'
          }
        });
        count++;
      }
      console.log(`  ✓ Successfully upserted ${count} items into ${db.name}`);
      await prisma.$disconnect();
    } catch (e) {
      console.error(`  ❌ Failed for ${db.name}:`, e.message);
    }
  }
}

importLocal().catch(console.error);
