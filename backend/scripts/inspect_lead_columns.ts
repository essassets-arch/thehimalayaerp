import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const leadCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Lead';
  `);
  console.log("LEAD COLUMNS:");
  console.log(JSON.stringify(leadCols, null, 2));

  const followUpCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'FollowUp';
  `);
  console.log("FOLLOWUP COLUMNS:");
  console.log(JSON.stringify(followUpCols, null, 2));
}
main().finally(() => prisma.$disconnect());
