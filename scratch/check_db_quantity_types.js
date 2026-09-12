const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public' } }
});

async function main() {
  const qCols = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, data_type, numeric_precision, numeric_scale 
    FROM information_schema.columns 
    WHERE column_name IN ('quantity', 'orderedQuantity', 'estimatedQuantity') 
      AND table_name IN ('OrderItem', 'SalesOrderItem', 'QuotationItem', 'Lead', 'Quotation')
    ORDER BY table_name, column_name
  `);
  console.log('Quantity cols:', qCols);
}

main().catch(console.error).finally(() => prisma.$disconnect());
