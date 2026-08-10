const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const keys = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
console.log('Available Prisma Models:', keys);
prisma.$disconnect();
