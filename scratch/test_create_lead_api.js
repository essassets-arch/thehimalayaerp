async function test() {
  const loginRes = await fetch('http://localhost:4001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales2@himalayaerp.com', password: 'supersales124' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  console.log('Got token:', Boolean(token));

  const leadPayload = {
    companyName: 'TEST CLIENT',
    projectName: 'TEST PROJECT',
    contactPerson: 'TL',
    phone: '9998184929',
    email: 'info@thehimalaya.co.in',
    gstName: 'TEST CLIENT',
    gstNumber: '24AAKCV4374K1ZV',
    address: {
      line1: '302, TRINITY COMPLEX',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pincode: '380059'
    },
    productInterest: 'RCS 300x300x32 ELD (1 Qty, BLACK)',
    detailedItems: [
      {
        product: 'RCS',
        size: '300x300x32',
        capacity: 'ELD',
        color: 'BLACK',
        quantity: 1,
        unitPrice: 2695,
        subTotal: 2695,
        tax: 18,
        gstRate: 18,
        gstAmount: 485.1,
        discount: 0,
        grandTotal: 3180.1
      }
    ],
    estimatedQuantity: 1,
    unit: 'SET',
    remarks: 'Test Lead'
  };

  const createRes = await fetch('http://localhost:4001/api/v1/crm/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(leadPayload)
  });

  const resData = await createRes.json();
  console.log('Create lead response status:', createRes.status);
  console.log('Create lead response data:', resData);

  if (resData.data?.id) {
    // delete test lead
    const delRes = await fetch(`http://localhost:4001/api/v1/crm/leads/${resData.data.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('Delete status:', delRes.status);
  }
}
test().catch(console.error);
