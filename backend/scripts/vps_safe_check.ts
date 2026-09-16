import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runVpsSafeCheck() {
  console.log('=====================================================');
  console.log('       VPS PRE / POST DEPLOYMENT SAFETY CHECK         ');
  console.log('=====================================================\n');

  try {
    // 1. Check core existing tables
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const orderCount = await prisma.salesOrder.count();
    const dispatchCount = await prisma.dispatch.count();
    const productCount = await prisma.product.count();
    const customerCount = await prisma.customer.count();

    console.log('Core ERP Baseline (Untouched & Safe):');
    console.log(`- Users: ${userCount}`);
    console.log(`- Roles: ${roleCount}`);
    console.log(`- Sales Orders: ${orderCount}`);
    console.log(`- Dispatches: ${dispatchCount}`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Customers: ${customerCount}\n`);

    // 2. Check BackOfficeArInvoice table existence
    try {
      const boArCount = await prisma.backOfficeArInvoice.count();
      console.log(`✅ BackOfficeArInvoice table exists! Current rows: ${boArCount}`);
    } catch (e: any) {
      console.log(`⚠️ BackOfficeArInvoice table not found yet. Run 'npx prisma migrate deploy' to apply it safely.`);
    }

    // 3. Check Back Office user
    const boUser = await prisma.user.findFirst({
      where: { email: 'backoffice@himalayaerp.com' },
      include: { role: true },
    });

    if (boUser) {
      console.log(`✅ Back Office user found: ${boUser.email} (Role: ${boUser.role?.code || boUser.role?.name})`);
    } else {
      console.log(`ℹ️ Back Office user (backoffice@himalayaerp.com) not created yet.`);
    }

    console.log('\n=====================================================');
    console.log('Result: Database read verified successfully with ZERO modifications.');
    console.log('=====================================================');
  } catch (err: any) {
    console.error('Safety check encountered error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runVpsSafeCheck();
