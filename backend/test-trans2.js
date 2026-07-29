const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.workflowTransition.findMany({
  where: { fromStateId: '2591fd32-2c80-4783-acf6-0d73e0d55a54' }
}).then(res => { console.log(JSON.stringify(res, null, 2)); prisma.$disconnect(); });
