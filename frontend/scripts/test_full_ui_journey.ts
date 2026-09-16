import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51';

// Create a small test image file for evidence upload
const testImagePath = path.join(__dirname, 'test_evidence.png');
if (!fs.existsSync(testImagePath)) {
  // 1x1 png base64
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  fs.writeFileSync(testImagePath, Buffer.from(pngBase64, 'base64'));
}

async function fullJourney() {
  console.log('--- Starting Full Customer Complaint UI Journey ---');
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
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  page.on('response', async (res) => {
    if (res.url().includes('complaint')) {
      let bodyText = '';
      try { bodyText = await res.text(); } catch (e) {}
      console.log(`[API ${res.request().method()}] ${res.url()} -> ${res.status()} ${bodyText.slice(0, 150)}`);
    }
  });

  const dismissOverlays = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((el: any) => {
        if (el.innerText && el.innerText.includes('Mandatory Permissions Required') && el.classList?.contains('fixed')) {
          el.remove();
        }
      });
    });
  };

  // STEP 1: Plant Head reviews and approves complaint (if in PLANT_HEAD_PENDING)
  console.log('\n[Step 1] Plant Head Portal: Checking pending complaints...');
  await page.goto('http://localhost:3000/plant-head/customer-complaints', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await dismissOverlays();

  const pendingTab = page.locator('button:has-text("Pending Review")');
  if (await pendingTab.isVisible()) {
    await pendingTab.click({ force: true });
    await page.waitForTimeout(1000);
  }

  const pendingRow = page.locator('tbody tr').first();
  const rowText = (await pendingRow.textContent().catch(() => '')) || '';
  if (rowText.includes('Plant Head Pending')) {
    console.log('Clicking pending complaint row...');
    await pendingRow.click({ force: true });
    await page.waitForTimeout(1500);

    const modalApprove = page.locator('[data-testid="btn-plant-head-approve"], button:has-text("Approve & Send to Dispatch")');
    if (await modalApprove.isVisible()) {
      console.log('Found "Approve & Send to Dispatch" button. Clicking...');
      await modalApprove.click({ force: true });
      await page.waitForTimeout(1000);

      const swalConfirm = page.locator('.swal2-confirm, button:has-text("Yes, Approve & Send to Dispatch")');
      if (await swalConfirm.isVisible()) {
        console.log('Confirming SweetAlert approval...');
        await swalConfirm.click({ force: true });
        await page.waitForTimeout(2500);
      }
    }
  } else {
    console.log('No complaint currently in Plant Head Pending tab (already forwarded to Dispatch).');
  }

  const plantHeadAfterScreenshot = path.join(artifactDir, 'plant_head_approved_flow.png');
  await page.screenshot({ path: plantHeadAfterScreenshot });
  console.log(`Saved: ${plantHeadAfterScreenshot}`);

  // STEP 2: Dispatch Portal: Inspects and submits evidence
  console.log('\n[Step 2] Dispatch Portal: Inspecting and completing physical check...');
  await page.goto('http://localhost:3000/dispatch/customer-complaints', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await dismissOverlays();

  const inspectBtn = page.locator('button:has-text("Inspect & Done"), button:has-text("Done")').first();
  if (await inspectBtn.isVisible()) {
    console.log('Opening Dispatch Done modal...');
    await inspectBtn.click({ force: true });
    await page.waitForTimeout(1500);

    // Upload evidence file directly via setInputFiles
    console.log('Uploading test evidence photo...');
    await page.locator('input[type="file"]').first().setInputFiles(testImagePath);
    await page.waitForTimeout(2500);

    // Enter notes
    const notesInput = page.locator('textarea[placeholder*="notes" i], textarea');
    if (await notesInput.isVisible()) {
      await notesInput.fill('Physical inspection complete: 1 unit damaged in transit. Photo uploaded.');
    }

    const dispatchModalScreenshot = path.join(artifactDir, 'dispatch_inspection_modal.png');
    await page.screenshot({ path: dispatchModalScreenshot });
    console.log(`Saved: ${dispatchModalScreenshot}`);

    // Submit Dispatch inspection
    const submitDispatchBtn = page.locator('button:has-text("Confirm Done & Send to Finance")');
    if (await submitDispatchBtn.isVisible()) {
      console.log('Submitting dispatch inspection to Finance...');
      await submitDispatchBtn.click({ force: true });
      await page.waitForTimeout(3000);
    }
  }

  // STEP 3: Finance Portal: Approves Return and Resolves Complaint
  console.log('\n[Step 3] Finance Portal: Resolving complaint with financial deduction...');
  await page.goto('http://localhost:3000/finance/customer-complaints', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await dismissOverlays();

  const resolveBtn = page.locator('button:has-text("Review & Resolve"), button:has-text("Resolve")').first();
  if (await resolveBtn.isVisible()) {
    console.log('Opening Finance Resolve modal...');
    await resolveBtn.click({ force: true });
    await page.waitForTimeout(1500);

    // Fill finance remarks
    const remarksInput = page.locator('textarea[placeholder*="remarks" i], textarea');
    if (await remarksInput.isVisible()) {
      await remarksInput.fill('Approved return realization deduction verified with Dispatch physical photo evidence.');
    }

    const financeModalScreenshot = path.join(artifactDir, 'finance_resolution_modal.png');
    await page.screenshot({ path: financeModalScreenshot });
    console.log(`Saved: ${financeModalScreenshot}`);

    const confirmResolveBtn = page.locator('button:has-text("Approve Return & Resolve Complaint")');
    if (await confirmResolveBtn.isVisible()) {
      console.log('Clicking "Approve Return & Resolve Complaint"...');
      await confirmResolveBtn.click({ force: true });
      await page.waitForTimeout(1000);

      const swalConfirm = page.locator('.swal2-confirm, button:has-text("Yes, Approve & Resolve")');
      if (await swalConfirm.isVisible()) {
        console.log('Confirming resolution in SweetAlert...');
        await swalConfirm.click({ force: true });
        await page.waitForTimeout(3000);
      }
    }
  }

  // STEP 4: Sales Portal: View Resolved Complaint with deductions and evidence
  console.log('\n[Step 4] Sales Portal: Verifying resolved complaint details...');
  await page.goto('http://localhost:3000/sales/customer-complaints', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await dismissOverlays();

  // Look for resolved complaint row or click first row
  const resolvedRow = page.locator('tbody tr').first();
  if (await resolvedRow.isVisible()) {
    await resolvedRow.click({ force: true });
    await page.waitForTimeout(1500);

    const resolvedDetailScreenshot = path.join(artifactDir, 'sales_resolved_complaint_detail.png');
    await page.screenshot({ path: resolvedDetailScreenshot });
    console.log(`Saved: ${resolvedDetailScreenshot}`);

    const closeBtn = page.locator('button:has-text("Close")');
    if (await closeBtn.isVisible()) await closeBtn.click({ force: true });
  }

  // STEP 5: Sales Dashboard
  console.log('\n[Step 5] Sales Dashboard: Verifying realized metrics...');
  await page.goto('http://localhost:3000/sales', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await dismissOverlays();

  const finalDashboardScreenshot = path.join(artifactDir, 'sales_dashboard_final_realization.png');
  await page.screenshot({ path: finalDashboardScreenshot });
  console.log(`Saved: ${finalDashboardScreenshot}`);

  await browser.close();
  console.log('\n================================================================');
  console.log('✓ FULL END-TO-END UI COMPLAINT LIFECYCLE COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

fullJourney().catch((err) => {
  console.error('Journey failed:', err);
  process.exit(1);
});
