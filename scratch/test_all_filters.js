const fs = require('fs');

async function testAllFilters() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const filters = ['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'Quarter', 'Year'];

  for (const f of filters) {
    const res = await fetch(`https://thehimalaya.cloud/api/v1/plant-head/dashboard?filter=${encodeURIComponent(f)}&year=2026`, { headers });
    const json = await res.json();
    const data = json.data;
    console.log(`\n=== FILTER: ${f} ===`);
    console.log('Period Label:', data?.period?.label);
    console.log('Date range:', data?.period?.startDate, 'to', data?.period?.endDate);
    console.log('Total Production PCS:', data?.kpis?.totalProduction?.pcs);
    console.log('Total Dispatch PCS:', data?.kpis?.totalDispatch?.pcs);
    console.log('prod.dailyVsTarget length:', data?.production?.dailyVsTarget?.length);
    console.log('prod.dailyVsTarget non-zero count:', data?.production?.dailyVsTarget?.filter(d => d.actualPcs > 0).length);
    console.log('disp.dailyVsTarget length:', data?.dispatch?.dailyVsTarget?.length);
    console.log('disp.dailyVsTarget non-zero count:', data?.dispatch?.dailyVsTarget?.filter(d => d.actualPcs > 0).length);
    console.log('disp.trend length:', data?.dispatch?.trend?.length);
    console.log('disp.trend non-zero count:', data?.dispatch?.trend?.filter(d => d.pcs > 0).length);
    console.log('monthlyTrend length:', data?.monthlyTrend?.length);
    console.log('monthlyTrend non-zero count:', data?.monthlyTrend?.filter(d => d.productionPcs > 0 || d.dispatchPcs > 0).length);
    console.log('fulfillment totalOrders:', data?.orders?.fulfillment?.totalOrders);
    console.log('productWise length:', data?.production?.productWise?.length);
    console.log('sizeWise length:', data?.production?.sizeWise?.length);
    console.log('capacityWise length:', data?.production?.capacityWise?.length);
    console.log('topCustomers length:', data?.dispatch?.topCustomers?.length);
  }
}

testAllFilters().catch(console.error);
