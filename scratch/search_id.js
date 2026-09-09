const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchDb(url, name) {
  console.log(`\n=== Checking ${name} ===`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const target = 'c99c91fc-8e90-417b-b790-66ed222d33ab';
  try {
    const columns = await prisma.$queryRaw`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND data_type IN ('text', 'character varying', 'uuid')
    `;

    for (const { table_name, column_name } of columns) {
      try {
        const res = await prisma.$queryRawUnsafe(
          `SELECT * FROM "${table_name}" WHERE CAST("${column_name}" AS TEXT) = '${target}' LIMIT 1`
        );
        if (res && res.length > 0) {
          console.log(`>>> MATCH in ${name} -> table: ${table_name}, column: ${column_name}:`, res[0]);
        }
      } catch (e) {
        // console.error(`Error querying ${table_name}.${column_name}:`, e.message);
      }
    }
  } catch (err) {
    console.log(`Failed to inspect ${name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await searchDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public', 'himalaya_erp_browser_test');
  await searchDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public', 'himalaya_erp');
  await searchDb('postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public', 'docker himalaya_erp (5435)');
}

main().catch(console.error);
