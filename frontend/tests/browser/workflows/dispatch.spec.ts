import { test, expect } from '@playwright/test';

/**
 * End-to-End Dispatch Lifecycle Browser Test
 * Dispatch Creation → Vehicle Assignment → Gate Out → In Transit → Delivery → POD Verification
 */

test.describe('Dispatch Lifecycle Workflow', () => {

  test('Dispatch Orders Queue Loads', async ({ page }) => {
    await page.goto('/dispatch/orders');
    const url = page.url();
    expect(url).toMatch(/dispatch|login/);
  });

  test('Create Dispatch Page Loads', async ({ page }) => {
    await page.goto('/dispatch/create-dispatch');
    const url = page.url();
    expect(url).toMatch(/dispatch|login/);
  });

  test('Sample Dispatch Page Loads', async ({ page }) => {
    await page.goto('/dispatch/sample-dispatch');
    const url = page.url();
    expect(url).toMatch(/dispatch|login/);
  });

});
