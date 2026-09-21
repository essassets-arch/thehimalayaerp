async function inspectTargetQuotes() {
  const ss1Res = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const ss1Token = (await ss1Res.json()).data?.accessToken;
  const ss1Headers = { Authorization: `Bearer ${ss1Token}`, 'Content-Type': 'application/json' };

  const adminRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const adminToken = (await adminRes.json()).data?.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

  const qRes = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations?limit=1000', { headers: ss1Headers });
  const qData = await qRes.json();
  const qList = Array.isArray(qData) ? qData : (qData.data || []);

  const q184 = qList.find(q => q.quotationNumber === 'QU/2627/0184' || q.quotationNumber?.includes('0184'));
  const q178 = qList.find(q => q.quotationNumber === 'QU/2627/0178' || q.quotationNumber?.includes('0178'));

  console.log('Q 0184:', q184 ? { id: q184.id, num: q184.quotationNumber, customer: q184.customerName || q184.customer?.companyName, total: q184.total, status: q184.status || q184.workflowState?.name } : 'NOT FOUND');
  console.log('Q 0178:', q178 ? { id: q178.id, num: q178.quotationNumber, customer: q178.customerName || q178.customer?.companyName, total: q178.total, status: q178.status || q178.workflowState?.name } : 'NOT FOUND');
}

inspectTargetQuotes().catch(console.error);
