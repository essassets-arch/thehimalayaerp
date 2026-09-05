const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fks = await prisma.$queryRawUnsafe(`
    SELECT
      tc.table_schema, 
      tc.constraint_name, 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND ccu.table_name IN ('SalesOrder', 'Quotation', 'Lead', 'ProductionPlan', 'WorkOrder', 'Dispatch')
    ORDER BY ccu.table_name, tc.table_name;
  `);

  console.log('Foreign keys referencing SalesOrder, Quotation, Lead, etc.:');
  for (const fk of fks) {
    console.log(`  Table: "${fk.table_name}" ("${fk.column_name}") -> References "${fk.foreign_table_name}" ("${fk.foreign_column_name}") [Constraint: ${fk.constraint_name}]`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
