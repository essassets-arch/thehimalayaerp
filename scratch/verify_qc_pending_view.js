async function run() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/production/qc-pending', { headers });
  const json = await res.json();
  const jobs = json.data?.data || json.data || [];

  const resolveCustomerName = (job) => {
    const so = job.productionPlan?.salesOrder || job.salesOrder;
    const leadObj = so?.quotation?.lead || so?.sourceQuotation?.lead || job.quotation?.lead || job.sourceQuotation?.lead;
    const customerObj = so?.customer || job.customer;
    return (
      customerObj?.companyName ||
      customerObj?.name ||
      leadObj?.companyName ||
      leadObj?.projectName ||
      leadObj?.customerName ||
      so?.customerName ||
      job.customerName ||
      job.companyName ||
      'Consignee Client'
    );
  };

  const job = jobs[0];
  console.log('Work Order Number:', job.workOrderNumber);
  console.log('Sales Order Number:', job.productionPlan?.salesOrder?.orderNumber);
  console.log('Customer Displayed on Table:', resolveCustomerName(job));
  console.log('Product Item:', job.salesOrderItem?.product?.name);
  console.log('Ordered Qty:', job.quantity);
  console.log('Status:', job.status);
  console.log('Production Status:', job.productionStatus);
  console.log('QC Inspection Status:', job.qcInspectionStatus);

  // Test search for 'Revanta'
  const q = 'revanta';
  const soNo = (job.productionPlan?.salesOrder?.orderNumber || '').toLowerCase();
  const woNo = (job.workOrderNumber || '').toLowerCase();
  const customer = (job.productionPlan?.salesOrder?.customer?.companyName || job.productionPlan?.salesOrder?.customer?.name || '').toLowerCase();
  const product = (job.salesOrderItem?.product?.name || '').toLowerCase();
  const matchesSearch = soNo.includes(q) || woNo.includes(q) || customer.includes(q) || product.includes(q);
  console.log('Matches search query "Revanta":', matchesSearch);
}

run().catch(console.error);
