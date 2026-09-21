async function testCreateQuote() {
  const ss1Res = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const ss1Token = (await ss1Res.json()).data?.accessToken;
  const ss1Headers = { Authorization: `Bearer ${ss1Token}`, 'Content-Type': 'application/json' };

  // Lead: b106e401-b6b1-4e51-b721-fcf4fe986e4a
  const leadRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads/b106e401-b6b1-4e51-b721-fcf4fe986e4a', { headers: ss1Headers });
  const leadData = (await leadRes.json()).data;
  console.log('Lead detailed items:', leadData.detailedItems);

  const quotePayload = {
    leadId: leadData.id,
    items: leadData.detailedItems.map(item => ({.
      productId: item.productId,
      productName: item.productName,
      productCode: item.productCode,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      discount: Number(item.discount) || 0,
      tax: 18,
      lineTotal: Number(item.grandTotal) || (Number(item.quantity) * Number(item.unitPrice) * 1.18)
    })),
    expectedTransportationCost: 0,
    paymentTerms: '30 Days',
    remarks: 'Auto-converted quotation for SuperSales 1'
  };

  console.log('Posting quotation payload...');
  const createRes = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations', {
    method: 'POST',
    headers: ss1Headers,
    body: JSON.stringify(quotePayload)
  });
  const createData = await createRes.json();
  console.log('Quotation creation response:', createRes.status, JSON.stringify(createData, null, 2));
}

testCreateQuote().catch(console.error);
