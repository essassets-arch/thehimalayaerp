const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationDir = path.join(__dirname, 'prisma/migrations/20260730160000_remove_legacy_brand_analysis');
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

const command = `npx prisma migrate diff --from-url "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public" --to-schema-datamodel prisma/schema.prisma --script`;

try {
  const sql = cp.execSync(command).toString();
  fs.writeFileSync(path.join(migrationDir, 'migration.sql'), sql);
  cp.execSync('npx prisma db execute --file prisma/migrations/20260730160000_remove_legacy_brand_analysis/migration.sql --url="postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public"', {stdio: 'inherit'});
  cp.execSync('npx prisma migrate resolve --applied 20260730160000_remove_legacy_brand_analysis', {stdio: 'inherit'});
  console.log("Legacy model removed from DB.");
} catch (e) {
  console.error("Error:", e.message);
}
