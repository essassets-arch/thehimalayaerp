const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst({ where: { role: { name: 'Plant Head' } }, include: { role: true } });
  const secret = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  const token = jwt.sign({ sub: user.id, id: user.id, email: user.email, role: user.role.name, companyId: user.companyId }, secret, { expiresIn: '1h' });
  const headers = { Authorization: 'Bearer ' + token };

  for (const m of ['2026-09', '2026-08', 'all']) {
    const res = await axios.get('http://localhost:4000/api/v1/plant-head/analytics/monthly-production-report?month=' + m, { headers });
    const d = res.data?.data || res.data;
    console.log('Month:', m, 'KPIs:', {
      totalWorkOrders: d?.kpis?.totalWorkOrders,
      completedWorkOrders: d?.kpis?.completedWorkOrders,
      activeWorkOrders: d?.kpis?.activeWorkOrders,
      completionRate: d?.kpis?.completionRate,
      pipelineStatuses: d?.pipelineStatuses
    });
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
