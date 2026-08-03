import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const models = [
    'company', 'branch', 'department', 'role', 'permission', 'user', 'employee',
    'product', 'customer', 'supplier', 'documentSequence', 'lead'
  ];

  const snapshot = {};
  for (const model of models) {
    snapshot[model] = await prisma[model].count();
  }

  // Find duplicates
  const duplicates = {
    emails: await prisma.$queryRaw`SELECT email, COUNT(*) as c FROM "User" GROUP BY email HAVING COUNT(*) > 1`,
    perms: await prisma.$queryRaw`SELECT code, COUNT(*) as c FROM "Permission" GROUP BY code HAVING COUNT(*) > 1`,
    products: await prisma.$queryRaw`SELECT "publicId", COUNT(*) as c FROM "Product" GROUP BY "publicId" HAVING COUNT(*) > 1`,
  };

  snapshot['duplicates'] = {
    emails: duplicates.emails.length,
    perms: duplicates.perms.length,
    products: duplicates.products.length,
  };

  fs.writeFileSync(process.argv[2], JSON.stringify(snapshot, null, 2));
}

main().catch(err => {
    console.error(err);
    process.exit(1);
}).finally(() => prisma.$disconnect());
