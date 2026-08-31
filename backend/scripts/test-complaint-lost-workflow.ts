import { PrismaClient, ComplaintStatus, SalesOrderStatus } from '@prisma/client';
import { CustomerComplaintsService } from '../src/modules/customer-complaints/customer-complaints.service';
import { SequenceService } from '../src/common/sequence/sequence.service';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('--- Starting Customer Complaint & Order Lost Workflow Verification ---');

  const sequenceService = new SequenceService(prisma as any);
  const complaintService = new CustomerComplaintsService(prisma as any, sequenceService);

  // 1. Fetch existing user, company, product, customer
  let user = await prisma.user.findFirst({ where: { email: 'supersales1@thehimalayapp.com' } });
  if (!user) user = await prisma.user.findFirst();
  if (!user) throw new Error('No user found in database');

  let plantHeadUser = await prisma.user.findFirst({ where: { email: 'planthead@thehimalayapp.com' } });
  if (!plantHeadUser) plantHeadUser = user;

  let product = await prisma.product.findFirst();
  let customer = await prisma.customer.findFirst();

  if (!product) {
    product = await (prisma.product as any).create({
      data: {
        publicId: `P-${Date.now()}`,
        name: 'Verification Product',
        sku: `SKU-${Date.now()}`,
        category: 'FRP COVERS',
        unit: 'NOS',
        unitPrice: 500,
      },
    });
  }

  if (!customer) {
    customer = await (prisma.customer as any).create({
      data: {
        companyName: 'Verification Client Pvt Ltd',
        customerCode: `CUST-${Date.now()}`,
        email: `client-${Date.now()}@example.com`,
        phone: '9876543210',
        createdById: user.id,
      },
    });
  }

  // Create Lead
  const lead = await (prisma.lead as any).create({
    data: {
      leadNumber: await sequenceService.generateLeadNumber(),
      companyName: customer!.companyName,
      contactPerson: 'Lead Contact',
      email: customer!.email,
      phone: customer!.phone,
      productInterest: product!.name,
      salesExecutiveId: user.id,
      createdById: user.id,
    },
  });
  console.log('✅ Created test Lead:', lead.leadNumber);

  // Create Quotation
  const quoteNo = await sequenceService.generateQuotationNumber();
  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: quoteNo,
      lead: { connect: { id: lead.id } },
      customerId: customer!.id,
      salesExecutive: { connect: { id: user.id } },
      total: 15000,
      subtotal: 15000,
      tax: 0,
      createdById: user.id,
    },
  });
  console.log('✅ Created test Quotation:', quotation.quotationNumber);

  // Create Sales Order with items
  const orderNo = await sequenceService.generateSalesOrderNumber();
  const salesOrder: any = await prisma.salesOrder.create({
    data: {
      orderNumber: orderNo,
      quotationId: quotation.id,
      customerId: customer!.id,
      salesExecutiveId: user.id,
      createdById: user.id,
      status: SalesOrderStatus.CONFIRMED,
      subtotal: 15000,
      taxableAmount: 15000,
      totalAmount: 15000,
      items: {
        create: [
          {
            productId: product!.id,
            productNameSnapshot: product!.name,
            productCodeSnapshot: product!.sku,
            orderedQuantity: 30,
            unit: 'NOS',
            unitPrice: 500,
            taxableAmount: 15000,
            lineTotal: 15000,
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log('✅ Created test Sales Order:', salesOrder.orderNumber, 'with Value:', salesOrder.totalAmount);

  // 2. Test Complaint Number Generation format CC/2627/0001
  const complaintNo = await sequenceService.generateCustomerComplaintNumber();
  console.log('✅ Sequence format check:', complaintNo);
  if (!complaintNo.startsWith('CC/')) {
    throw new Error(`Expected complaint number to start with CC/, got: ${complaintNo}`);
  }

  // 3. Test Create Complaint via Service
  const complaint = await complaintService.create(
    {
      customerId: customer!.id,
      orderId: salesOrder.id,
      complaintType: 'Product Quality',
      priority: 'High',
      complaintDate: new Date().toISOString(),
      subject: 'Severe color variation in batch',
      description: 'Customer noticed color mismatch across the entire delivered batch.',
      salesRemarks: 'Verified on site. Full batch replacement or cancellation required.',
      status: 'SUBMIT',
      items: [
        {
          orderItemId: salesOrder.items[0].id,
          productId: product!.id,
          orderedQuantity: 30,
          deliveredQuantity: 30,
          complaintQuantity: 30,
        },
      ],
    },
    user.id,
    'SalesExecutive',
  );

  console.log('✅ Complaint successfully created:', complaint.complaintNo, 'Status:', complaint.status);
  if (complaint.status !== ComplaintStatus.PENDING_PLANT_HEAD) {
    throw new Error(`Expected PENDING_PLANT_HEAD status, got ${complaint.status}`);
  }

  // 4. Test Meta endpoint
  const meta = await complaintService.getMetaOrdersAndCustomers(user.id, 'SalesExecutive');
  console.log('✅ Meta endpoint returned:', meta.customers.length, 'customers,', meta.orders.length, 'orders');

  // 5. Test Plant Head APPROVAL Transaction
  console.log('--- Testing Plant Head Approval Transaction ---');
  const approvalResult = await complaintService.approve(complaint.id, plantHeadUser.id, 'Approved for full cancellation & loss');
  console.log('✅ Complaint Approved:', approvalResult.complaintNo, 'Status:', approvalResult.status);

  // Check cascading updates
  const updatedOrder = await prisma.salesOrder.findUnique({ where: { id: salesOrder.id } });
  console.log('✅ Updated Sales Order Status:', updatedOrder?.status, 'Lost Reason:', updatedOrder?.lostReason);
  if (updatedOrder?.status !== SalesOrderStatus.LOST) {
    throw new Error(`Expected Sales Order status LOST, got ${updatedOrder?.status}`);
  }

  const updatedQuotation = await prisma.quotation.findUnique({ where: { id: quotation.id } });
  console.log('✅ Updated Quotation Lost Reason:', updatedQuotation?.lostReason, 'Complaint ID:', updatedQuotation?.lostComplaintId);

  const updatedLead = await prisma.lead.findUnique({ where: { id: lead.id } });
  console.log('✅ Updated Lead Lost Reason:', updatedLead?.lostReason, 'Complaint ID:', updatedLead?.lostComplaintId);

  const lossRecord = await prisma.salesOrderLoss.findUnique({ where: { salesOrderId: salesOrder.id } });
  console.log('✅ SalesOrderLoss record verified: ID:', lossRecord?.id, 'Lost Value:', lossRecord?.lostValue);
  if (!lossRecord) {
    throw new Error('Expected SalesOrderLoss record to be created');
  }

  // 6. Test Critical Invariant: Double-Deduction Protection (ORDER_ALREADY_LOST)
  console.log('--- Testing Double-Deduction Protection Invariant ---');
  // Create another draft complaint against same order
  const secondComplaint = await prisma.customerComplaint.create({
    data: {
      complaintNo: await sequenceService.generateCustomerComplaintNumber(),
      customerId: customer!.id,
      orderId: salesOrder.id,
      productId: product!.id,
      complaintType: 'Damage',
      priority: 'Medium',
      complaintDate: new Date(),
      subject: 'Second complaint on same order',
      description: 'Testing invariant',
      status: ComplaintStatus.PENDING_PLANT_HEAD,
      createdBy: user.id,
    },
  });

  try {
    await complaintService.approve(secondComplaint.id, plantHeadUser.id);
    throw new Error('FAILED: Double deduction was not prevented!');
  } catch (err: any) {
    if (err.message.includes('ORDER_ALREADY_LOST')) {
      console.log('✅ Invariant Verified: Successfully rejected with ORDER_ALREADY_LOST!');
    } else {
      throw err;
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL INTEGRATION WORKFLOW TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('======================================================\n');
}

runVerification()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
