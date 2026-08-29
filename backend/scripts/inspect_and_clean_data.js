const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log('=== DATABASE TABLE ROW COUNTS ===\n');
  const counts = [];
  for (const t of tables) {
    const tableName = t.table_name;
    const res = await prisma.$queryRawUnsafe(`SELECT count(*)::int as cnt FROM "${tableName}"`);
    const count = res[0]?.cnt || 0;
    if (count > 0) {
      counts.push({ table: tableName, count });
    }
  }
  console.table(counts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
