const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.workflowTransition.findMany({
  where: { fromStateId: '99029205-a037-4ed5-afc5-a3b8247469bd' }
}).then(res => { console.log(JSON.stringify(res, null, 2)); prisma.$disconnect(); });
