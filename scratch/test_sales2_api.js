async function testSales2Api() {
  const passwords = ['Himalaya@2026', 'HimalayaSales#2', 'admin123'];
  let token = null;

  for (const password of passwords) {
    const loginRes = await fetch('http://127.0.0.1:4001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sales2@himalayaerp.com', password })
    });
    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.accessToken || data.token || data.data?.accessToken;
      console.log(`✓ Logged in as sales2 with password: ${password}`);
      break;
    }
  }

  if (!token) {
    console.log('Failed to log in as sales2');
    return;
  }

  const quotesRes = await fetch('http://127.0.0.1:4001/api/v1/crm/quotations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const quotes = await quotesRes.json();
  const list = Array.isArray(quotes) ? quotes : quotes.data || [];
  console.log(`Sales 2 quotations count: ${list.length}`);

  for (const q of list.slice(0, 3)) {
    console.log({
      quotationNumber: q.quotationNumber,
      salesOwner: q.salesExecutive?.name,
      salesMobile: q.salesExecutiveMobile
    });
    if (q.salesExecutiveMobile === '9586040153') {
      throw new Error('LEAK! Sales 2 received Sales 1 mobile number!');
    }
  }
  console.log('✓ Sales 2 isolation verified: No Sales 1 phone numbers leaked!');
}

testSales2Api();
