async function checkRemainingOrders() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const soRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?pageSize=500', { headers });
  const soJson = await soRes.json();
  const orders = soJson.data?.data || [];

  const readyOrders = orders.filter(o => o.status === 'READY_FOR_DISPATCH');
  console.log(`Ready for dispatch orders (${readyOrders.length}):`);
  for (const o of readyOrders.slice(0, 5)) {
    console.log({
      orderNumber: o.orderNumber,
      customer: o.customer?.companyName || o.customerName,
      status: o.status,
      totalAmount: o.totalAmount,
      totalWeight: o.totalWeight,
      createdAt: o.createdAt,
      itemsCount: o.items?.length
    });
  }

  const plantApprovedOrders = orders.filter(o => o.status === 'PLANT_APPROVED');
  console.log(`Plant Approved / In Production orders (${plantApprovedOrders.length}):`);
  for (const o of plantApprovedOrders.slice(0, 5)) {
    console.log({
      orderNumber: o.orderNumber,
      customer: o.customer?.companyName || o.customerName,
      status: o.status,
      totalAmount: o.totalAmount,
      totalWeight: o.totalWeight,
      createdAt: o.createdAt,
      itemsCount: o.items?.length
    });
  }
}

checkRemainingOrders().catch(console.error);
