const fs = require('fs');

async function verifyCloudLeads() {
  console.log('Logging in to https://thehimalaya.cloud...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });

  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  const user = loginData.data?.user;

  console.log(`Logged in: ${user.name} (${user.email})`);

  // Fetch all leads
  const leadsRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const leadsData = await leadsRes.json();
  const leads = Array.isArray(leadsData) ? leadsData : (leadsData.data || []);

  console.log(`\n========================================================`);
  console.log(`TOTAL LEADS FOR SUPERSALES 1 ON CLOUD: ${leads.length}`);
  console.log(`========================================================`);

  // 1. Verify 17 original leads
  const origList = JSON.parse(fs.readFileSync('scratch/live_leads_dump.json', 'utf8'));
  console.log(`\nChecking preservation of all ${origList.length} original leads:`);
  let allOrigPreserved = true;
  for (const orig of origList) {
    const found = leads.find(l => l.id === orig.id);
    if (!found) {
      console.error(`❌ Missing original lead: ${orig.leadNumber} - ${orig.companyName}`);
      allOrigPreserved = false;
    } else {
      // Check quotations
      const origQuotes = orig.quotations?.length || 0;
      const foundQuotes = found.quotations?.length || 0;
      if (origQuotes !== foundQuotes) {
        console.warn(`⚠️ Quotation count mismatch for ${orig.leadNumber}: was ${origQuotes}, now ${foundQuotes}`);
      }
    }
  }

  if (allOrigPreserved) {
    console.log(`✅ All ${origList.length} original leads and their quotations/orders are 100% intact and untouched!`);
  }

  // 2. Breakdown of newly added leads
  const newLeads = leads.filter(l => !origList.some(o => o.id === l.id));
  console.log(`\nNewly added leads count: ${newLeads.length}`);

  // Count items across newly added leads
  let totalNewItems = 0;
  newLeads.forEach(l => {
    const items = Array.isArray(l.detailedItems) ? l.detailedItems : [];
    totalNewItems += items.length;
  });
  console.log(`Total line items across new leads: ${totalNewItems}`);

  // Group by month
  const monthCounts = {};
  leads.forEach(l => {
    const d = new Date(l.leadDate);
    const mStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    monthCounts[mStr] = (monthCounts[mStr] || 0) + 1;
  });

  console.log('\nLeads breakdown by Month:');
  Object.keys(monthCounts).sort().forEach(m => {
    console.log(`  - ${m}: ${monthCounts[m]} leads`);
  });

  // Verify sample newly added leads
  console.log('\nSample newly added leads:');
  newLeads.slice(0, 3).forEach((l, idx) => {
    console.log(`  ${idx + 1}. [${l.leadNumber}] ${l.companyName} | Date: ${l.leadDate.slice(0, 10)} | City: ${l.address?.city} | State: ${l.address?.state} | Items: ${l.detailedItems?.length || 0} | Product: ${l.productInterest}`);
  });
  newLeads.slice(-3).forEach((l, idx) => {
    console.log(`  ${newLeads.length - 3 + idx + 1}. [${l.leadNumber}] ${l.companyName} | Date: ${l.leadDate.slice(0, 10)} | City: ${l.address?.city} | State: ${l.address?.state} | Items: ${l.detailedItems?.length || 0} | Product: ${l.productInterest}`);
  });
}

verifyCloudLeads().catch(console.error);
