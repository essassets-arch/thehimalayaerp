const fs = require('fs');

async function checkOrder() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  // Fetch sales orders
  console.log('Fetching sales orders...');
  const soRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?pageSize=1000', { headers });
  const soJson = await soRes.json();
  const orders = soJson.data?.data || soJson.data || [];

  console.log('Total orders:', orders.length);

  const targets = orders.filter(o => 
    (o.orderNumber && (o.orderNumber.includes('0368') || o.orderNumber.includes('0367'))) ||
    (o.customer?.companyName && (o.customer.companyName.includes('SHYAM') || o.customer.companyName.includes('TRIPUR'))) ||
    (o.customerName && (o.customerName.includes('SHYAM') || o.customerName.includes('TRIPUR')))
  );

  console.log('Matched Sales Orders count:', targets.length);
  for (const t of targets) {
    console.log('\n=============================================');
    console.log('ID:', t.id);
    console.log('OrderNumber:', t.orderNumber);
    console.log('Customer:', JSON.stringify(t.customer, null, 2));
    console.log('CustomerName field:', t.customerName);
    console.log('ProjectName field:', t.projectName);
    console.log('Lead:', JSON.stringify(t.lead, null, 2));
    console.log('Quotation:', JSON.stringify(t.quotation ? {
      id: t.quotation.id,
      lead: t.quotation.lead,
      customer: t.quotation.customer,
      projectName: t.quotation.projectName
    } : null, null, 2));
    console.log('SourceQuotation:', JSON.stringify(t.sourceQuotation ? {
      id: t.sourceQuotation.id,
      lead: t.sourceQuotation.lead,
      customer: t.sourceQuotation.customer,
      projectName: t.sourceQuotation.projectName
    } : null, null, 2));
    console.log('Items:', (t.items || t.orderItems || []).map(i => ({
      id: i.id,
      productName: i.productNameSnapshot || i.productName || i.product?.name,
      sku: i.product?.sku,
      quantity: i.orderedQuantity || i.quantity
    })));
  }

  // Also fetch work orders for 0368 / 0367
  console.log('\nFetching work orders...');
  const woRes = await fetch('https://thehimalaya.cloud/api/v1/production/work-orders?pageSize=1000', { headers });
  const woJson = await woRes.json();
  const wos = woJson.data?.data || woJson.data || [];
  console.log('Total WOs:', wos.length);

  const matchedWos = wos.filter(w => 
    w.workOrderNumber?.includes('00441') ||
    w.workOrderNumber?.includes('00440') ||
    w.workOrderNumber?.includes('00439') ||
    w.workOrderNumber?.includes('0368') ||
    w.workOrderNumber?.includes('0367')
  );

  console.log('Matched WOs count:', matchedWos.length);
  for (const w of matchedWos) {
    console.log('\n--- Work Order ---');
    console.log('ID:', w.id);
    console.log('WO Number:', w.workOrderNumber);
    console.log('SalesOrderId:', w.salesOrderId);
    console.log('SalesOrderNumber:', w.salesOrderNumber);
    console.log('Customer:', JSON.stringify(w.customer, null, 2));
    console.log('CustomerName:', w.customerName);
    console.log('Product:', w.productName || w.product?.name);
    console.log('ProdPlan salesOrder:', w.productionPlan?.salesOrder?.orderNumber, w.productionPlan?.salesOrder?.customer?.companyName);
  }
}

checkOrder().catch(console.error);
