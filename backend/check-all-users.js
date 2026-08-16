const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } }
});

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log('Total users:', users.length);
  for (const u of users) {
    console.log(`Email: ${u.email}, ID: ${u.id}, Role: ${u.role.name}`);
  }
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
