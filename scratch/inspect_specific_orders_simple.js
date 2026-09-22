async function check() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const soRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?pageSize=1000', { headers });
  const soJson = await soRes.json();
  const orders = soJson.data?.data || soJson.data || [];

  for (const num of ['HCPPL/2627/0368', 'HCPPL/2627/0367', 'HCPPL/2627/0366', 'HCPPL/2627/0365']) {
    const o = orders.find(x => x.orderNumber === num);
    if (!o) continue;
    console.log(`\n================== ${num} ==================`);
    console.log('Order ID:', o.id);
    console.log('customerId:', o.customerId);
    console.log('customer:', o.customer);
    console.log('customerName:', o.customerName);
    console.log('lead.companyName:', o.lead?.companyName);
    console.log('lead.projectName:', o.lead?.projectName);
    console.log('quotation.lead.companyName:', o.quotation?.lead?.companyName);
    console.log('quotation.lead.projectName:', o.quotation?.lead?.projectName);
    console.log('quotation.customer:', o.quotation?.customer);
  }
}

check().catch(console.error);
