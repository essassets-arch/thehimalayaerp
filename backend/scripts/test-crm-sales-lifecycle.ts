const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000/api/v1';

type Json = Record<string, any>;

async function request(path: string, method = 'GET', body?: Json, token?: string) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(method !== 'GET' ? { 'Idempotency-Key': crypto.randomUUID() } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(`${method} ${path} failed (${response.status}): ${JSON.stringify(payload)}`);
  }
  return payload.data ?? payload;
}

async function action(path: string, actionName: string, token: string) {
  return request(path, 'POST', { action: actionName, remarks: 'Automated lifecycle verification' }, token);
}

async function main() {
  const runId = Date.now().toString(36).toUpperCase();
  const login = await request('/auth/login', 'POST', {
    email: 'super.admin@himalayaerp.com',
    password: 'admin123',
  });
  const token = login.accessToken;

  const product = await request('/products', 'POST', {
    name: `Lifecycle Product ${runId}`,
    sku: `E2E-${runId}`,
    unit: 'NOS',
    unitPrice: 1250,
  }, token);

  const lead = await request('/crm/leads', 'POST', {
    companyName: `Lifecycle Customer ${runId}`,
    contactPerson: 'E2E Contact',
    email: `e2e-${runId.toLowerCase()}@example.com`,
    phone: `9${String(Date.now()).slice(-9)}`,
    source: 'OTHER',
    productInterest: product.name,
    estimatedQuantity: 4,
    unit: 'NOS',
    assignedToId: login.user.id,
  }, token);
  await request(`/crm/leads/${lead.id}/activity`, 'POST', {
    activityType: 'CALL',
    notes: 'Qualification call completed',
    scheduledAt: new Date().toISOString(),
  }, token);
  await action(`/crm/leads/${lead.id}/action`, 'CONTACT', token);
  await action(`/crm/leads/${lead.id}/action`, 'IDENTIFY_REQ', token);

  const quotationV1 = await request('/quotations', 'POST', {
    leadId: lead.id,
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
    items: [{
      productId: product.id,
      description: product.name,
      quantity: 4,
      unitPrice: 1250,
      discount: 100,
      tax: 882,
    }],
  }, token);
  const quotation = await request(`/quotations/${quotationV1.id}/version`, 'POST', {}, token);
  await request(`/quotations/${quotation.id}`, 'PATCH', {
    validUntil: new Date(Date.now() + 21 * 86400000).toISOString(),
    items: [{
      productId: product.id,
      description: product.name,
      quantity: 4,
      unitPrice: 1200,
      discount: 100,
      tax: 846,
    }],
  }, token);
  const frozenV1 = await request(`/quotations/${quotationV1.id}`, 'GET', undefined, token);
  if (Number(frozenV1.items[0].unitPrice) !== 1250) {
    throw new Error('Quotation versioning changed the frozen V1 price');
  }
  await action(`/quotations/${quotation.id}/action`, 'SEND', token);
  await action(`/quotations/${quotation.id}/action`, 'APPROVE', token);

  await action(`/crm/leads/${lead.id}/action`, 'SEND_QUOTE', token);
  await action(`/crm/leads/${lead.id}/action`, 'NEGOTIATE', token);
  const wonLead = await action(`/crm/leads/${lead.id}/action`, 'WON', token);
  const customerId = wonLead.convertedCustomerId;
  if (!customerId) throw new Error('Lead conversion did not create/link a customer');

  const order = await request(`/quotations/${quotation.id}/convert`, 'POST', {}, token);
  for (const transition of ['SUBMIT', 'CONFIRM', 'SEND_TO_PLANT', 'PLANT_APPROVE', 'PLAN_PRODUCTION']) {
    await action(`/sales/orders/${order.id}/action`, transition, token);
  }

  const plan = await request('/production/plans', 'POST', {
    salesOrderId: order.id,
    plannedStartDate: new Date().toISOString(),
    plannedEndDate: new Date(Date.now() + 86400000).toISOString(),
    productionLine: 'E2E-LINE',
  }, token);
  for (const transition of ['SUBMIT', 'APPROVE', 'RELEASE']) {
    await action(`/production/plans/${plan.id}/action`, transition, token);
  }
  const workOrders = await request('/production/work-orders', 'GET', undefined, token);
  const workOrder = workOrders.find((row: Json) => row.productionPlanId === plan.id);
  if (!workOrder) throw new Error('Production release did not create a work order');
  for (const transition of ['REQUEST_MATERIALS', 'ISSUE_MATERIALS', 'START', 'COMPLETE']) {
    await action(`/production/work-orders/${workOrder.id}/action`, transition, token);
  }
  const inspections = await request('/qc/inspections', 'GET', undefined, token);
  const inspection = inspections.find((row: Json) => row.workOrderId === workOrder.id);
  if (!inspection) throw new Error('Work-order completion did not create QC inspection');
  await action(`/qc/inspections/${inspection.id}/action`, 'START', token);
  await action(`/qc/inspections/${inspection.id}/action`, 'APPROVE', token);
  await action(`/sales/orders/${order.id}/action`, 'START_PRODUCTION', token);
  await action(`/sales/orders/${order.id}/action`, 'MARK_READY', token);

  const orderDetail = await request(`/sales/orders/${order.id}`, 'GET', undefined, token);
  const dispatch = await request('/logistics/dispatches', 'POST', {
    salesOrderId: order.id,
    items: orderDetail.items.map((item: Json) => ({
      salesOrderItemId: item.id,
      quantity: Number(item.orderedQuantity),
    })),
  }, token);
  for (const transition of ['READY_FOR_DISPATCH', 'DISPATCH', 'DELIVER', 'COMPLETE']) {
    await action(`/logistics/dispatches/${dispatch.id}/action`, transition, token);
  }

  const invoices = await request('/finance/invoices', 'GET', undefined, token);
  const invoice = invoices.find((row: Json) => row.dispatchId === dispatch.id);
  if (!invoice) throw new Error('Dispatch creation did not create an invoice');
  await action(`/finance/invoices/${invoice.id}/action`, 'POST', token);
  const invoiceDetail = await request(`/finance/invoices/${invoice.id}`, 'GET', undefined, token);
  const invoiceTotal = Number(invoiceDetail.totalAmount);
  if (invoiceTotal !== Number(order.totalAmount)) {
    throw new Error(`Commercial reconciliation failed: order=${order.totalAmount}, invoice=${invoiceTotal}`);
  }
  const payment = await request('/finance/payments', 'POST', {
    customerId,
    amount: invoiceTotal,
  }, token);
  await request(`/finance/payments/${payment.id}/submit-verification`, 'POST', {}, token);
  await request(`/finance/payments/${payment.id}/verify`, 'POST', {}, token);
  await request(`/finance/payments/${payment.id}/allocate`, 'POST', {
    allocations: [{ invoiceId: invoice.id, amount: invoiceTotal }],
  }, token);

  const ledger = await request(`/finance/ledger/${customerId}`, 'GET', undefined, token);
  const customer360 = await request(`/customers/${customerId}/360`, 'GET', undefined, token);
  if (Number(ledger.balance) !== 0) throw new Error(`Ledger does not reconcile: ${ledger.balance}`);
  if (!customer360.crm.quotations.some((row: Json) => row.id === quotation.id)) {
    throw new Error('Customer 360 is missing the quotation');
  }
  const closedOrder = await request(`/sales/orders/${order.id}`, 'GET', undefined, token);
  if (closedOrder.workflowStateName !== 'Completed' || closedOrder.status !== 'COMPLETED') {
    throw new Error(`Order did not close consistently: ${closedOrder.status}/${closedOrder.workflowStateName}`);
  }
  const persisted = await request(`/production/plans/${plan.id}`, 'GET', undefined, token);
  if (persisted.workflowState?.code !== 'COMPLETED' || persisted.status !== 'COMPLETED') {
    throw new Error('Production plan did not complete after all work orders passed QC');
  }

  console.log(JSON.stringify({
    success: true,
    runId,
    leadId: lead.id,
    customerId,
    quotationId: quotation.id,
    salesOrderId: order.id,
    productionPlanId: plan.id,
    workOrderId: workOrder.id,
    qcInspectionId: inspection.id,
    dispatchId: dispatch.id,
    invoiceId: invoice.id,
    paymentId: payment.id,
    ledgerBalance: ledger.balance,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
