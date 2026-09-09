async function run() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  const custId = 'b0dabb2c-dcc0-414d-a013-4561e11f5b9a';
  const getRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/customers/${custId}`, { headers });
  const cust = await getRes.json();
  const version = cust.data?.version || 1;
  console.log('Customer version:', version);

  console.log('Updating customer companyName to Revanta Fortune Group with expectedVersion:', version);
  const patchRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/customers/${custId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      companyName: 'Revanta Fortune Group',
      expectedVersion: version
    })
  });
  console.log('Patch customer status:', patchRes.status);
  const patched = await patchRes.json();
  console.log('Patched customer result:', patched.data?.companyName || patched);

  // Verify qc-pending endpoint now
  const qcRes = await fetch('https://thehimalaya.cloud/api/v1/production/qc-pending', { headers });
  const qcData = await qcRes.json();
  const list = qcData.data?.data || qcData.data || [];
  console.log('QC Pending items now:', list.length);
  for (const item of list) {
    const customer = item.productionPlan?.salesOrder?.customer;
    console.log({
      wo: item.workOrderNumber,
      order: item.productionPlan?.salesOrder?.orderNumber,
      customerCompanyName: customer?.companyName,
      customerContact: customer?.contactPerson
    });
  }
}

run().catch(console.error);
