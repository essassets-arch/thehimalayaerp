async function findLiveSSEmployeeIds() {
  const ss1Login = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const ss1Data = await ss1Login.json();
  const token1 = ss1Data.data?.accessToken;

  const qRes1 = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations/QU%2F2627%2F0209', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  // Or fetch list and get quotation
  const qListRes = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  const qListJson = await qListRes.json();
  const q1 = qListJson.data?.[0];
  console.log('SuperSales 1 quotation details on live:', {
    quotationNumber: q1?.quotationNumber,
    salesExecutive: q1?.salesExecutive
  });

  const ss2Login = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales2@himalayaerp.com', password: 'supersales124' })
  });
  const ss2Data = await ss2Login.json();
  const token2 = ss2Data.data?.accessToken;

  const qListRes2 = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations', {
    headers: { Authorization: `Bearer ${token2}` }
  });
  const qListJson2 = await qListRes2.json();
  const q2 = qListJson2.data?.[0];
  console.log('SuperSales 2 quotation details on live:', {
    quotationNumber: q2?.quotationNumber,
    salesExecutive: q2?.salesExecutive
  });
}

findLiveSSEmployeeIds().catch(console.error);
