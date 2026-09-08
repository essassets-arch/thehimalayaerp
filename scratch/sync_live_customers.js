async function syncCustomers() {
  console.log('--- SYNCING CUSTOMERS FOR THE 27 LEADS ON LIVE CLOUD VPS ---');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales2@himalayaerp.com', password: 'supersales124' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

  const { loadAllSuperSales2Leads } = require('./test_matching_helper.js');
  const leads = loadAllSuperSales2Leads();

  // Deduplicate customers by companyName
  const customerMap = new Map();
  for (const l of leads) {
    const name = l.companyName.trim();
    if (!customerMap.has(name.toLowerCase())) {
      customerMap.set(name.toLowerCase(), {
        companyName: name,
        contactPerson: l.contactPerson,
        email: l.email,
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
  console.log(`Found ${uniqueCustomers.length} unique customer companies.`);

  // Get current customers
  const custRes = await fetch('https://thehimalaya.cloud/api/v1/sales/customers?pageSize=100', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const custData = await custRes.json();
  const existingCustomers = custData.data?.items || [];
  console.log(`Found ${existingCustomers.length} existing customers on live server.`);

  const firstCust = uniqueCustomers[0];
  if (existingCustomers.length > 0 && existingCustomers[0].companyName === 'TEST CUSTOMER FROM API') {
    const targetId = existingCustomers[0].id;
    console.log(`Updating CUST-000001 (${targetId}) to ${firstCust.companyName}`);
    await fetch(`https://thehimalaya.cloud/api/v1/sales/customers/${targetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        companyName: firstCust.companyName,
        contactPerson: firstCust.contactPerson,
        email: firstCust.email,
        phone: firstCust.phone,
        gstin: firstCust.gstin,
        billingAddress: firstCust.billingAddress,
        shippingAddress: firstCust.shippingAddress
      })
    });
  }

  // Create remaining
  for (let i = 0; i < uniqueCustomers.length; i++) {
    const c = uniqueCustomers[i];
    const exists = existingCustomers.some(ec => ec.companyName?.toLowerCase() === c.companyName.toLowerCase());
    if (exists && (i !== 0 || existingCustomers[0].companyName !== 'TEST CUSTOMER FROM API')) {
      console.log(`Customer ${c.companyName} already exists, skipping.`);
      continue;
    }
    if (i === 0 && existingCustomers.length > 0 && existingCustomers[0].companyName === 'TEST CUSTOMER FROM API') {
      continue; // already updated above
    }

    console.log(`Creating customer ${i + 1}/${uniqueCustomers.length}: ${c.companyName}...`);
    const res = await fetch('https://thehimalaya.cloud/api/v1/sales/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(c)
    });
    const resJson = await res.json();
    if (res.status === 201) {
      console.log(`  ✓ Created ${resJson.data?.customerCode}: ${resJson.data?.companyName}`);
    } else {
      console.log(`  Status ${res.status}:`, resJson.message || resJson.error);
    }
  }

  // Verify
  const verifyRes = await fetch('https://thehimalaya.cloud/api/v1/sales/customers?pageSize=100', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const vData = await verifyRes.json();
  const vList = vData.data?.items || [];
  console.log(`\nTotal verified live customers: ${vList.length}`);
  vList.forEach((c, idx) => {
    console.log(`${idx + 1}. ${c.customerCode} | ${c.companyName} | ${c.contactPerson} | ${c.phone} | GST: ${c.gstin || 'None'}`);
  });
}
syncCustomers().catch(console.error);
