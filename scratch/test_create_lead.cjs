async function testCreateLead() {
  console.log('Logging in to https://thehimalaya.cloud...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  const user = loginData.data?.user;

  console.log('Testing create lead on https://thehimalaya.cloud/api/v1/crm/leads...');
  const payload = {
    leadDate: '2026-04-02T00:00:00.000Z',
    companyName: 'TEST API LEAD - VERIFICATION',
    projectName: 'TEST API PROJECT',
    groupName: 'TEST API GROUP',
    contactPerson: 'TEST INCHARGE',
    phone: '9999999999',
    email: 'test@example.com',
    gstName: 'TEST API LEAD - VERIFICATION',
    gstNumber: '24AAQFM5449P1ZG',
    address: {
      line1: '123 Test Street',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pincode: '380001'
    },
    detailedItems: [
      {
        product: 'MHC',
        size: '600X600',
        capacity: 'B125',
        color: 'GREY',
        quantity: 5,
        unitPrice: 6180,
        subTotal: 30900,
        tax: 18,
        gstRate: 18,
        gstAmount: 5562,
        discount: 0,
        grandTotal: 36462,
        specification: 'Product: MHC | Size: 600X600 | Capacity: B125 | Color: GREY | Qty: 5 | Rate: ₹6180'
      }
    ],
    productInterest: 'MHC 600X600 B125 (5 Qty, GREY)',
    estimatedQuantity: 5,
    unit: 'SET',
    source: 'OTHER',
    remarks: 'Test Verification Lead'
  };

  const createRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Create status:', createRes.status);
  const createData = await createRes.json();
  console.log('Create result:', JSON.stringify(createData, null, 2));

  if (createData.data?.id) {
    console.log('Lead created successfully with ID:', createData.data.id, 'and Lead Number:', createData.data.leadNumber);
  }
}

testCreateLead().catch(console.error);
