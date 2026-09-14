async function findAndUpdateSS() {
  const adminLogin = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const adminData = await adminLogin.json();
  const token = adminData.data?.accessToken;
  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  // Fetch employees by searching or pagination
  let allEmps = [];
  for (const page of [1, 2, 3, 4]) {
    const res = await fetch(`https://thehimalaya.cloud/api/v1/hr/employees?page=${page}&limit=50`, { headers });
    const json = await res.json();
    const items = json.data?.items || json.data || [];
    allEmps.push(...items);
  }

  console.log(`Retrieved ${allEmps.length} total employees.`);

  const empSS1 = allEmps.find(e =>
    e.workEmail?.toLowerCase().includes('supersales1') ||
    e.fullName?.toLowerCase().includes('supersales 1') ||
    e.fullName?.toLowerCase().includes('supersales one') ||
    e.phoneNumber === '9876510021'
  );

  const empSS2 = allEmps.find(e =>
    e.workEmail?.toLowerCase().includes('supersales2') ||
    e.fullName?.toLowerCase().includes('supersales 2') ||
    e.fullName?.toLowerCase().includes('supersales two') ||
    e.phoneNumber === '9876510022'
  );

  console.log('Found SuperSales 1 Employee on live:', empSS1 ? { id: empSS1.id, name: empSS1.fullName, email: empSS1.workEmail, phone: empSS1.phoneNumber } : 'NOT FOUND');
  console.log('Found SuperSales 2 Employee on live:', empSS2 ? { id: empSS2.id, name: empSS2.fullName, email: empSS2.workEmail, phone: empSS2.phoneNumber } : 'NOT FOUND');

  if (empSS1) {
    console.log('\nUpdating SuperSales 1 to 8488811670...');
    const patch1 = await fetch(`https://thehimalaya.cloud/api/v1/hr/employees/${empSS1.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ phoneNumber: '8488811670', companyPhoneNumber: '8488811670' })
    });
    console.log('SuperSales 1 patch result:', await patch1.json());
  }

  if (empSS2) {
    console.log('\nUpdating SuperSales 2 to 9033516045...');
    const patch2 = await fetch(`https://thehimalaya.cloud/api/v1/hr/employees/${empSS2.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ phoneNumber: '9033516045', companyPhoneNumber: '9033516045' })
    });
    console.log('SuperSales 2 patch result:', await patch2.json());
  }

  // Verify
  console.log('\n--- Verifying SuperSales quotations on https://thehimalaya.cloud ---');
  const ss1Login = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const token1 = (await ss1Login.json()).data?.accessToken;
  const qRes1 = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations', { headers: { Authorization: 'Bearer ' + token1 } });
  const q1 = (await qRes1.json()).data?.[0];
  console.log('SuperSales 1 Quotation on live:');
  console.log({
    number: q1?.quotationNumber,
    salesMobile: q1?.salesExecutiveMobile,
    expected: '8488811670'
  });

  const ss2Login = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales2@himalayaerp.com', password: 'supersales124' })
  });
  const token2 = (await ss2Login.json()).data?.accessToken;
  const qRes2 = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations', { headers: { Authorization: 'Bearer ' + token2 } });
  const q2 = (await qRes2.json()).data?.[0];
  console.log('SuperSales 2 Quotation on live:');
  console.log({
    number: q2?.quotationNumber,
    salesMobile: q2?.salesExecutiveMobile,
    expected: '9033516045'
  });
}

findAndUpdateSS().catch(console.error);
