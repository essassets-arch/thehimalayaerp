import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({
    select: {
      id: true,
      leadNumber: true,
      salesExecutiveId: true,
      salesExecutive: { select: { email: true, name: true } },
    },
  });

  const prefixes: Record<string, number> = {};
  leads.forEach((l) => {
    const prefix = l.leadNumber ? l.leadNumber.split('/')[0] : 'NO_NUMBER';
    const email = l.salesExecutive?.email || 'unassigned';
    const key = `${prefix} | ${email}`;
    prefixes[key] = (prefixes[key] || 0) + 1;
  });
  console.log('LEAD PREFIXES BY USER:', prefixes);

  const quotes = await prisma.quotation.findMany({
    select: {
      id: true,
      quotationNumber: true,
      salesExecutive: { select: { email: true, name: true } },
    },
  });
  const quotePrefixes: Record<string, number> = {};
  quotes.forEach((q) => {
    const prefix = q.quotationNumber ? q.quotationNumber.split('/')[0] : 'NO_NUMBER';
    const email = q.salesExecutive?.email || 'unassigned';
    const key = `${prefix} | ${email}`;
    quotePrefixes[key] = (quotePrefixes[key] || 0) + 1;
  });
  console.log('QUOTE PREFIXES BY USER:', quotePrefixes);

  const orders = await prisma.salesOrder.findMany({
    select: {
      id: true,
      orderNumber: true,
      salesExecutive: { select: { email: true, name: true } },
    },
  });
  const orderPrefixes: Record<string, number> = {};
  orders.forEach((o) => {
    const prefix = o.orderNumber ? o.orderNumber.split('/')[0] : 'NO_NUMBER';
    const email = o.salesExecutive?.email || 'unassigned';
    const key = `${prefix} | ${email}`;
    orderPrefixes[key] = (orderPrefixes[key] || 0) + 1;
  });
  console.log('ORDER PREFIXES BY USER:', orderPrefixes);
}

main().finally(() => prisma.$disconnect());
