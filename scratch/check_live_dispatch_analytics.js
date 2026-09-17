async function checkLive() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  if (!token) {
    console.error('Failed to log in:', loginJson);
    return;
  }
  const headers = { 'Authorization': 'Bearer ' + token };

  console.log('Logged in successfully!');

  // Test endpoints
  const testUrls = [
    'https://thehimalaya.cloud/api/backend/plant-head/analytics/dispatch?filter=August%202026&month=2026-08',
    'https://thehimalaya.cloud/api/backend/plant-head/analytics/dispatch?filter=September%202026&month=2026-09',
    'https://thehimalaya.cloud/api/backend/plant-head/analytics/dispatch?filter=All%20Time&month=all',
  ];

  for (const url of testUrls) {
    try {
      const res = await fetch(url, { headers });
      console.log(`Status for ${url}: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Response summary:`, {
          hasData: data.hasData,
          period: data.summary?.period,
          totalQuantity: data.summary?.totalQuantity,
          totalWeight: data.summary?.totalWeight,
          uniqueClients: data.summary?.uniqueClients,
          totalTrips: data.summary?.totalTrips,
          topCustomersCount: data.topCustomers?.length,
          ordersCount: data.dispatchOrders?.length,
          kpis: data.kpis
        });
      } else {
        const text = await res.text();
        console.log(`Error body:`, text.slice(0, 200));
      }
    } catch (e) {
      console.error(`Fetch error for ${url}:`, e.message);
    }
  }
}

checkLive().catch(console.error);
