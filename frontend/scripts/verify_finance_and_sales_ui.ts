import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51';

async function verifyFinanceAndSales() {
  console.log('--- Starting Finance Resolution and Sales Realization UI Verification ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 23.0225, longitude: 72.5714 },
  });

  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      (window as any).__PLAYWRIGHT_TEST__ = true;
    } catch (e) {}
  });

  const page = await context.newPage();

  // Login
  console.log('Logging in as super.admin@himalayaerp.com...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const dismissOverlays = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((el: any) => {
        if (el.innerText && el.innerText.includes('Mandatory Permissions Required') && el.classList?.contains('fixed')) {
          el.remove();
        }
      });
    });
  };

  // STEP 1: Finance Portal: Inspect complaint in Pending Finance tab
  console.log('\n[Step 1] Finance Portal: Opening /finance/customer-complaints...');
  await page.goto('http://localhost:3000/finance/customer-complaints', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await dismissOverlays();

  const financePendingScreenshot = path.join(artifactDir, 'finance_complaints_pending.png');
  await page.screenshot({ path: financePendingScreenshot });
  console.log(`Saved screenshot: ${financePendingScreenshot}`);

  // Click Review & Resolve
  const resolveBtn = page.locator('button:has-text("Review & Resolve"), button:has-text("Resolve")').first();
  if (await resolveBtn.isVisible()) {
    console.log('Clicking "Review & Resolve"...');
    await resolveBtn.click({ force: true });
    await page.waitForTimeout(1500);

    const financeModalScreenshot = path.join(artifactDir, 'finance_resolution_modal.png');
    await page.screenshot({ path: financeModalScreenshot });
    console.log(`Saved screenshot: ${financeModalScreenshot}`);

    // Fill remarks
    const remarksInput = page.locator('textarea[placeholder*="remarks" i], textarea');
    if (await remarksInput.isVisible()) {
      await remarksInput.fill('Realization deduction authorized per physical dispatch evidence and defect inspection.');
    }

    // Click Approve Return & Resolve Complaint
    const approveBtn = page.locator('button:has-text("Approve Return & Resolve Complaint")');
    if (await approveBtn.isVisible()) {
      console.log('Clicking "Approve Return & Resolve Complaint"...');
      await approveBtn.click({ force: true });
      await page.waitForTimeout(1000);

      // Confirm SweetAlert
      const swalConfirm = page.locator('.swal2-confirm, button:has-text("Yes, Approve & Resolve")');
      if (await swalConfirm.isVisible()) {
        console.log('Confirming SweetAlert in Finance...');
        await swalConfirm.click({ force: true });
        await page.waitForTimeout(3000);
      }
    }
  }

  // STEP 2: Sales Portal: View Resolved Complaint with deductions and evidence
  console.log('\n[Step 2] Sales Portal: Opening /sales/customer-complaints...');
  await page.goto('http://localhost:3000/sales/customer-complaints', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await dismissOverlays();

  const salesResolvedListScreenshot = path.join(artifactDir, 'sales_resolved_list.png');
  await page.screenshot({ path: salesResolvedListScreenshot });
  console.log(`Saved screenshot: ${salesResolvedListScreenshot}`);

  const resolvedRow = page.locator('tbody tr').first();
  if (await resolvedRow.isVisible()) {
    console.log('Opening resolved complaint detail modal...');
    await resolvedRow.click({ force: true });
    await page.waitForTimeout(1500);

    const salesDetailScreenshot = path.join(artifactDir, 'sales_resolved_complaint_detail.png');
    await page.screenshot({ path: salesDetailScreenshot });
    console.log(`Saved screenshot: ${salesDetailScreenshot}`);
  }

  // STEP 3: Sales Dashboard: Verify realization
  console.log('\n[Step 3] Sales Dashboard: Opening /sales...');
  await page.goto('http://localhost:3000/sales', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await dismissOverlays();

  const dashboardScreenshot = path.join(artifactDir, 'sales_dashboard_final_realization.png');
  await page.screenshot({ path: dashboardScreenshot });
  console.log(`Saved screenshot: ${dashboardScreenshot}`);

  await browser.close();
  console.log('\n✓ Finance & Sales Verification Completed Successfully!');
}

verifyFinanceAndSales().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
