const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Testing category and month filters on port 4000...');

  const user = await prisma.user.findFirst({
    where: { role: { name: 'Plant Head' } },
    include: { role: true }
  });

  const secret = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  const token = jwt.sign({
    sub: user.id,
    id: user.id,
    email: user.email,
    role: user.role.name,
    companyId: user.companyId
  }, secret, { expiresIn: '1h' });

  const headers = { Authorization: `Bearer ${token}` };

  // 1. Test September 2026 without filter
  const r1 = await axios.get('http://localhost:4000/api/v1/plant-head/analytics/monthly-production-report?month=2026-09', { headers });
  const d1 = r1.data?.data || r1.data;
  console.log('\n--- Test 1: September 2026 ---');
  console.log('Sep 2026 Total Weight:', d1?.kpis?.totalWeight, 'KG, Total WOs:', d1?.kpis?.totalWorkOrders);
  console.log('Filter Options Categories:', d1?.filterOptions?.categories);
  console.log('Filter Options Capacities:', d1?.filterOptions?.capacities);
  console.log('Filter Options Sizes (sample 5):', d1?.filterOptions?.sizes?.slice(0, 5));

  // 2. Test September 2026 with category=MHC
  const r2 = await axios.get('http://localhost:4000/api/v1/plant-head/analytics/monthly-production-report?month=2026-09&category=MHC', { headers });
  const d2 = r2.data?.data || r2.data;
  console.log('\n--- Test 2: September 2026 Filtered by Category MHC ---');
  console.log('MHC Total Weight:', d2?.kpis?.totalWeight, 'KG, WOs:', d2?.kpis?.totalWorkOrders, 'Pieces:', d2?.kpis?.totalPieces);

  // 3. Test August 2026
  const r3 = await axios.get('http://localhost:4000/api/v1/plant-head/analytics/monthly-production-report?month=2026-08', { headers });
  const d3 = r3.data?.data || r3.data;
  console.log('\n--- Test 3: August 2026 ---');
  console.log('Aug 2026 Total Weight:', d3?.kpis?.totalWeight, 'KG, Total WOs:', d3?.kpis?.totalWorkOrders);

  await prisma.$disconnect();
}

test().catch(console.error);
