const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.productionPlan.findUnique({
  where: { id: '6eb591af-59cd-4f11-9c6c-97a1adabe721' },
  include: { salesOrder: { include: { items: true } } }
}).then(res => { console.log(JSON.stringify(res, null, 2)); prisma.$disconnect(); });
