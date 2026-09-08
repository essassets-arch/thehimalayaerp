async function createAllCustomers() {
  console.log('--- CREATING 19 CUSTOMERS ON LIVE CLOUD VPS ---');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales2@himalayaerp.com', password: 'supersales124' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

  const { loadAllSuperSales2Leads } = require('./test_matching_helper.js');
  const leads = loadAllSuperSales2Leads();

  const customerMap = new Map();
  for (const l of leads) {
    const name = l.companyName.trim();
    if (!customerMap.has(name.toLowerCase())) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      customerMap.set(name.toLowerCase(), {
        companyName: name,
        contactPerson: l.contactPerson,
        email: `contact@${slug}.com`,
        phone: l.phone,
        gstin: l.gstNumber || undefined,
        billingAddress: l.address,
        shippingAddress: l.address,
        companyId,
        status: 'ACTIVE'
      });
    }
  }

  const uniqueCustomers = Array.from(customerMap.values());

  const existingRes = await fetch('https://thehimalaya.cloud/api/v1/sales/customers?pageSize=100', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const existingList = (await existingRes.json()).data?.items || [];
  console.log(`Found ${existingList.length} existing customer(s) on live server.`);

  for (let i = 0; i < uniqueCustomers.length; i++) {
    const c = uniqueCustomers[i];
    const exists = existingList.find(ec => ec.companyName?.toLowerCase() === c.companyName.toLowerCase());
    if (exists) {
      console.log(`Customer ${c.companyName} already exists (${exists.customerCode}), skipping.`);
      continue;
    }

    const res = await fetch('https://thehimalaya.cloud/api/v1/sales/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(c)
    });
    const resData = await res.json();
    if (res.status === 201) {
      console.log(`✓ Created ${resData.data?.customerCode}: ${resData.data?.companyName}`);
    } else {
      console.log(`❌ Failed ${c.companyName}:`, res.status, resData);
    }
  }

  // Final count
  const finalRes = await fetch('https://thehimalaya.cloud/api/v1/sales/customers?pageSize=100', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const finalList = (await finalRes.json()).data?.items || [];
  console.log(`\nTotal customers on live server now: ${finalList.length}`);
}

createAllCustomers().catch(console.error);
