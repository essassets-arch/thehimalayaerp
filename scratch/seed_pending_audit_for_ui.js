const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
      }
    }
  });

  console.log('Seeding pending delivery audit for UI testing...');

  const storeUser = await prisma.user.findFirst({
    where: { email: 'makhdum@himalayaerp.com' },
    include: { role: true }
  });

  const supplier = await prisma.supplier.findFirst({
    where: { name: { contains: 'karan', mode: 'insensitive' } }
  }) || await prisma.supplier.findFirst();

  const warehouse = await prisma.warehouse.findFirst();

  let product = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'WATER PAPER 150', mode: 'insensitive' } },
        { name: { contains: 'WATER PAPER', mode: 'insensitive' } }
      ]
    }
  }) || await prisma.product.findFirst();

  const timestamp = Date.now().toString().slice(-5);
  const indentNumber = `IND-WP-${timestamp}`;
  const poNumber = `PO-WP-${timestamp}`;

  const testQty = 150;
  const testRate = 45;

  const indent = await prisma.purchaseIndent.create({
    data: {
      publicId: indentNumber,
      companyId: storeUser.companyId,
      indentNo: indentNumber,
      status: 'APPROVED',
      warehouseId: warehouse.id,
      requestedById: storeUser.id,
      items: {
        create: [{
          productId: product.id,
          quantity: testQty
        }]
      }
    }
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      publicId: poNumber,
      poNo: poNumber,
      poNumber,
      draftPoNo: poNumber,
      companyId: storeUser.companyId,
      purchaseIndentId: indent.id,
      supplierId: supplier.id,
      status: 'ISSUED',
      totalAmount: testQty * testRate,
      issuedById: storeUser.id,
      issuedAt: new Date(),
      items: {
        create: [{
          productId: product.id,
          quantity: testQty,
          unitPrice: testRate,
          receivedQuantity: 0
        }]
      }
    },
    include: { items: true }
  });

  console.log(`Created PO: ${po.poNumber} for ${testQty} of ${product.name}`);

  const secret = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  const storeToken = jwt.sign({
    sub: storeUser.id,
    id: storeUser.id,
    email: storeUser.email,
    role: storeUser.role.name,
    companyId: storeUser.companyId
  }, secret, { expiresIn: '1h' });

  const storeApi = axios.create({
    baseURL: 'http://127.0.0.1:4001/api/v1',
    headers: {
      Authorization: `Bearer ${storeToken}`,
      'Content-Type': 'application/json'
    }
  });

  // 1x1 green png data url as sample delivery receipt
  const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVGDUAAAnkAQW5Z0dRAAAAAElFTkSuQmCC';

  const verifyRes = await storeApi.post('/procurement/store/deliveries/verify', {
    purchaseOrderId: po.id,
    warehouseId: warehouse.id,
    challanNumber: `CH-WP-${timestamp}`,
    vehicleNumber: 'MH-12-WP-7788',
    remarks: 'Delivered in full. Water paper quality inspected and verified.',
    attachments: [
      {
        name: 'delivery_challan_signed.png',
        size: '128 KB',
        previewUrl: sampleImage
      },
      {
        name: 'gate_pass_slip.pdf',
        size: '64 KB'
      }
    ],
    items: [{
      purchaseOrderItemId: po.items[0].id,
      productId: product.id,
      receivedQuantity: testQty,
      acceptedQuantity: testQty,
      rejectedQuantity: 0,
      inspectionRemarks: 'Passed tensile strength test'
    }]
  });

  const grn = verifyRes.data?.data?.delivery || verifyRes.data?.delivery || verifyRes.data;
  console.log(`GRN created in PENDING_FINANCE_AUDIT: ${grn.grnNumber || grn.id}`);

  await prisma.$disconnect();
}

main().catch(console.error);
