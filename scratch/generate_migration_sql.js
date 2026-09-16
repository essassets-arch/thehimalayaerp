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

function generateMigrationSql() {
  const items = getCleanItems();
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

  let sql = `-- Seed new 212 store inventory raw materials\n`;
  for (const it of items) {
    const safeName = it.itemName.replace(/'/g, "''");
    const safeSku = it.itemCode.replace(/'/g, "''");
    const safeUnit = it.unit.replace(/'/g, "''");
    sql += `INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")\n`;
    sql += `VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '${companyId}', '${safeName}', '${safeSku}', 'Raw Material', '${safeUnit}', 0, 'Raw Material Store', true, 1, NOW(), NOW())\n`;
    sql += `ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";\n\n`;
  }

  const dir = path.resolve(__dirname, '../backend/prisma/migrations/20260916193500_seed_store_inventory_materials');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'migration.sql'), sql, 'utf8');
  console.log(`Generated migration SQL with ${items.length} items at: ${dir}`);
}

generateMigrationSql();
