async function testApi() {
  const loginRes = await fetch('http://127.0.0.1:4001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sales1@himalayaerp.com',
      password: 'Himalaya@2026'
    })
  });

  console.log('Login status:', loginRes.status);
  let data;
  try {
    data = await loginRes.json();
  } catch (e) {
    console.log('Failed to parse json:', e);
    return;
  }

  const token = data.accessToken || data.token || data.data?.accessToken;
  console.log('Got token:', Boolean(token));

  if (!token) {
    console.log('Login response:', data);
    return;
  }

  const quotesRes = await fetch('http://127.0.0.1:4001/api/v1/crm/quotations', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log('Quotations status:', quotesRes.status);
  const quotes = await quotesRes.json();
  console.log('Quotations length:', Array.isArray(quotes) ? quotes.length : 'not array');

  const jmd = (Array.isArray(quotes) ? quotes : quotes.data || []).find(q => q.quotationNumber === 'QU/2627/0072');
  console.log('QU/2627/0072 in API response:');
  console.log({
    quotationNumber: jmd?.quotationNumber,
    salesExecutiveMobile: jmd?.salesExecutiveMobile,
    salesExecutivePhone: jmd?.salesExecutivePhone,
    salesExecutive: jmd?.salesExecutive
  });

  if (jmd?.id) {
    const singleRes = await fetch(`http://127.0.0.1:4001/api/v1/crm/quotations/${jmd.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('\nSingle Quotation GET Status:', singleRes.status);
    const singleQuote = await singleRes.json();
    const qData = singleQuote.data || singleQuote;
    console.log('Single quote salesExecutiveMobile:', qData.salesExecutiveMobile);
    console.log('Single quote salesExecutivePhone:', qData.salesExecutivePhone);
    console.log('Single quote salesExecutive:', qData.salesExecutive);
  }
}

testApi();
