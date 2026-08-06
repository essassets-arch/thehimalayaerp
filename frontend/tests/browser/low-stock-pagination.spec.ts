import { test, expect } from '@playwright/test';

test('Verify Low Stock Alerts Pagination', async ({ page }) => {
  const baseURL = 'http://localhost:3001';
  console.log('Navigating to login page...');
  await page.goto(`${baseURL}/login`);
  await page.waitForLoadState('networkidle');

  console.log('Logging in as Store Manager...');
  await page.getByTestId('login-email').fill('store.manager@himalayaerp.com');
  await page.getByTestId('login-password').fill('admin123');
  await page.getByTestId('login-submit').click();

  // Wait for login redirection
  await page.waitForURL(`${baseURL}/store/dashboard`, { timeout: 15000 });
  console.log('Successfully logged in. Navigating to low-stock-alerts...');

  await page.goto(`${baseURL}/store/low-stock-alerts`);
  await page.waitForLoadState('networkidle');

  // Print title to confirm
  console.log('Page URL:', page.url());

  // Check if table contains rows
  const rows = page.locator('table.m-theme-table tbody tr');
  const count = await rows.count();
  console.log(`Number of rows rendered on Page 1: ${count}`);

  // Print materials on Page 1
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).locator('td').first().textContent();
    console.log(`Row ${i + 1}: ${text?.trim()}`);
  }

  // Check if pagination controls exist
  const prevButton = page.locator('button:has-text("Previous")');
  const nextButton = page.locator('button:has-text("Next")');
  console.log('Previous button visible:', await prevButton.isVisible());
  console.log('Next button visible:', await nextButton.isVisible());

  if (await nextButton.isVisible()) {
    console.log('Clicking Next page button...');
    await nextButton.click();
    await page.waitForTimeout(1000); // Wait for state change

    const newRows = page.locator('table.m-theme-table tbody tr');
    const newCount = await newRows.count();
    console.log(`Number of rows rendered on Page 2: ${newCount}`);
    for (let i = 0; i < newCount; i++) {
      const text = await newRows.nth(i).locator('td').first().textContent();
      console.log(`Page 2 Row ${i + 1}: ${text?.trim()}`);
    }

    const prevActive = await prevButton.isEnabled();
    console.log('Previous button is enabled on Page 2:', prevActive);
  } else {
    console.log('Next button is not visible. Maybe total pages is 1.');
  }
});
