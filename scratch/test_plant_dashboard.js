const fs = require('fs');

async function testPlantDashboard() {
  console.log('Logging in...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  console.log('Got token:', !!token);
  const headers = { 'Authorization': 'Bearer ' + token };

  console.log('\n--- Fetching /plant-head/dashboard with filter=This Month ---');
  const dashRes = await fetch('https://thehimalaya.cloud/api/v1/plant-head/dashboard?filter=This%20Month&year=2026', { headers });
  const dashData = await dashRes.json();
  
  console.log('Status:', dashRes.status);
  console.log('Keys in response:', Object.keys(dashData || {}));
  if (dashData.kpis) {
    console.log('KPIs:', JSON.stringify(dashData.kpis, null, 2));
    console.log('Production dailyVsTarget length:', dashData.production?.dailyVsTarget?.length);
    console.log('Sample dailyVsTarget:', dashData.production?.dailyVsTarget?.slice(0, 5));
    console.log('Dispatch dailyVsTarget length:', dashData.dispatch?.dailyVsTarget?.length);
    console.log('Sample dispatch dailyVsTarget:', dashData.dispatch?.dailyVsTarget?.slice(0, 5));
    console.log('Dispatch trend length:', dashData.dispatch?.trend?.length);
    console.log('Sample dispatch trend:', dashData.dispatch?.trend?.slice(0, 5));
    console.log('MonthlyTrend:', dashData.monthlyTrend);
    console.log('Orders fulfillment:', dashData.orders?.fulfillment);
    console.log('ProductWise:', dashData.production?.productWise?.slice(0, 3));
    console.log('SizeWise:', dashData.production?.sizeWise?.slice(0, 3));
    console.log('CapacityWise:', dashData.production?.capacityWise?.slice(0, 3));
  } else {
    console.log('Response body:', JSON.stringify(dashData, null, 2));
  }
}

testPlantDashboard().catch(console.error);
