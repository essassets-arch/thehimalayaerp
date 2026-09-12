const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public' } }
});

async function test() {
  const columns = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND data_type IN ('text', 'character varying', 'uuid')
  `);
  
  console.log('Searching', columns.length, 'columns...');
  for (const row of columns) {
    try {
      const res = await prisma.$queryRawUnsafe(`SELECT * FROM "${row.table_name}" WHERE "${row.column_name}"::text LIKE '%01339514%' LIMIT 1`);
      if (res.length > 0) {
        console.log('FOUND IN TABLE:', row.table_name, 'COLUMN:', row.column_name, res[0]);
      }
    } catch(e) {}
  }

  // Also check for Ravikant or EMP-10
  console.log('\nSearching for Ravikant / EMP-10:');
  const emp10 = await prisma.employee.findMany({
    where: {
      OR: [
        { employeeCode: { contains: 'EMP-10', mode: 'insensitive' } },
        { firstName: { contains: 'Ravikant', mode: 'insensitive' } }
      ]
    },
    include: { salaryStructures: true, payrollRecords: true }
  });
  console.log('Employees matched:', JSON.stringify(emp10, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
