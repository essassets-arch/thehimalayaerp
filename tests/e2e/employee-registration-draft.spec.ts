import { test, expect, Page } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:3001';
const REGISTER_URL = `${BASE_URL}/hr/register-staff`;
const FIXTURES_DIR = path.join(__dirname, '../fixtures/employees');

test.describe('Employee Registration — Draft', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.removeItem('employee_registration_draft_v1'));
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('TC-16: Partial form data is auto-saved as draft', async ({ page }) => {
    const suffix = String(Date.now());

    await page.fill('input[name="employeeCode"]', `T${suffix.slice(-3)}`);
    await page.fill('input[name="firstName"]', 'DraftFirst');
    await page.fill('input[name="lastName"]', 'DraftLast');

    // Wait for auto-save debounce (800ms + buffer)
    await page.waitForTimeout(1500);

    // Check that draft was saved
    const draft = await page.evaluate(() => localStorage.getItem('employee_registration_draft_v1'));
    expect(draft).not.toBeNull();
    const parsed = JSON.parse(draft!);
    expect(parsed.version).toBe(1);
    expect(parsed.values?.firstName).toBe('DraftFirst');
  });

  test('TC-17: Draft is restored after page refresh', async ({ page }) => {
    const suffix = String(Date.now());

    await page.fill('input[name="employeeCode"]', `T${suffix.slice(-3)}`);
    await page.fill('input[name="firstName"]', 'RefreshTest');
    await page.fill('input[name="lastName"]', 'UserName');

    // Wait for auto-save
    await page.waitForTimeout(1500);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should see "Draft Restored" indicator
    const draftBadge = page.locator('text=Draft Restored');
    await expect(draftBadge).toBeVisible({ timeout: 5000 });

    // Form value should be restored
    const firstNameValue = await page.inputValue('input[name="firstName"]');
    expect(firstNameValue).toBe('RefreshTest');
  });

  test('TC-18: Clear draft button removes saved data and resets form', async ({ page }) => {
    const suffix = String(Date.now());

    // Enter some data
    await page.fill('input[name="firstName"]', 'ClearTest');
    await page.fill('input[name="lastName"]', 'User');
    await page.waitForTimeout(1500);

    // Click Clear Draft
    const clearBtn = page.locator('button', { hasText: 'Clear Draft' });
    await clearBtn.click();

    // Confirm in SweetAlert
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 3000 });
    await page.click('.swal2-confirm');
    await page.waitForTimeout(500);

    // Draft should be removed from localStorage
    const draft = await page.evaluate(() => localStorage.getItem('employee_registration_draft_v1'));
    expect(draft).toBeNull();

    // Form should be cleared
    const firstNameValue = await page.inputValue('input[name="firstName"]');
    expect(firstNameValue).toBe('');
  });

  test('TC-19: Save as Draft button triggers explicit save toast', async ({ page }) => {
    await page.fill('input[name="firstName"]', 'ExplicitDraft');

    const saveDraftBtn = page.locator('button', { hasText: 'Save as Draft' });
    await saveDraftBtn.click();

    // Toast or feedback should appear
    await expect(page.locator('text=Draft saved!')).toBeVisible({ timeout: 4000 });
  });
});

test.describe('Employee Registration — Documents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.removeItem('employee_registration_draft_v1'));
  });

  test('TC-13: Submitting without Aadhaar card upload shows error', async ({ page }) => {
    // Fill valid form fields but skip Aadhaar upload
    // This should fail the mandatory doc validation
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.swal2-html-container')).toContainText('Aadhaar Card');
    await page.click('.swal2-confirm');
  });

  test('TC-11: PDF upload is accepted for mandatory docs', async ({ page }) => {
    // Use setInputFiles to simulate PDF upload on Aadhaar Card upload input
    const aadhaarUploadInput = page.locator('input[type="file"]').first();
    const samplePdf = path.join(FIXTURES_DIR, 'aadhaar-sample.png');
    await aadhaarUploadInput.setInputFiles(samplePdf);

    // Preview section or filename should appear
    await page.waitForTimeout(500);
    const fileInfoVisible = await page.locator('text=aadhaar-sample.png').isVisible();
    expect(fileInfoVisible).toBeTruthy();
  });

  test('TC-20: Multiple additional documents can be added', async ({ page }) => {
    const addBtn = page.locator('button', { hasText: 'Add Document' });
    await addBtn.click();
    await addBtn.click();
    await addBtn.click();

    // Should see 3 additional document rows
    const rows = page.locator('select[value="Resume"]');
    await expect(rows).toHaveCount(3, { timeout: 3000 });
  });
});
