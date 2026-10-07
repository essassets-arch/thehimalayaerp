const { PrismaClient } = require('@prisma/client');

async function syncAllColumns() {
  const pMain = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' } } });
  const pRef = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

  try {
    const mainTables = await pMain.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    `);
    const refTables = await pRef.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    `);

    const tableNames = refTables.map(t => t.table_name);

    for (const t of tableNames) {
      const refCols = await pRef.$queryRawUnsafe(`
        SELECT column_name, data_type, column_default, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${t}';
      `);
      const mainCols = await pMain.$queryRawUnsafe(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${t}';
      `);
      const mainColSet = new Set(mainCols.map(c => c.column_name));

      for (const col of refCols) {
        if (!mainColSet.has(col.column_name)) {
          console.log(`Table [${t}] missing column: ${col.column_name} (${col.data_type})`);
          let defClause = '';
          if (col.column_default) {
            defClause = `DEFAULT ${col.column_default}`;
          } else if (col.is_nullable === 'NO') {
            if (col.data_type === 'boolean') defClause = 'DEFAULT false';
            else if (col.data_type.includes('int') || col.data_type === 'numeric') defClause = 'DEFAULT 0';
            else if (col.data_type.includes('text') || col.data_type.includes('char')) defClause = "DEFAULT ''";
          }
          const sql = `ALTER TABLE "${t}" ADD COLUMN IF NOT EXISTS "${col.column_name}" ${col.data_type} ${defClause};`;
          console.log(`  Executing: ${sql}`);
          try {
            await pMain.$executeRawUnsafe(sql);
          } catch (err) {
            console.error(`  Error adding ${col.column_name}:`, err.message);
          }
        }
      }
    }

    console.log('\n--- Sync Complete. Testing Queries ---');
    const pCount = await pMain.product.count();
    const qCount = await pMain.quotation.count();
    const soCount = await pMain.salesOrder.count();
    console.log(`himalaya_erp Counts -> Products: ${pCount}, Quotations: ${qCount}, Orders: ${soCount}`);
  } finally {
    await pMain.$disconnect();
    await pRef.$disconnect();
  }
}

syncAllColumns().catch(console.error);
