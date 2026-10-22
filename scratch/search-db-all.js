const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `;

  console.log(`Searching across ${tables.length} tables...`);
  const needle = 'a4f5abc1-89d7-4860-aa7a-1b915119ea46';

  for (const t of tables) {
    const tableName = t.table_name;
    try {
      const cols = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${tableName}'
          AND data_type IN ('text', 'character varying', 'uuid')
      `);
      
      for (const c of cols) {
        const colName = c.column_name;
        const res = await prisma.$queryRawUnsafe(`
          SELECT "${colName}" FROM "${tableName}" 
          WHERE CAST("${colName}" AS TEXT) ILIKE '%${needle}%'
          LIMIT 1
        `);
        if (res.length > 0) {
          console.log(`FOUND in table "${tableName}", column "${colName}":`, res[0]);
        }
      }
    } catch (err) {
      // ignore
    }
  }
  console.log('Search finished.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
