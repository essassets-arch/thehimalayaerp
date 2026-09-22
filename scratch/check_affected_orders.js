const fs = require('fs');

async function checkAffectedOrders() {
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

  const shyamId = '90bd7a39-245a-480e-a91c-e1e8df9b3ab9';
  const shyamOrders = orders.filter(o => o.customerId === shyamId || o.customer?.id === shyamId);

  console.log(`Total orders linked to customer ${shyamId}: ${shyamOrders.length}`);

  const mismatched = [];
  for (const o of shyamOrders) {
    const leadName = o.lead?.companyName || o.quotation?.lead?.companyName || o.sourceQuotation?.lead?.companyName;
    const orderCustomerName = o.customerName;
    const actualCustomerName = o.customer?.companyName;
    
    console.log(`Order: ${o.orderNumber} | Customer: "${actualCustomerName}" | Lead: "${leadName}" | orderCustomerName: "${orderCustomerName}"`);
    if (leadName && !leadName.toUpperCase().includes('SHYAM SOHAM')) {
      mismatched.push({
        orderId: o.id,
        orderNumber: o.orderNumber,
        leadId: o.lead?.id || o.quotation?.lead?.id,
        leadCompanyName: leadName,
        leadAddress: o.lead?.address || o.quotation?.lead?.address,
        leadPhone: o.lead?.phone || o.quotation?.lead?.phone,
        leadEmail: o.lead?.email || o.quotation?.lead?.email,
        leadGstin: o.lead?.gstNumber || o.quotation?.lead?.gstNumber,
      });
    }
  }

  console.log(`\nMismatched orders count: ${mismatched.length}`);
  fs.writeFileSync('scratch/mismatched_orders.json', JSON.stringify(mismatched, null, 2));
}

checkAffectedOrders().catch(console.error);
