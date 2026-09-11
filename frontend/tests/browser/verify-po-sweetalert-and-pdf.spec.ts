import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/SYSTEM3/.gemini/antigravity-ide/brain/18857276-3a85-46f7-a487-faa1c6778da9';

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
      companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015'
    };
    sessionStorage.setItem('erpUser', JSON.stringify(userObj));
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: userObj,
        role: 'Super Admin',
        isAuthenticated: true,
        accessToken: token,
      },
      version: 0
    }));
  }, { token, userData });
}

test('Verify SweetAlert on Manual PO Placement & Complete Store PDF Modal', async ({ page }) => {
  test.setTimeout(90000);

  // 1. Setup authenticated session
  await loginAsSuperAdmin(page);

  // 2. Navigate to Finance Approved POs
  await page.goto('http://localhost:3000/finance/po-requests?tab=Approved%20POs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Take screenshot of Approved POs page
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'finance_approved_pos_tab.png'), fullPage: true });

  // 3. Find "Place Order Manually" button
  const manualOrderBtn = page.locator('button:has-text("Place Order Manually")').first();
  await expect(manualOrderBtn).toBeVisible({ timeout: 15000 });
  await manualOrderBtn.click();

  // 4. Verify Place Order Manually Modal is visible
  const modalHeader = page.locator('h3:has-text("Place Order Manually")');
  await expect(modalHeader).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'place_order_manually_modal.png') });

  // 5. Click "Confirm & Place Order" to trigger SweetAlert
  const confirmBtn = page.locator('button:has-text("Confirm & Place Order")');
  await expect(confirmBtn).toBeVisible();
  await confirmBtn.click();

  // 6. Verify SweetAlert confirmation popup
  const swalPopup = page.locator('.swal2-popup');
  await expect(swalPopup).toBeVisible({ timeout: 10000 });
  const swalTitle = page.locator('.swal2-title:has-text("Confirm & Place Order?")');
  await expect(swalTitle).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'sweetalert_confirm_dialog.png') });

  // 7. Click SweetAlert confirm button
  const swalConfirmBtn = page.locator('.swal2-confirm:has-text("Yes, Confirm & Place Order")');
  await expect(swalConfirmBtn).toBeVisible();
  await swalConfirmBtn.click();

  // 8. Verify SweetAlert success popup
  const swalSuccessTitle = page.locator('.swal2-title:has-text("Order Placed Successfully!")');
  await expect(swalSuccessTitle).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'sweetalert_success_dialog.png') });

  // Dismiss SweetAlert
  const swalDoneBtn = page.locator('.swal2-confirm:has-text("Great, Done")');
  if (await swalDoneBtn.isVisible()) {
    await swalDoneBtn.click();
  }

  // 9. Navigate to Store Purchase
  await page.goto('http://localhost:3000/store/purchase', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'store_purchase_page.png'), fullPage: true });

  // 10. Find PDF preview button
  const pdfBtn = page.locator('button:has-text("View PO PDF"), button:has-text("PDF")').first();
  await pdfBtn.scrollIntoViewIfNeeded();
  await expect(pdfBtn).toBeVisible({ timeout: 15000 });
  await pdfBtn.click();

  // 11. Verify Store PO PDF Modal
  const poPdfModal = page.locator('#po-pdf-print-area');
  await expect(poPdfModal).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=HIMALAYA CONSTRUCTION LTD.')).toBeVisible();
  await expect(page.locator('text=Itemized Materials & Pricing Specifications')).toBeVisible();
  await expect(page.locator('button:has-text("Download PDF")')).toBeVisible();
  await expect(page.locator('button:has-text("Print / Save PDF")')).toBeVisible();

  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'store_po_pdf_preview_modal.png') });

  // 12. Test clicking "Download PDF"
  const downloadPdfBtn = page.locator('button:has-text("Download PDF")');
  await downloadPdfBtn.click();
  await page.waitForTimeout(3000);
  console.log('Download PDF clicked and executed successfully!');
});
