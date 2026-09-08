const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Set permissions & bypasses
  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('auth_token', 'mock-token-admin');
    localStorage.setItem('auth_user', JSON.stringify({
      id: 'admin-1',
      name: 'Store Admin',
      role: 'ADMIN',
      permissions: ['*']
    }));
    window.__PLAYWRIGHT_TEST__ = true;
  });

  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Check headers of desktop table
  const headers = await page.$$eval('.low-stock-table thead th', ths => ths.map(t => t.textContent.trim()));
  console.log('Table Headers:', headers);

  // Check if any "+ Create Material Indent" buttons exist in table rows
  const rowActionButtons = await page.$$eval('.low-stock-table tbody button', btns => btns.map(b => b.textContent.trim()));
  console.log('Row action buttons (should be empty):', rowActionButtons);

  // Check top-right Create Indent button
  const topCreateIndentBtn = await page.$('.low-stock-header button');
  const topBtnText = topCreateIndentBtn ? await topCreateIndentBtn.textContent() : 'NOT FOUND';
  console.log('Top right button text:', topBtnText);

  // Check initial Indent Status badges in table
  const initialBadges = await page.$$eval('.low-stock-table tbody tr td:last-child', tds => tds.slice(0, 5).map(td => td.textContent.trim()));
  console.log('Initial first 5 rows Indent Status:', initialBadges);

  // Click "+ Create Indent"
  console.log('Clicking "+ Create Indent" button...');
  await topCreateIndentBtn.click();
  await page.waitForTimeout(1000);

  // Check if modal is visible
  const modalVisible = await page.isVisible('.modal-box');
  console.log('Modal visible:', modalVisible);

  if (!modalVisible) {
    console.error('Modal failed to open!');
    await browser.close();
    process.exit(1);
  }

  // Check modal title
  const modalTitle = await page.$eval('.modal-box h3', el => el.textContent.trim());
  console.log('Modal title:', modalTitle);

  // Uncheck select all, then select first 2 materials
  console.log('Testing Clear Selection...');
  const clearBtn = await page.$('button:has-text("Clear Selection")');
  if (clearBtn) await clearBtn.click();
  await page.waitForTimeout(300);

  // Count selected
  let checkedCount = await page.$$eval('.modal-box tbody input[type="checkbox"]:checked', boxes => boxes.length);
  console.log('Checked count after Clear Selection:', checkedCount);

  // Select first 2 checkboxes
  const checkboxes = await page.$$('.modal-box tbody input[type="checkbox"]');
  console.log(`Total materials in modal: ${checkboxes.length}`);
  if (checkboxes.length >= 2) {
    await checkboxes[0].check();
    await checkboxes[1].check();
  }
  await page.waitForTimeout(300);

  checkedCount = await page.$$eval('.modal-box tbody input[type="checkbox"]:checked', boxes => boxes.length);
  console.log('Checked count after selecting 2 items:', checkedCount);

  // Get the item names of selected items
  const selectedItemNames = await page.$$eval('.modal-box tbody tr', rows => {
    return rows.filter(r => {
      const cb = r.querySelector('input[type="checkbox"]');
      return cb && cb.checked;
    }).map(r => {
      const tds = r.querySelectorAll('td');
      return {
        code: tds[1]?.textContent.trim(),
        name: tds[2]?.textContent.trim()
      };
    });
  });
  console.log('Selected items for indent:', selectedItemNames);

  // Fill remarks
  await page.fill('.modal-box input[placeholder="Notes for Plant Head..."]', 'Automated Test Indent for low stock replenishment');

  // Take screenshot of modal with 2 items selected
  const modalScreenshotPath = path.resolve(__dirname, '../scratch/modal_submitting.png');
  await page.screenshot({ path: modalScreenshotPath });
  console.log('Saved modal screenshot to:', modalScreenshotPath);

  // Click Submit Indent
  console.log('Clicking Submit Indent button...');
  const submitBtn = await page.$('button:has-text("Submit Indent")');
  await submitBtn.click();

  // Wait for SweetAlert2 success popup or toast
  await page.waitForTimeout(2500);

  const swalTitle = await page.$eval('.swal2-title, .swal-premium-title', el => el.textContent.trim()).catch(() => null);
  console.log('Swal title after submit:', swalTitle);

  // Close swal if present
  const swalConfirm = await page.$('.swal2-confirm, .swal-premium-confirm-btn');
  if (swalConfirm) {
    await swalConfirm.click();
    await page.waitForTimeout(1000);
  }

  // Now check table on page
  const updatedRows = await page.$$eval('.low-stock-table tbody tr', (rows) => {
    return rows.slice(0, 10).map(r => {
      const tds = r.querySelectorAll('td');
      return {
        code: tds[0]?.textContent.trim(),
        name: tds[1]?.textContent.trim(),
        status: tds[7]?.textContent.trim(),
        indentStatus: tds[8]?.textContent.trim()
      };
    });
  });
  console.log('Updated table first 10 rows:', updatedRows);

  const finalScreenshotPath = path.resolve(__dirname, '../scratch/table_after_indent_created.png');
  await page.screenshot({ path: finalScreenshotPath });
  console.log('Saved final table screenshot to:', finalScreenshotPath);

  await browser.close();
  console.log('Test completed successfully!');
})();
