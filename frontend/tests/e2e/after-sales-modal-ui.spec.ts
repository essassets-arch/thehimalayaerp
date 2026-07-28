import { expect, test } from '@playwright/test';

test('Sales creates canonical replacement and return requests for Plant Head', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: { id: 'AFTER-SALES-UI', name: 'After Sales Auditor', role: 'Super Admin' },
        role: 'Super Admin',
        isAuthenticated: true,
      },
      version: 0,
    }));
  });

  await page.goto('/sales/orders', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toContainText('ORD-HARSH-001');

  await page.evaluate(() => {
    const persisted = JSON.parse(localStorage.getItem('himalaya-erp-store') || '{}');
    const snapshot = persisted.state || persisted;
    const order = snapshot.sales.orders.find((row: any) => row.id === 'ORD-HARSH-001');
    Object.assign(order, {
      commercialStatus: 'ORDER_CLOSED',
      dispatchStatus: 'DELIVERED',
      paymentStatus: 'FULLY_PAID',
      replacementStatus: 'NONE',
      returnStatus: 'NONE',
    });
    snapshot.sales.replacementRequests = [];
    snapshot.sales.returnRequests = [];
    localStorage.setItem('himalaya-erp-store', JSON.stringify(persisted));
  });
  await page.reload({ waitUntil: 'networkidle' });

  let row = page.locator('tr', { hasText: 'ORD-HARSH-001' });
  await row.getByRole('button', { name: 'Ask for Replacement' }).click();
  const replacement = page.getByRole('dialog', { name: 'Request Product Replacement' });
  await replacement.locator('[name="requestedQuantity"]').fill('10');
  await replacement.locator('[name="condition"]').selectOption('DAMAGED_IN_TRANSIT');
  await replacement.locator('[name="reason"]').fill('Surface damage found after unloading');
  await replacement.locator('[name="replacementImages"]').setInputFiles({
    name: 'damage-evidence.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64'
    ),
  });
  await expect(replacement.getByAltText('damage-evidence.png')).toBeVisible();
  await replacement.getByRole('button', { name: 'Submit Replacement Request' }).click();
  await expect(replacement).toBeHidden();

  await page.goto('/plant-head/replacements', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toContainText('ORD-HARSH-001');
  await expect(page.locator('body')).toContainText('REPLACEMENT REQUESTED');
  await page.getByRole('button', { name: 'View' }).click();
  const replacementDetails = page.getByRole('dialog', { name: 'Replacement Request Details' });
  await expect(replacementDetails).toBeVisible();
  await expect(replacementDetails.getByText('Surface damage found after unloading')).toBeVisible();
  await expect(replacementDetails.getByAltText('damage-evidence.png')).toBeVisible();
  await replacementDetails.getByRole('button', { name: 'Close' }).click();

  await page.goto('/sales/orders', { waitUntil: 'networkidle' });
  row = page.locator('tr', { hasText: 'ORD-HARSH-001' });
  await row.getByRole('button', { name: 'Ask for Return' }).click();
  const orderReturn = page.getByRole('dialog', { name: 'Request Order Return / Take Back' });
  await orderReturn.locator('[name="requestedQuantity"]').fill('15');
  await orderReturn.locator('[name="condition"]').selectOption('NOT_REQUIRED');
  await orderReturn.locator('[name="reason"]').fill('Client requirement reduced after delivery');
  await orderReturn.getByRole('button', { name: 'Submit Return Request' }).click();
  await expect(orderReturn).toBeHidden();

  await page.goto('/plant-head/returns', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toContainText('ORD-HARSH-001');
  await expect(page.locator('body')).toContainText('RETURN REQUESTED');
  await page.getByRole('button', { name: 'View' }).click();
  const returnDetails = page.getByRole('dialog', { name: 'Return Request Details' });
  await expect(returnDetails).toBeVisible();
  await expect(returnDetails.getByText('Client requirement reduced after delivery')).toBeVisible();
  await expect(returnDetails.getByText('Harsh Sharma')).toBeVisible();

  const canonical = await page.evaluate(() => {
    const persisted = JSON.parse(localStorage.getItem('himalaya-erp-store') || '{}');
    const snapshot = persisted.state || persisted;
    return {
      replacements: snapshot.sales.replacementRequests,
      returns: snapshot.sales.returnRequests,
      order: snapshot.sales.orders.find((row: any) => row.id === 'ORD-HARSH-001'),
    };
  });

  expect(canonical.replacements).toHaveLength(1);
  expect(canonical.replacements[0].orderId).toBe('ORD-HARSH-001');
  expect(canonical.replacements[0].status).toBe('REPLACEMENT_REQUESTED');
  expect(canonical.replacements[0].photos).toHaveLength(1);
  expect(canonical.replacements[0].photos[0].name).toBe('damage-evidence.png');
  expect(canonical.returns).toHaveLength(1);
  expect(canonical.returns[0].orderId).toBe('ORD-HARSH-001');
  expect(canonical.returns[0].status).toBe('RETURN_REQUESTED');
  expect(canonical.order.dispatchStatus).toBe('DELIVERED');
  expect(canonical.order.paymentStatus).toBe('FULLY_PAID');
  expect(canonical.order.commercialStatus).toBe('ORDER_CLOSED');
});
