const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function checkFks() {
  console.log('Checking foreign keys referencing Product and RawMaterial...');

  const fks = await prisma.$queryRawUnsafe(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name IN ('Product', 'RawMaterial');
  `);

  console.log('References found:');
  console.table(fks);

  // Check if any RAW_MATERIAL product is referenced in these tables:
  const rawProds = await prisma.product.findMany({
    where: {
      OR: [
        { productType: 'RAW_MATERIAL' },
        { type: 'RAW_MATERIAL' },
        { category: { contains: 'Raw', mode: 'insensitive' } }
      ]
    },
    select: { id: true }
  });
  const rawIds = rawProds.map(p => p.id);
  console.log(`Found ${rawIds.length} RAW_MATERIAL products in local DB.`);

  if (rawIds.length > 0) {
    for (const ref of fks) {
      if (ref.foreign_table_name === 'Product') {
        const countRes = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*)::int as cnt FROM "${ref.table_name}" WHERE "${ref.column_name}" = ANY($1)
        `, rawIds);
        const cnt = countRes[0]?.cnt || 0;
        if (cnt > 0) {
          console.log(`⚠️ Table "${ref.table_name}" has ${cnt} rows referencing RAW_MATERIAL products!`);
        }
      }
    }
  }

  // Also check RawMaterial table references:
  for (const ref of fks) {
    if (ref.foreign_table_name === 'RawMaterial') {
      const countRes = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*)::int as cnt FROM "${ref.table_name}"
      `);
      console.log(`Table "${ref.table_name}" referencing RawMaterial has total rows: ${countRes[0]?.cnt}`);
    }
  }
}

checkFks().catch(console.error).finally(() => prisma.$disconnect());
