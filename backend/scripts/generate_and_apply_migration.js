const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
const migrationName = `${timestamp}_add_device_session_and_location`;
const migrationDir = path.join(__dirname, '../prisma/migrations', migrationName);

if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

const dbUrl = "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public";
const command = `npx prisma migrate diff --from-url "${dbUrl}" --to-schema-datamodel prisma/schema.prisma --script`;

try {
  console.log("Generating migration diff...");
  const sql = cp.execSync(command).toString();
  
  fs.writeFileSync(path.join(migrationDir, 'migration.sql'), sql);
  console.log(`Migration SQL written to: ${path.join(migrationDir, 'migration.sql')}`);

  console.log("Applying migration using prisma migrate deploy...");
  const deployOutput = cp.execSync('npx prisma migrate deploy').toString();
  console.log(deployOutput);
  console.log("Prisma migration successfully applied!");
} catch (e) {
  console.error("Migration script failed:", e.message);
  if (e.stdout) console.log("Stdout:", e.stdout.toString());
  if (e.stderr) console.error("Stderr:", e.stderr.toString());
  process.exit(1);
}
