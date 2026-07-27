import { expect, test, type Page } from '@playwright/test';

const routes = [
  '/sales/leads',
  '/sales/quotations',
  '/sales/orders',
  '/plant-head/incoming-orders',
  '/plant-head/planning',
  '/production/incoming-orders',
  '/production/work-orders',
  '/production/finished-goods',
  '/dispatch/orders',
  '/dispatch/in-transit',
  '/dispatch/delivery',
  '/sales/payment-followup',
  '/finance/payment-verification',
];

async function assertRouteLoaded(page: Page, route: string) {
  console.log(`Checking ${route}`);
  await page.goto(route, { waitUntil: 'networkidle' });
  await expect(page.locator('body')).not.toContainText(/404|application error|runtime error/i);
}

async function setBrowserStage(page: Page, stage: string) {
  await page.evaluate((nextStage) => {
    const raw = localStorage.getItem('himalaya-erp-store');
    if (!raw) throw new Error('Canonical ERP snapshot is missing');
    const persisted = JSON.parse(raw);
    const state = persisted.state || persisted;
    const order = state.sales.orders.find((item: any) => item.id === 'ORD-HARSH-001');
    const workOrder = state.production.workOrders.find((item: any) => item.id === 'WO-HARSH-001');
    const consignment = state.dispatch.consignments.find((item: any) => item.id === 'DSP-HARSH-001');
    const payment = state.sales.paymentConfirmations.find((item: any) => item.id === 'PAY-HARSH-001');

    if (nextStage === 'CONFIRMED') Object.assign(order, {
      commercialStatus: 'ORDER_CONFIRMED', planningStatus: 'NOT_SENT',
      productionStatus: 'NOT_STARTED', qcStatus: 'NOT_READY',
      dispatchStatus: 'NOT_READY', paymentStatus: 'NOT_DUE',
    });
    if (nextStage === 'ACCEPTED') Object.assign(order, {
      commercialStatus: 'SENT_TO_PLANT_HEAD', planningStatus: 'PLANT_HEAD_ACCEPTED',
      productionStatus: 'NOT_STARTED',
    });
    if (nextStage === 'ACCEPTED') {
      state.production.workOrders = state.production.workOrders.filter((item: any) => item.orderId !== 'ORD-HARSH-001');
    }
    if (nextStage === 'PLANNED') Object.assign(order, {
      commercialStatus: 'SENT_TO_PLANT_HEAD', planningStatus: 'PRODUCTION_PLANNED',
      productionStatus: 'NOT_STARTED',
    });
    if (nextStage === 'WORK_ORDER') {
      Object.assign(order, { planningStatus: 'PRODUCTION_PLANNED', productionStatus: 'WORK_ORDER_CREATED' });
      const currentWorkOrder = state.production.workOrders.find((item: any) => item.id === 'WO-HARSH-001');
      if (currentWorkOrder) currentWorkOrder.status = 'WORK_ORDER_CREATED';
      else state.production.workOrders.push({
        id: 'WO-HARSH-001',
        workOrderNo: 'WO-HARSH-001',
        orderId: 'ORD-HARSH-001',
        items: order.items,
        status: 'WORK_ORDER_CREATED',
      });
    }
    if (nextStage === 'FINISHED_GOODS') Object.assign(order, {
      productionStatus: 'PRODUCTION_COMPLETED', qcStatus: 'QC_APPROVED', dispatchStatus: 'NOT_READY',
    });
    if (nextStage === 'DISPATCH_QUEUE') Object.assign(order, {
      qcStatus: 'QC_APPROVED', dispatchStatus: 'READY_FOR_DISPATCH',
    });
    if (nextStage === 'IN_TRANSIT') {
      order.dispatchStatus = 'IN_TRANSIT';
      consignment.status = 'IN_TRANSIT';
    }
    if (nextStage === 'PAYMENT_PENDING') {
      Object.assign(order, { commercialStatus: 'ORDER_ACTIVE', dispatchStatus: 'DELIVERED', paymentStatus: 'FINANCE_VERIFICATION_PENDING' });
      payment.status = 'FINANCE_VERIFICATION_PENDING';
    }
    if (nextStage === 'DELIVERED') {
      Object.assign(order, { commercialStatus: 'ORDER_ACTIVE', dispatchStatus: 'DELIVERED', paymentStatus: 'NOT_DUE' });
      consignment.status = 'DELIVERED';
    }
    if (nextStage === 'FINAL') {
      Object.assign(order, { commercialStatus: 'ORDER_CLOSED', dispatchStatus: 'DELIVERED', paymentStatus: 'FULLY_PAID' });
      consignment.status = 'DELIVERED';
      payment.status = 'FINANCE_VERIFIED';
    }
    localStorage.setItem('himalaya-erp-store', JSON.stringify(persisted));
  }, stage);
  await page.reload({ waitUntil: 'networkidle' });
}

test('Harsh O2C records are wired across browser routes', async ({ page }) => {
  test.setTimeout(90_000);
  page.on('pageerror', error => console.log(`PAGE ERROR: ${error.stack || error.message}`));
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('harsh-o2c-cleared')) {
      localStorage.removeItem('himalaya-erp-store');
      sessionStorage.setItem('harsh-o2c-cleared', '1');
    }
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: { id: 'UI-AUDIT', name: 'O2C UI Auditor', role: 'Super Admin' },
        role: 'Super Admin',
        isAuthenticated: true,
      },
      version: 0,
    }));
  });

  // Sales Orders owns the idempotent browser test-data initializer.
  await assertRouteLoaded(page, '/sales/orders');
  await expect(page.locator('body')).toContainText('ORD-HARSH-001');

  for (const route of routes) {
    await assertRouteLoaded(page, route);
  }

  await assertRouteLoaded(page, '/sales/leads');
  await expect(page.locator('body')).toContainText('Harsh Infrastructure');

  await assertRouteLoaded(page, '/sales/quotations');
  await expect(page.locator('body')).toContainText('QTN-HARSH-001');

  await setBrowserStage(page, 'CONFIRMED');
  await assertRouteLoaded(page, '/sales/orders');
  const confirmedRow = page.locator('tr', { hasText: 'ORD-HARSH-001' });
  await expect(confirmedRow).toContainText('Send to Plant Head');
  await confirmedRow.getByRole('button', { name: 'Send to Plant Head' }).click();
  const sendConfirmation = page.getByRole('dialog', { name: 'Send Order to Plant Head?' });
  await expect(sendConfirmation).toBeVisible();
  await sendConfirmation.getByRole('button', { name: 'Yes, Send Order' }).click();
  await expect(page.getByText('Order Sent Successfully')).toBeVisible();
  await assertRouteLoaded(page, '/plant-head/incoming-orders');
  await expect(page.locator('body')).toContainText('ORD-HARSH-001');

  await setBrowserStage(page, 'ACCEPTED');
  await assertRouteLoaded(page, '/plant-head/planning');
  await expect(page.locator('body')).toContainText('ORD-HARSH-001');

  await setBrowserStage(page, 'PLANNED');
  await assertRouteLoaded(page, '/production/incoming-orders');
  await expect(page.locator('body')).toContainText('ORD-HARSH-001');

  await setBrowserStage(page, 'WORK_ORDER');
  await assertRouteLoaded(page, '/production/work-orders');
  await expect(page.locator('body')).toContainText(/WO-HARSH-001|ORD-HARSH-001/);

  await setBrowserStage(page, 'FINISHED_GOODS');
  await assertRouteLoaded(page, '/production/finished-goods');
  await expect(page.locator('body')).toContainText(/FG-HARSH-001|ORD-HARSH-001/);

  await setBrowserStage(page, 'DISPATCH_QUEUE');
  await assertRouteLoaded(page, '/dispatch/orders');
  await expect(page.locator('body')).toContainText(/DORD-HARSH-001|ORD-HARSH-001/);

  await setBrowserStage(page, 'IN_TRANSIT');
  await assertRouteLoaded(page, '/dispatch/in-transit');
  await expect(page.locator('body')).toContainText(/DSP-HARSH-001|ORD-HARSH-001/);
  await assertRouteLoaded(page, '/dispatch/delivery');
  await expect(page.locator('body')).toContainText(/DSP-HARSH-001|ORD-HARSH-001|Harsh Infrastructure/);

  await setBrowserStage(page, 'DELIVERED');
  await setBrowserStage(page, 'PAYMENT_PENDING');
  await assertRouteLoaded(page, '/sales/payment-followup');
  await expect(page.locator('body')).toContainText(/Harsh Infrastructure|ORD-HARSH-001/);
  await assertRouteLoaded(page, '/finance/payment-verification');
  await page.getByRole('button', { name: 'Sales Confirmations' }).click();
  await expect(page.locator('body')).toContainText(/PAY-HARSH-001|ORD-HARSH-001/);

  await setBrowserStage(page, 'FINAL');
  await assertRouteLoaded(page, '/sales/orders');
  const body = page.locator('body');
  await expect(body).toContainText('ORD-HARSH-001');
  await expect(body).toContainText('Harsh Infrastructure');
  await expect(body).toContainText(/2,04,280|2\.04 L/);
  await expect(body).toContainText(/Closed/i);
  await expect(body).not.toContainText(/\brf\b/);
  await expect(body).not.toContainText(/\bsd\b/);
  await expect(body).not.toContainText('₹0');

  const harshRow = page.locator('tr', { hasText: 'ORD-HARSH-001' });
  await expect(harshRow).toContainText(/Ask for Replacement/i);
  await expect(harshRow).toContainText(/Ask for Return/i);
  await expect(harshRow).not.toContainText(/Ask for Payment/i);

  await harshRow.getByRole('button', { name: 'Ask for Replacement' }).click();
  const replacementDialog = page.getByRole('dialog', { name: 'Request Product Replacement' });
  await expect(replacementDialog).toBeVisible();
  await replacementDialog.locator('[name="requestedQuantity"]').fill('10');
  await replacementDialog.locator('[name="condition"]').selectOption('DAMAGED_IN_TRANSIT');
  await replacementDialog.locator('[name="reason"]').fill('Surface damage found after unloading');
  await replacementDialog.getByRole('button', { name: 'Submit Replacement Request' }).click();
  await expect(replacementDialog).toBeHidden();

  await assertRouteLoaded(page, '/plant-head/replacements');
  await expect(page.locator('body')).toContainText(/REP-|ORD-HARSH-001/);

  await assertRouteLoaded(page, '/sales/orders');
  const returnRow = page.locator('tr', { hasText: 'ORD-HARSH-001' });
  await returnRow.getByRole('button', { name: 'Ask for Return' }).click();
  const returnDialog = page.getByRole('dialog', { name: 'Request Order Return / Take Back' });
  await expect(returnDialog).toBeVisible();
  await returnDialog.locator('[name="requestedQuantity"]').fill('15');
  await returnDialog.locator('[name="condition"]').selectOption('NOT_REQUIRED');
  await returnDialog.locator('[name="reason"]').fill('Client requirement reduced after delivery');
  await returnDialog.getByRole('button', { name: 'Submit Return Request' }).click();
  await expect(returnDialog).toBeHidden();

  await assertRouteLoaded(page, '/plant-head/returns');
  await expect(page.locator('body')).toContainText(/RET-|ORD-HARSH-001/);

  await assertRouteLoaded(page, '/orders/ORD-HARSH-001');
  await expect(page.locator('body')).toContainText('Harsh Infrastructure Pvt Ltd');
  await expect(page.locator('body')).toContainText('WO-HARSH-001');
  await expect(page.locator('body')).not.toContainText('Order Not Found');

  await assertRouteLoaded(page, '/sales/orders');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('body')).toContainText('ORD-HARSH-001');
  await expect(page.locator('body')).not.toContainText('₹0');
});
