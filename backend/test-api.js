async function test() {
  const companyId = 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
  const headers = {
    'Content-Type': 'application/json',
    'x-company-id': companyId
  };

  console.log('Creating lead...');
  const leadRes = await fetch('http://localhost:3001/api/v1/crm/leads', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      companyName: 'Test Company',
      contactPerson: 'John Doe',
      email: 'john@test.com',
      phone: '1234567890',
      status: 'NEW',
      source: 'WEBSITE'
    })
  });
  
  const leadData = await leadRes.json();
  console.log('Lead Status:', leadRes.status);
  console.log('Lead Body:', leadData);

  if (leadData?.data?.id) {
    console.log('\nCreating sample...');
    const sampleRes = await fetch('http://localhost:3001/api/v1/sales/samples', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        leadId: leadData.data.id,
        companyId: companyId,
        items: [{ productId: 'e71e6682-f1c7-4949-aa94-30416bd52224', quantity: 5, specifications: 'Test' }]
      })
    });
    
    const sampleData = await sampleRes.json();
    console.log('Sample Status:', sampleRes.status);
    console.log('Sample Body:', sampleData);
  }
}
test().catch(console.error);
