const TARGET_SALES_MAPPING = [
  { email: 'sales1@himalayaerp.com', mobile: '9586040153', name: 'Sales 1' },
  { email: 'sales2@himalayaerp.com', mobile: '9998521843', name: 'Sales 2' },
  { email: 'sales3@himalayaerp.com', mobile: '9033516047', name: 'Sales 3' },
  { email: 'sales4@himalayaerp.com', mobile: '8488811682', name: 'Sales 4' },
  { email: 'sales5@himalayaerp.com', mobile: '9033731173', name: 'Sales 5' },
  { email: 'sales11@himalayaerp.com', mobile: '9033516048', name: 'Sales 11' },
  { email: 'sales12@himalayaerp.com', mobile: '8488811630', name: 'Sales 12' },
  { email: 'sales13@himalayaerp.com', mobile: '8488811619', name: 'Sales 13' },
  { email: 'sales14@himalayaerp.com', mobile: '9033516046', name: 'Sales 14' },
];

async function syncLivePhones() {
  console.log('Logging in to https://thehimalaya.cloud as Super Admin...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  if (!token) {
    throw new Error('Failed to log in: ' + JSON.stringify(loginData));
  }
  console.log('✓ Logged in as Super Admin.\n');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Fetch all employees
  const empRes = await fetch('https://thehimalaya.cloud/api/v1/hr/employees?limit=100', { headers });
  const empJson = await empRes.json();
  const employees = empJson.data?.items || empJson.data || [];
  console.log(`Found ${employees.length} employees on live server.`);

  for (const target of TARGET_SALES_MAPPING) {
    const emp = employees.find(e => e.workEmail?.toLowerCase() === target.email.toLowerCase());
    if (!emp) {
      console.warn(`[!] Employee not found for ${target.email}`);
      continue;
    }

    console.log(`Updating ${target.name} (${target.email}) [ID: ${emp.id}]...`);
    console.log(`  Current Phone: ${emp.phoneNumber} / CompPhone: ${emp.companyPhoneNumber}`);
    console.log(`  Target Phone:  ${target.mobile}`);

    const patchRes = await fetch(`https://thehimalaya.cloud/api/v1/hr/employees/${emp.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        phoneNumber: target.mobile,
        companyPhoneNumber: target.mobile
      })
    });

    const patchJson = await patchRes.json();
    if (patchRes.ok && patchJson.success) {
      console.log(`  ✓ SUCCESS: Updated ${target.name} to ${target.mobile}\n`);
    } else {
      console.error(`  ❌ FAILED:`, patchJson, '\n');
    }
  }

  console.log('--- Re-checking live employees on https://thehimalaya.cloud ---');
  const verifyRes = await fetch('https://thehimalaya.cloud/api/v1/hr/employees?limit=100', { headers });
  const verifyJson = await verifyRes.json();
  const updatedEmps = verifyJson.data?.items || verifyJson.data || [];
  for (const target of TARGET_SALES_MAPPING) {
    const e = updatedEmps.find(emp => emp.workEmail?.toLowerCase() === target.email.toLowerCase());
    console.log(`${target.name} (${target.email}): phone -> ${e?.phoneNumber} (Expected: ${target.mobile})`);
  }
}

syncLivePhones().catch(console.error);
