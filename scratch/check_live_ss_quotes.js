async function checkSuperSalesQuotesLive() {
  console.log('--- Checking SuperSales Quotations on https://thehimalaya.cloud ---');

  // SuperSales 1 login
  const ss1Login = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const ss1Data = await ss1Login.json();
  const token1 = ss1Data.data?.accessToken;
  console.log('SuperSales 1 logged in?', !!token1);

  if (token1) {
    const qRes1 = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations', {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const qJson1 = await qRes1.json();
    console.log('SuperSales 1 quotations count on live:', qJson1.data?.length);
    console.log('SuperSales 1 sample quotation:', qJson1.data?.[0] ? {
      number: qJson1.data[0].quotationNumber,
      mobile: qJson1.data[0].salesExecutiveMobile,
      salesExec: qJson1.data[0].salesExecutive?.email
    } : 'None');
  }

  // SuperSales 2 login
  const ss2Login = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales2@himalayaerp.com', password: 'supersales124' })
  });
  const ss2Data = await ss2Login.json();
  const token2 = ss2Data.data?.accessToken;
  console.log('SuperSales 2 logged in?', !!token2);

  if (token2) {
    const qRes2 = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations', {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const qJson2 = await qRes2.json();
    console.log('SuperSales 2 quotations count on live:', qJson2.data?.length);
    console.log('SuperSales 2 sample quotation:', qJson2.data?.[0] ? {
      number: qJson2.data[0].quotationNumber,
      mobile: qJson2.data[0].salesExecutiveMobile,
      salesExec: qJson2.data[0].salesExecutive?.email
    } : 'None');
  }
}

checkSuperSalesQuotesLive().catch(console.error);
