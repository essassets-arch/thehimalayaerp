require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findFirst({ where: { email: 'super.admin@himalayaerp.com' } });
  console.log('Super Admin user:', { id: u.id, email: u.email, companyId: u.companyId, role: u.role });
}

main().catch(console.error).finally(() => prisma.$disconnect());
