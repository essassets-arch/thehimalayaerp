const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.workOrder.findUnique({
  where: { id: 'ebf9ab32-a40c-4fdf-8aa3-84f5ee8e1ca1' },
  include: { salesOrderItem: true }
}).then(res => { console.log(JSON.stringify(res, null, 2)); prisma.$disconnect(); });
