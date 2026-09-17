const fs = require('fs');
const path = require('path');

function generateTradingMigration() {
  const products = require('./clean_trading_products.json');
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

  let seedSql = `-- Seed ${products.length} Trading (Dispatch 2 - Sahad Dispatch) Products\n`;
  for (const p of products) {
    const safeName = p.name.replace(/'/g, "''");
    const safeSku = p.sku.replace(/'/g, "''");
    const safeCategory = p.category.replace(/'/g, "''");
    const safeUnit = p.unit.replace(/'/g, "''");
    const safeHsn = p.hsnCode.replace(/'/g, "''");
    const safeVariant = (p.variantDetails || '').replace(/'/g, "''");

    seedSql += `INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")\n`;
    seedSql += `VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '${companyId}', '${safeName}', '${safeSku}', '${safeName}', '${safeCategory}', 'TRADING', 'HIMALAYA', 'D2', 18, '${safeHsn}', '${safeVariant}', '${safeUnit}', 0, 0, 1, 1, '${safeCategory}', true, 1, NOW(), NOW())\n`;
    seedSql += `ON CONFLICT ("publicId") DO NOTHING;\n\n`;
  }

  const migrationDir = path.resolve(__dirname, '../backend/prisma/migrations/20260916202000_seed_trading_products');
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }

  const migrationFile = path.join(migrationDir, 'migration.sql');
  fs.writeFileSync(migrationFile, seedSql, 'utf8');
  console.log(`✓ Created migration at: ${migrationFile} (${products.length} products)`);
}

generateTradingMigration();
