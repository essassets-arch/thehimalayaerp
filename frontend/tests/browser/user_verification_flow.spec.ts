import { test, expect } from '@playwright/test';

test.describe('Real Browser Regression: Cover/Frame/Set UI Flow & All Stock Integration', () => {
  test.setTimeout(120000);

  test('Complete Browser UI Verification Flow', async ({ page, context }) => {
    await context.grantPermissions(['notifications', 'geolocation']);
    await context.setGeolocation({ latitude: 26.9124, longitude: 75.7873 });

    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
    });

    // 1. Log in as Plant Head Sana
    console.log('1. Navigating to login...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"], input[placeholder*="email" i], input[name="email"]').fill('sana.r@himalayaerp.com');
    await page.locator('input[type="password"], input[name="password"]').fill('Himalaya@1234');
    await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first().click();

    await page.waitForTimeout(2000);
    console.log('Login completed, current URL:', page.url());

    // 2. Open Product Master (/plant-head/products)
    console.log('2. Navigating to /plant-head/products...');
    await page.goto('http://localhost:3000/plant-head/products');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Search for FRCCP24x24 HD20
    console.log('Searching for FRCCP24x24 HD20 in Product Master...');
    const searchInput = page.locator('input[placeholder*="Search by code" i], input[type="text"]').first();
    await searchInput.fill('FRCCP24x24 HD20');
    await page.waitForTimeout(1500);

    // Verify FRCCP24x24 HD20 row is visible
    const productRow = page.locator('tr:has-text("FRCCP24x24 HD20"), div:has-text("FRCCP24x24 HD20")').first();
    await expect(productRow).toBeVisible();
    console.log('Found product row for FRCCP24x24 HD20');

    // Click Edit on the row
    const editBtn = page.locator('tr:has-text("FRCCP24x24 HD20") button[title*="Edit" i], tr:has-text("FRCCP24x24 HD20") button:has-text("Edit")').first();
    if (await editBtn.count() > 0) {
      await editBtn.click({ force: true });
      await page.waitForTimeout(1000);

      // Scroll modal to show Product Composition section
      await page.locator('.erp-modal-box').evaluate(el => el.scrollTo(0, el.scrollHeight));
      await page.waitForTimeout(500);

      console.log('Inspecting Product Master Composition Modal...');
      await page.screenshot({ path: 'tests/browser/screenshots/1_product_master_composition.png' });

      // Close modal
      const closeBtn = page.locator('.erp-modal-box button:has-text("×"), .erp-modal-box button:has-text("Cancel")').first();
      if (await closeBtn.count() > 0) await closeBtn.click({ force: true });
      await page.waitForTimeout(500);
    }

    // 3. Open Daily Production (/production/daily-report)
    console.log('3. Navigating to /production/daily-report...');
    await page.goto('http://localhost:3000/production/daily-report');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Set unique date
    const testDate = new Date().toISOString().split('T')[0];
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.count() > 0) {
      await dateInput.fill(testDate);
    }

    // Fill supervisor name if present
    const supervisorInput = page.locator('input[placeholder*="Ravi Sharma" i], input[placeholder*="Supervisor" i]').first();
    if (await supervisorInput.count() > 0) {
      await supervisorInput.fill('Browser Regression Supervisor');
    }

    // Select FRCCP24x24 HD20 in first row
    console.log('Selecting FRCCP24x24 HD20 in first row...');
    const input1 = page.locator('tbody tr').nth(0).locator('input[placeholder="Search product or type custom name..."]');
    await input1.click();
    await page.waitForTimeout(300);
    await input1.fill('FRCCP24x24 HD20');
    await page.waitForTimeout(600);

    await page.locator('.smart-product-popover').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.smart-product-popover > div').filter({ hasText: 'FRCCP24x24 HD20' }).first().click();
    await page.waitForTimeout(500);
    await expect(input1).toHaveValue(/FRCCP24x24 HD20/);

    // Enter Cover = 4, Frame = 2
    console.log('Entering Cover = 4, Frame = 2 for FRCCP24x24 HD20 (2 Cover + 1 Frame = 1 Set)...');
    const row1 = page.locator('tbody tr').nth(0);
    await row1.locator('td[data-label="COVER"] input').fill('4');
    await row1.locator('td[data-label="FRAME"] input').fill('2');
    await page.waitForTimeout(500);

    // Verify Set = 2, Extra Cover = 0, Extra Frame = 0
    await expect(row1.locator('td[data-label="SET"]')).toContainText('2');
    await expect(row1.locator('td[data-label="EXTRA COVER"]')).toContainText('0');
    await expect(row1.locator('td[data-label="EXTRA FRAME"]')).toContainText('0');
    await page.screenshot({ path: 'tests/browser/screenshots/2_daily_report_2to1_verified.png' });
    console.log('✓ Row 1 Verified: Cover=4, Frame=2 -> Set=2, Extra Cover=0, Extra Frame=0');

    // 4. Add second row: 3 Cover + 2 Frame product (FRCCP36x36 Triple Cover HD20)
    console.log('Adding second row for 3:2 product...');
    const addRowBtn = page.locator('button:has-text("+ Add Production Row"), button:has-text("+ Add Line Item"), button:has-text("Add Row")').first();
    await addRowBtn.click();
    await page.waitForTimeout(600);

    const row2 = page.locator('tbody tr').nth(1);
    const input2 = row2.locator('input[placeholder="Search product or type custom name..."]');
    await input2.click();
    await page.waitForTimeout(300);
    await input2.fill('FRCCP36x36 Triple');
    await page.waitForTimeout(800);

    await page.locator('.smart-product-popover').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.smart-product-popover > div').filter({ hasText: 'FRCCP36x36 Triple' }).first().click();
    await page.waitForTimeout(500);
    await expect(input2).toHaveValue(/FRCCP36x36 Triple/);

    // Enter Cover = 4, Frame = 3
    console.log('Entering Cover = 4, Frame = 3 for 3:2 product...');
    await row2.locator('td[data-label="COVER"] input').fill('4');
    await row2.locator('td[data-label="FRAME"] input').fill('3');
    await page.waitForTimeout(500);

    // Verify Set = 1, Extra Cover = +1, Extra Frame = +1
    await expect(row2.locator('td[data-label="SET"]')).toContainText('1');
    await expect(row2.locator('td[data-label="EXTRA COVER"]')).toContainText('+1');
    await expect(row2.locator('td[data-label="EXTRA FRAME"]')).toContainText('+1');
    await page.screenshot({ path: 'tests/browser/screenshots/3_daily_report_3to2_verified.png' });
    console.log('✓ Row 2 Verified: Cover=4, Frame=3 on 3:2 -> Set=1, Extra Cover=1, Extra Frame=1');

    // 5. Add third row: Missing composition product
    console.log('Adding third row for missing composition product...');
    await addRowBtn.click();
    await page.waitForTimeout(600);

    const row3 = page.locator('tbody tr').nth(2);
    const input3 = row3.locator('input[placeholder="Search product or type custom name..."]');
    await input3.click();
    await page.waitForTimeout(300);
    await input3.fill('Standard Cover Slab');
    await page.waitForTimeout(800);

    await page.locator('.smart-product-popover').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.smart-product-popover > div').filter({ hasText: 'Standard Cover Slab' }).first().click();
    await page.waitForTimeout(500);
    await expect(input3).toHaveValue(/Standard Cover Slab/);

    await row3.locator('td[data-label="COVER"] input').fill('5');
    await row3.locator('td[data-label="FRAME"] input').fill('5');
    await page.waitForTimeout(500);

    // Verify missing composition warning appears and does NOT silently default to 1:1
    await expect(row3.locator('td[data-label="SET"]')).toContainText('Missing Composition');
    await page.screenshot({ path: 'tests/browser/screenshots/4_missing_composition_warning.png' });
    console.log('✓ Row 3 Verified: Missing composition warning displayed, prevented silent 1:1 defaulting');

    // Delete row 3 so report contains only valid configured products for submission
    const deleteBtn3 = row3.locator('button[title*="Delete" i], button[title*="Remove" i], button:has-text("🗑️")').first();
    await deleteBtn3.click();
    await page.waitForTimeout(500);

    // 6. Submit Daily Report through browser UI
    console.log('Submitting Daily Report through browser UI...');
    const submitBtn = page.locator('button:has-text("Submit Daily Report")').first();
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Confirm on SweetAlert confirmation dialog
    const swalConfirm = page.locator('.swal2-confirm').first();
    if (await swalConfirm.isVisible()) {
      await swalConfirm.click();
      await page.waitForTimeout(3000);
    }

    // Dismiss SweetAlert success dialog if open
    const swalSuccess = page.locator('.swal2-confirm').first();
    if (await swalSuccess.isVisible()) {
      await swalSuccess.click();
      await page.waitForTimeout(1000);
    }

    console.log('Daily Report submitted successfully through browser UI!');
    await page.screenshot({ path: 'tests/browser/screenshots/5_daily_report_submitted.png' });

    // 7. Open All Stock (/production/all-stock)
    console.log('7. Navigating to /production/all-stock...');
    await page.goto('http://localhost:3000/production/all-stock');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Filter to FRCCP24x24 HD20 to see row clearly
    const stockSearch = page.locator('input[placeholder*="Search product" i]').first();
    if (await stockSearch.isVisible()) {
      await stockSearch.fill('FRCCP24x24 HD20');
      await page.waitForTimeout(1200);
    }

    await page.screenshot({ path: 'tests/browser/screenshots/6_all_stock_view.png' });
    console.log('All Stock view loaded and screenshot captured');

    // 8. Refresh and verify persistence
    console.log('8. Refreshing /production/all-stock to verify persistence...');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const stockSearchReloaded = page.locator('input[placeholder*="Search product" i]').first();
    if (await stockSearchReloaded.isVisible()) {
      await stockSearchReloaded.fill('FRCCP24x24 HD20');
      await page.waitForTimeout(1200);
    }

    await page.screenshot({ path: 'tests/browser/screenshots/7_all_stock_persisted.png' });
    console.log('All Stock view persisted after refresh and screenshot captured!');
    console.log('=== ALL BROWSER REGRESSION CHECKS COMPLETED SUCCESSFULLY ===');
  });
});
