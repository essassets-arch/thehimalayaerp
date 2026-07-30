const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationDir = path.join(__dirname, 'prisma/migrations/20260730150000_add_brand_analysis_workflow');
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

// Generate the diff script directly to the migration.sql file
const command = `npx prisma migrate diff --from-url "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public" --to-schema-datamodel prisma/schema.prisma --script`;

try {
  const sql = cp.execSync(command).toString();
  fs.writeFileSync(path.join(migrationDir, 'migration.sql'), sql);
  console.log("Migration generated successfully!");
} catch (e) {
  console.error("Error generating migration:", e.message);
  if (e.stdout) console.log(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
}
