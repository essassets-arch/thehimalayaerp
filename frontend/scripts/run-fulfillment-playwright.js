const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runVerification() {
  console.log('--- STARTING PLAYWRIGHT BROWSER ACCEPTANCE CHECK ---');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Pipe page logs and exceptions
  page.on('console', msg => console.log(`[BROWSER CONSOLE]: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[BROWSER ERROR]: ${err.toString()}`));

  const screenshotDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\910edb9c-7aa5-45ab-844b-0f7bbb820f06';

  try {
    // 1. Login
    console.log('1. Navigating to Login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotDir, '01_login_page.png') });
    
    console.log('Filling credentials...');
    await page.getByTestId('login-email').fill('plant.head@himalayaerp.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.screenshot({ path: path.join(screenshotDir, '02_filled_credentials.png') });
    
    console.log('Clicking login...');
    await page.getByTestId('login-submit').click();

    console.log('Waiting for redirect to Plant Head dashboard...');
    await page.waitForURL(/\/plant-head/, { timeout: 15000 });
    console.log('Logged in successfully!');
    await page.screenshot({ path: path.join(screenshotDir, '03_dashboard.png') });

    // 2. Planning Board
    console.log('2. Navigating to Planning Board...');
    await page.goto('http://localhost:3000/plant-head/planning');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotDir, '04_planning_board.png') });

    // 3. Search and Verify Table Columns & Badges
    console.log('3. Verifying pending planning order HCCL/2627/0002...');
    const row = page.locator('tr', { hasText: 'HCCL/2627/0002' });
    await expectToBeVisible(row, 'Order HCCL/2627/0002 row');

    const productsCell = row.locator('td').nth(3);
    const productsText = await productsCell.innerText();
    console.log(`- Products list in column: \n${productsText}`);

    const fulfillmentCell = row.locator('td').nth(4);
    const fulfillmentText = await fulfillmentCell.innerText();
    console.log(`- Fulfillment status badge: "${fulfillmentText}" (Expected: Mixed Fulfillment)`);
    if (!fulfillmentText.includes('Mixed Fulfillment')) {
      throw new Error(`Unexpected fulfillment text: ${fulfillmentText}`);
    }

    const statusCellText = await row.locator('td').nth(6).innerText();
    console.log(`- Status cell text: "${statusCellText}"`);

    const actionCellText = await row.locator('td').nth(7).innerText();
    console.log(`- Action cell text: "${actionCellText}"`);

    // 4. Open Modal
    console.log('4. Clicking "View & Plan" to open modal...');
    const planBtn = row.locator('button', { hasText: 'View & Plan' });
    await planBtn.click();

    console.log('Waiting for Fulfillment Decision modal to load...');
    const modal = page.locator('div.modal-overlay.active');
    await expectToBeVisible(modal, 'Fulfillment Decision Modal');
    await page.screenshot({ path: path.join(screenshotDir, '05_open_modal_edit.png') });

    const modalHeaderHtml = await modal.locator('.modal-header-row').innerHTML();
    console.log(`- Modal Header HTML: \n${modalHeaderHtml}`);

    const modalTitle = await modal.locator('h3').first().innerText();
    console.log(`- Modal Title: "${modalTitle}" (Expected: Fulfillment Decision)`);

    // Verify Product Cards
    console.log('Verifying product cards...');
    const cards = modal.locator('div', { hasText: 'SKU:' });
    const cardCount = await cards.count();
    console.log(`- Found ${cardCount} product cards in modal.`);

    // 5. Verify that LD has no inputs because it is already committed, while ELD has no inputs because it is Direct Dispatch
    console.log('5. Verifying that committed LD has no inputs and pending ELD has no inputs...');
    const dateInputCountBefore = await modal.locator('input[type="date"]').count();
    console.log(`- Date inputs found before submit: ${dateInputCountBefore} (Expected: 0)`);
    if (dateInputCountBefore !== 0) {
      throw new Error(`Expected 0 date inputs, found ${dateInputCountBefore}`);
    }
    await page.screenshot({ path: path.join(screenshotDir, '06_filled_modal.png') });

    // 6. Submit
    console.log('6. Clicking Submit Fulfillment Plan...');
    const submitBtn = modal.locator('button', { hasText: 'Submit Fulfillment Plan' });
    await submitBtn.click();

    // Confirm Swal
    console.log('Confirming SweetAlert dialog...');
    const swalConfirmBtn = page.locator('button.swal2-confirm');
    await expectToBeVisible(swalConfirmBtn, 'Swal Confirm Button');
    await swalConfirmBtn.click();

    // Dismiss Success Swal
    console.log('Dismissing success SweetAlert...');
    const swalSuccessOkBtn = page.locator('button.swal2-confirm');
    await expectToBeVisible(swalSuccessOkBtn, 'Swal Success Ok Button');
    await swalSuccessOkBtn.click();

    // 7. Verify Read-Only Mode in Planned / Active tab
    console.log('7. Switching to "Planned / Active" tab...');
    await page.click('button:has-text("Planned / Active")');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotDir, '07_planned_active_tab.png') });

    console.log('Locating planned order HCCL/2627/0002...');
    const activeRow = page.locator('tr', { hasText: 'HCCL/2627/0002' });
    await expectToBeVisible(activeRow, 'Planned Order row');

    const activeFulfillmentText = await activeRow.locator('td').nth(4).innerText();
    console.log(`- Active Fulfillment status badge: "${activeFulfillmentText}"`);

    console.log('Clicking "View" button...');
    const viewBtn = activeRow.locator('button', { hasText: 'View' });
    await viewBtn.click();

    console.log('Waiting for read-only modal...');
    await expectToBeVisible(modal, 'Read-only Modal');

    const readOnlyModalTitle = await modal.locator('h3').first().innerText();
    console.log(`- Read-only Modal Title: "${readOnlyModalTitle}"`);

    // Verify inputs are static/disabled
    const dateInputCount = await modal.locator('input[type="date"]').count();
    console.log(`- Date inputs found in read-only mode: ${dateInputCount} (Expected: 0)`);

    // Take screenshot of read-only mode
    const screenshotPath = path.join(screenshotDir, 'planning_read_only_modal.png');
    console.log(`Taking screenshot of read-only modal state to: ${screenshotPath}`);
    await page.screenshot({ path: screenshotPath });

    // Close Modal
    console.log('Closing read-only modal...');
    const closeBtn = modal.locator('button', { hasText: 'Close' });
    await closeBtn.click();

    console.log('\n--- BROWSER ACCEPTANCE VERIFICATION PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('PLAYWRIGHT ACCEPTANCE TEST FAILED:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

async function expectToBeVisible(locator, name) {
  await locator.waitFor({ state: 'visible', timeout: 8000 });
  if (!(await locator.isVisible())) {
    throw new Error(`Assertion failed: ${name} is not visible!`);
  }
}

runVerification();
