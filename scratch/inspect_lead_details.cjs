async function inspectLeadDetails() {
  const ss1Res = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const ss1Token = (await ss1Res.json()).data?.accessToken;
  const ss1Headers = { Authorization: `Bearer ${ss1Token}`, 'Content-Type': 'application/json' };

  const leadId = '54ce261c-6377-4523-a6dd-418f022cb9de';
  const leadRes = await fetch(`https://thehimalaya.cloud/api/v1/crm/leads/${leadId}`, { headers: ss1Headers });
  const leadData = await leadRes.json();
  console.log('Lead data:', JSON.stringify(leadData, null, 2));

  // Check if there are quotations for this lead
  const qRes = await fetch(`https://thehimalaya.cloud/api/v1/crm/quotations?search=${encodeURIComponent(leadData.companyName || 'P DAS')}`, { headers: ss1Headers });
  const qData = await qRes.json();
  console.log('Quotes found:', JSON.stringify(qData, null, 2));
}

inspectLeadDetails().catch(console.error);
