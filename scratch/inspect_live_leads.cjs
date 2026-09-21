const fs = require('fs');

async function inspectLiveLeads() {
  console.log('Logging in to https://thehimalaya.cloud...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });

  const loginData = await loginRes.json();
  if (!loginData.data?.accessToken) {
    console.error('Failed to log in:', loginData);
    return;
  }

  const token = loginData.data.accessToken;
  const user = loginData.data.user;
  console.log(`Logged in as: ${user.name} (${user.email}) | ID: ${user.id} | Company: ${user.companyId}`);

  // Fetch leads
  const leadsRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const leadsData = await leadsRes.json();
  const leads = Array.isArray(leadsData) ? leadsData : (leadsData.data || []);

  console.log(`\nFound ${leads.length} existing leads for SuperSales 1 on live.`);
  leads.forEach((l, idx) => {
    console.log(`${idx + 1}. [${l.leadNumber}] ${l.companyName} | Date: ${l.leadDate} | Status: ${l.workflowState?.name || l.status} | GST: ${l.gstNumber || 'N/A'}`);
  });

  // Save to file for inspection
  fs.writeFileSync('scratch/live_leads_dump.json', JSON.stringify(leads, null, 2));
  console.log('\nDumped existing leads to scratch/live_leads_dump.json');
}

inspectLiveLeads().catch(console.error);
