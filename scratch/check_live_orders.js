async function checkOrders() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const res = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?limit=100', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  const orders = Array.isArray(data.data) ? data.data : (data.data?.orders || data.data?.items || []);
  console.log('Live VPS Total Orders in list:', orders.length);
  const s1Orders = orders.filter(o => o.salesExecutive?.email === 'sales1@himalayaerp.com' || o.salesExecutiveId === '5e19df6a-8d46-469a-bbe6-98cc0fde47c2');
  console.log('Sales 1 Orders:', s1Orders.length);
  const orderNumbers = orders.map(o => o.orderNumber);
  console.log('Recent Order Numbers sample:', orderNumbers.slice(0, 10));
}
checkOrders().catch(console.error);
