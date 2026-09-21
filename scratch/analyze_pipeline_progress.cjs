const fs = require('fs');

async function analyzeProgress() {
  const orig = new Set(JSON.parse(fs.readFileSync('scratch/live_leads_dump.json')).map(l => l.id));

  const ss1Res = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const ss1Token = (await ss1Res.json()).data?.accessToken;
  const ss1Headers = { Authorization: `Bearer ${ss1Token}`, 'Content-Type': 'application/json' };

  const leadsRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', { headers: ss1Headers });
  const raw = await leadsRes.json();
  const list = Array.isArray(raw) ? raw : (raw.data || []);
  const newLeads = list.filter(l => !orig.has(l.id));

  console.log(`Total new leads: ${newLeads.length}`);
  const statusCounts = {};
  newLeads.forEach(l => {
    const s = l.workflowState?.name || l.status || 'Unknown';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  console.log('New leads status distribution:', statusCounts);
}

analyzeProgress().catch(console.error);
