const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.dispatch.findMany({
  include: {
    workflowState: true
  }
}).then(r => console.log('Success!'))
  .catch(e => console.error('Prisma Error:', e.message))
  .finally(() => prisma.$disconnect());
