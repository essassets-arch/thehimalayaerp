const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing missing token (401)...');
  let res = await fetch('http://localhost:4000/api/v1/sales/orders');
  console.log('Status:', res.status);
  
  console.log('\nLogging in as admin...');
  res = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super-admin@himalayaerp.com', password: 'admin123' })
  });
  let result = await res.json();
  let token = result.data ? result.data.accessToken : null;
  
  if (!token) {
    console.error('Login failed!', result);
    return;
  }

  console.log('\nLogging in as sales-admin for 403 test...');
  res = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sales-admin@himalayaerp.com', password: 'admin123' })
  });
  result = await res.json();
  const salesAdminToken = result.data ? result.data.accessToken : null;

  console.log('\nTesting insufficient permission (403)...');
  res = await fetch('http://localhost:4000/api/v1/sales/orders', {
    headers: { Authorization: `Bearer ${salesAdminToken}` }
  });
  console.log('Status:', res.status);
  
  console.log('\nAdding sales.orders.read permission to DB and assigning to SUPER_ADMIN...');
  const perm = await prisma.permission.upsert({
    where: { code: 'sales.orders.read' },
    update: {},
    create: { publicId: 'PERM-sales.orders.read', name: 'sales.orders.read', code: 'sales.orders.read' }
  });
  const role = await prisma.role.findFirst({ where: { code: 'SUPER_ADMIN' } });
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
    update: {},
    create: { roleId: role.id, permissionId: perm.id }
  });
  
  console.log('\nLogging in again as SUPER_ADMIN to refresh claims...');
  res = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super-admin@himalayaerp.com', password: 'admin123' })
  });
  result = await res.json();
  const newToken = result.data ? result.data.accessToken : null;

  console.log('\nTesting authorized request (200, empty results)...');
  res = await fetch('http://localhost:4000/api/v1/sales/orders', {
    headers: { Authorization: `Bearer ${newToken}` }
  });
  console.log('Status:', res.status);
  console.log('Data:', await res.json());

  console.log('\nTesting non-existent order (404)...');
  res = await fetch('http://localhost:4000/api/v1/sales/orders/nonexistent-id', {
    headers: { Authorization: `Bearer ${newToken}` }
  });
  console.log('Status:', res.status);
  
  // Seed a fake order to test structure
  console.log('\nSeeding a dummy customer and order for structural testing...');
  const company = await prisma.company.findFirst();
  const customer = await prisma.customer.create({
    data: {
      publicId: `CUST-TEST-${Date.now()}`,
      companyId: company.id,
      companyName: 'Test Corp',
      isActive: true,
    }
  });
  const product = await prisma.product.create({
    data: {
      publicId: `PROD-TEST-${Date.now()}`,
      companyId: company.id,
      name: 'Test Product',
      unit: 'PCS',
      unitPrice: 100,
    }
  });
  const order = await prisma.salesOrder.create({
    data: {
      orderNumber: `SO-TEST-${Date.now()}`,
      customerId: customer.id,
      subtotal: 1000,
      taxableAmount: 1000,
      taxAmount: 50,
      totalAmount: 1050,
      orderStatus: 'CONFIRMED',
      creditStatus: 'PASSED',
      allocationStatus: 'NOT_ALLOCATED',
      productionStatus: 'NOT_REQUIRED',
      qcStatus: 'NOT_REQUIRED',
      dispatchStatus: 'NOT_READY',
      invoiceStatus: 'PENDING',
      paymentStatus: 'NOT_DUE',
      closureStatus: 'OPEN',
      createdById: 'test',
      items: {
        create: [
          {
            productId: product.id,
            productNameSnapshot: 'Test Product',
            orderedQuantity: 10,
            unit: 'PCS',
            unitPrice: 100,
            taxableAmount: 1000,
            taxRate: 5,
            taxAmount: 50,
            lineTotal: 1050,
          }
        ]
      }
    }
  });

  console.log('\nTesting structure with seeded order...');
  res = await fetch('http://localhost:4000/api/v1/sales/orders', {
    headers: { Authorization: `Bearer ${newToken}` }
  });
  data = await res.json();
  console.log('Order Item mapping:', JSON.stringify(data.data.data[0].items, null, 2));
  console.log('Monetary fields:', { 
    subtotal: data.data.data[0].subtotal, 
    totalAmount: data.data.data[0].totalAmount, 
    typeofSubtotal: typeof data.data.data[0].subtotal 
  });
  console.log('Pagination:', JSON.stringify(data.data.pagination, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
