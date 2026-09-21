async function testWorkflow() {
  // 1. Log in as SuperSales 1
  const ss1Res = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const ss1Data = await ss1Res.json();
  const ss1Token = ss1Data.data?.accessToken;
  const ss1Headers = { Authorization: `Bearer ${ss1Token}`, 'Content-Type': 'application/json' };

  // 2. Log in as Super Admin
  const adminRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const adminToken = (await adminRes.json()).data?.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

  // 3. Log in as Plant Head
  const plantRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sana.r@himalayaerp.com', password: 'Himalaya@1234' })
  });
  const plantToken = (await plantRes.json()).data?.accessToken;
  const plantHeaders = { Authorization: `Bearer ${plantToken}`, 'Content-Type': 'application/json' };

  // 4. Fetch leads
  const leadsRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', { headers: ss1Headers });
  const rawLeads = await leadsRes.json();
  const leadsList = Array.isArray(rawLeads) ? rawLeads : (rawLeads.data || []);
  console.log(`Total leads fetched: ${leadsList.length}`);

  // Fetch current ready-for-dispatch
  const readyRes = await fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch', { headers: adminHeaders });
  const readyData = await readyRes.json();
  const readyList = Array.isArray(readyData.data) ? readyData.data : (readyData.data?.data || []);
  console.log(`Current ready-for-dispatch count: ${readyList.length}`);

  // Pick the last lead to inspect
  const lastLead = leadsList[leadsList.length - 1];
  console.log(`Sample lead: ${lastLead.id} | ${lastLead.leadNumber} | ${lastLead.companyName} | status: ${lastLead.workflowState?.name || lastLead.status}`);
}

testWorkflow().catch(console.error);
