import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/SYSTEM3/.gemini/antigravity-ide/brain/b131691f-f986-4934-af46-d4ea61a07d51';

async function loginAsSuperAdmin(page: Page) {
  let token = '';
  let userData: any = null;
  try {
    const res = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' }),
    });
    const json = await res.json();
    token = json.data?.accessToken || '';
    userData = json.data?.user || null;
  } catch (err) {
    console.error('Login fetch failed:', err);
  }

  await page.addInitScript(({ token, userData }) => {
    (window as any).__PLAYWRIGHT_TEST__ = true;
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('token', token);
    localStorage.setItem('himalaya_token', token);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('himalaya_token', token);

    const userObj = userData || {
      id: '1eeb9aa7-bf73-42cf-aee8-f3db6c9d5731',
      email: 'super.admin@himalayaerp.com',
      name: 'Super Admin',
      role: 'Super Admin',
      companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015',
    };
    sessionStorage.setItem('erpUser', JSON.stringify(userObj));
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: userObj,
        role: 'Super Admin',
        isAuthenticated: true,
        accessToken: token,
      },
      version: 0,
    }));
  }, { token, userData });
}

test.describe('Testing Reports & Test Certificate Verification', () => {
  test('Verify Testing Reports, Certificate layout, and PDF download', async ({ page }) => {
    test.setTimeout(90000);

    // 1. Setup session and navigate directly to /production/testing
    await loginAsSuperAdmin(page);
    await page.goto('http://localhost:3002/production/testing', { waitUntil: 'load' });
    await page.waitForTimeout(4000);

    // 2. Take screenshot of the register view
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'testing_reports_register.png'), fullPage: true });

    // 3. Verify report is present in table
    const reportRow = page.locator('text=TC-2026-0001').first();
    await expect(reportRow).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Tata Projects Limited').first()).toBeVisible();

    // 4. Test opening Certificate Preview Modal
    const viewButton = page.locator('button[title="Preview / Print Certificate"]').first();
    await viewButton.scrollIntoViewIfNeeded();
    await viewButton.click();
    await page.waitForTimeout(2000);

    // Take screenshot of Certificate Preview Modal (Top half)
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'certificate_preview_modal.png') });

    // 5. Verify elements in the Test Certificate
    await expect(page.locator('text=HIMALAYA COMPOSITE & PRECAST PVT. LTD').first()).toBeVisible();
    await expect(page.locator('text=TEST CERTIFICATE').first()).toBeVisible();
    await expect(page.locator('text=MOC of Material').first()).toBeVisible();

    // Scroll down inside the certificate preview container to view the load test section and signatures
    const resultText = page.locator('text=Result:- No Cracks or Determination').first();
    await resultText.scrollIntoViewIfNeeded();
    await expect(resultText).toBeVisible();

    // Take screenshot of bottom half with load tests and signatures
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'certificate_preview_signatures.png') });

    await expect(page.locator('text=Tested By: Plant Head').first()).toBeVisible();
    await expect(page.locator('text=Sana Konda Reddy').first()).toBeVisible();
    await expect(page.locator('text=Approved By:').first()).toBeVisible();

    // 6. Test Download PDF action from modal
    console.log('Testing Download PDF from modal...');
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    const modalDownloadBtn = page.locator('button:has-text("Download PDF")').first();
    await modalDownloadBtn.click();
    const download = await downloadPromise;
    const suggestedFilename = download.suggestedFilename();
    console.log('Downloaded filename from modal:', suggestedFilename);
    expect(suggestedFilename).toContain('Test-Certificate-TC-2026-0001');

    // Close modal
    const closeBtn = page.locator('button[aria-label="Close"]').first();
    await closeBtn.click();
    await page.waitForTimeout(1000);

    // 7. Test direct Download PDF from register row
    console.log('Testing Download PDF from register row...');
    const rowDownloadPromise = page.waitForEvent('download', { timeout: 30000 });
    const rowDownloadBtn = page.locator('button[title="Download Genuine A4 PDF"]').first();
    await rowDownloadBtn.scrollIntoViewIfNeeded();
    await rowDownloadBtn.click();
    const rowDownload = await rowDownloadPromise;
    const rowFilename = rowDownload.suggestedFilename();
    console.log('Downloaded filename from row:', rowFilename);
    expect(rowFilename).toContain('Test-Certificate-TC-2026-0001');

    // 8. Test "+ New Test Certificate" Form Modal
    console.log('Testing New Test Certificate form...');
    const newBtn = page.locator('button:has-text("New Test Certificate")');
    await newBtn.click();
    await page.waitForTimeout(1500);

    // Take screenshot of New Certificate Form Modal
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'new_certificate_form_modal.png') });

    await expect(page.locator('h2:has-text("New Test Certificate")').first()).toBeVisible();
    await expect(page.locator('text=Product Specifications (10 ISO/EN Rows)').first()).toBeVisible();
    await expect(page.locator('text=Load Testing Measurements (5 Sequence Stages)').first()).toBeVisible();

    console.log('✓ All Playwright certificate verification steps passed successfully!');
  });
});
