const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const complaints = await prisma.customerComplaint.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        include: {
          complaintAdjustments: true,
          customerPayments: true,
          customer: true
        }
      },
      financeAdjustment: true,
    }
  });

  console.log('COMPLAINTS COUNT:', complaints.length);
  for (const c of complaints) {
    console.log('COMPLAINT:', {
      id: c.id,
      complaintNo: c.complaintNo,
      status: c.status,
      orderNumber: c.order?.orderNumber,
      orderTotal: c.order?.totalAmount ? Number(c.order.totalAmount) : null,
      orderPaid: c.order?.paidAmount ? Number(c.order.paidAmount) : null,
      orderOutstanding: c.order?.outstandingAmount ? Number(c.order.outstandingAmount) : null,
      adjustment: c.financeAdjustment ? {
        ref: c.financeAdjustment.referenceNumber,
        approvedReturnAmount: Number(c.financeAdjustment.approvedReturnAmount),
        netOrderAmount: Number(c.financeAdjustment.netOrderAmount),
        status: c.financeAdjustment.status
      } : null
    });
  }

  const allAdjustments = await prisma.complaintFinancialAdjustment.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { salesOrder: true }
  });
  console.log('\nADJUSTMENTS COUNT:', allAdjustments.length);
  for (const a of allAdjustments) {
    console.log('ADJ:', {
      ref: a.referenceNumber,
      orderNo: a.salesOrder?.orderNumber,
      originalAmount: Number(a.originalOrderAmount),
      approvedReturn: Number(a.approvedReturnAmount),
      netOrderAmount: Number(a.netOrderAmount),
      status: a.status
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

