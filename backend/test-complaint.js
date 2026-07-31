const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const customer = await prisma.customer.findFirst();
  const product = await prisma.product.findFirst();
  const user = await prisma.user.findFirst();

  if (!customer || !product || !user) {
    console.log('Missing data:', { customer: !!customer, product: !!product, user: !!user });
    return;
  }

  try {
    const sequence = await prisma.idSequence.upsert({
      where: { key: 'COMPLAINT_NO' }, update: { nextValue: { increment: 1 } }, create: { key: 'COMPLAINT_NO', nextValue: 2 },
    });
    const num = `CMP-${new Date().getFullYear()}-${String(sequence.nextValue - 1).padStart(4, '0')}`;
    
    await prisma.customerComplaint.create({
      data: {
        complaintNo: num,
        customerId: customer.id,
        productId: product.id,
        complaintType: 'Product Quality',
        priority: 'High',
        complaintDate: new Date(),
        subject: 'Test',
        description: 'Test',
        status: 'DRAFT',
        createdBy: user.id,
        updatedBy: user.id
      }
    });
    console.log('Success');
  } catch (e) {
    console.error('Error creating complaint:', e);
  }
}

test().finally(() => prisma.$disconnect());
