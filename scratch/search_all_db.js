const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND data_type IN ('text', 'character varying')
  `);
  
  for (const row of tables) {
    try {
      const res = await prisma.$queryRawUnsafe(`
        SELECT "${row.column_name}" as val, id::text 
        FROM "${row.table_name}" 
        WHERE "${row.column_name}" ILIKE '%STAR%WEIGH%' OR "${row.column_name}" ILIKE '%WEIGH%BRIDGE%'
        LIMIT 5
      `);
      if (res.length > 0) {
        console.log(`Match in ${row.table_name}.${row.column_name}:`, res);
      }
    } catch (e) {
      // ignore
    }
  }
  console.log('Search completed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
