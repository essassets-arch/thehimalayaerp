const { PrismaClient } = require('@prisma/client');

async function checkCols() {
  const pMain = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' } } });
  const pBrowser = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

  try {
    const colsMain = await pMain.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Product';`);
    const colsBrowser = await pBrowser.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Product';`);

    const mainNames = new Set(colsMain.map(c => c.column_name));
    const browserNames = new Set(colsBrowser.map(c => c.column_name));

    console.log('Columns in himalaya_erp_browser_test but missing in himalaya_erp:');
    for (const b of colsBrowser) {
      if (!mainNames.has(b.column_name)) {
        console.log(`- ${b.column_name} (${b.data_type})`);
      }
    }
  } finally {
    await pMain.$disconnect();
    await pBrowser.$disconnect();
  }
}

checkCols();
