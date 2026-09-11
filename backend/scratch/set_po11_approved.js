require('dotenv').config({ path: 'd:/prototype-next-main/backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.purchaseOrder.updateMany({
    where: { publicId: { in: ['PO-DRAFT-2026-000011', 'PO-DRAFT-2026-000009', 'PO-DRAFT-2026-000007'] } },
    data: { 
      status: 'SUPER_ADMIN_APPROVED',
      superAdminApprovedAt: new Date()
    }
  });
  console.log('Updated POs:', updated);
}

main().finally(() => prisma.$disconnect());
