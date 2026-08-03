const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || !dbUrl.includes('_browser_test')) {
  console.error("Safety check failed. DATABASE_URL must contain _browser_test");
  process.exit(1);
}

async function main() {
  console.log("Cleaning database schema using Prisma...");
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS public CASCADE;`);
  await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);
  console.log("Database schema cleaned successfully.");
}

main()
  .catch((e) => {
    console.error("Error during database clean:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
