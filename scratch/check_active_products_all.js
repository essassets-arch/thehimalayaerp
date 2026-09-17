const { PrismaClient } = require('@prisma/client');

async function check() {
  const p5435 = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } } });
  const p5432 = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

  console.log('--- Checking 5435 ---');
  try {
    const c5435 = await p5435.product.groupBy({
      by: ['productType', 'dispatchCategory'],
      _count: { id: true },
      where: { isActive: true }
    });
    console.log('5435 Active Products:', c5435);
  } catch (e) {
    console.error('5435 error:', e.message);
  }

  console.log('--- Checking 5432 ---');
  try {
    const c5432 = await p5432.product.groupBy({
      by: ['productType', 'dispatchCategory'],
      _count: { id: true },
      where: { isActive: true }
    });
    console.log('5432 Active Products:', c5432);
  } catch (e) {
    console.error('5432 error:', e.message);
  }

  console.log('--- Checking Cloud ---');
  try {
    const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
    });
    const token = (await loginRes.json()).data?.accessToken;
    if (token) {
      const res = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const cloudProds = (await res.json()).data || [];
      const mfg = cloudProds.filter(p => p.productType === 'MANUFACTURING').length;
      const trading = cloudProds.filter(p => p.productType === 'TRADING').length;
      const d1 = cloudProds.filter(p => p.dispatchCategory === 'D1').length;
      const d2 = cloudProds.filter(p => p.dispatchCategory === 'D2').length;
      console.log(`Cloud Catalog: Total=${cloudProds.length}, MFG=${mfg}, Trading=${trading}, D1=${d1}, D2=${d2}`);
    }
  } catch (e) {
    console.error('Cloud error:', e.message);
  }

  await p5435.$disconnect();
  await p5432.$disconnect();
}

check();
