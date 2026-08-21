import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const REGISTER_URL = `${BASE_URL}/hr/register-staff`;

// ── Shared test helpers ────────────────────────────────────────
async function fillPersonalInfo(page: Page, suffix: string) {
  await page.fill('[data-testid="firstName"], input[placeholder="e.g. Rahul"]', 'Test');
  await page.fill('[data-testid="lastName"], input[placeholder="e.g. Sharma"]', `User${suffix}`);
  await page.fill('input[type="date"][name="dob"]', '1990-05-15');
  await page.selectOption('select[name="gender"]', 'Male');
}

async function fillEmploymentInfo(page: Page, empCode: string) {
  await page.fill('input[name="employeeCode"]', empCode);
  await page.fill('input[name="designation"]', 'Test Engineer');
  await page.selectOption('select[name="workLocation"]', 'Head Office');
  await page.selectOption('select[name="employmentType"]', 'Full-time');
  await page.fill('input[type="date"][name="joiningDate"]', '2026-01-15');
}

async function fillContactInfo(page: Page, suffix: string) {
  await page.fill('input[type="email"][name="email"]', `testuser${suffix}@himalaya.com`);
  await page.fill('input[name="phone"]', '9876543210');
  await page.fill('textarea[name="residentialAddress"]', '123 Test Street, Mumbai, Maharashtra 400001');
}

async function fillEmergencyContact(page: Page) {
  await page.fill('input[name="emergencyName"]', 'Emergency Contact');
  await page.fill('input[name="emergencyPhone"]', '9876512345');
  await page.selectOption('select[name="emergencyRelationship"]', 'Parent');
}

async function fillStatutoryInfo(page: Page, panSuffix: string) {
  await page.fill('input[name="pan"]', `ABCDE${panSuffix}F`);
  // Aadhaar with valid Verhoeff: use a known valid test value
  await page.fill('input[name="aadhaar"]', '234123412347');
}

async function fillBankInfo(page: Page, accountSuffix: string) {
  await page.fill('input[name="bankName"]', 'State Bank of India');
  await page.fill('input[name="bankAccountHolder"]', 'Test User');
  await page.fill('input[name="bankAccount"]', `12345678${accountSuffix}`);
  await page.fill('input[name="confirmBankAccount"]', `12345678${accountSuffix}`);
  await page.fill('input[name="ifscCode"]', 'SBIN0001234');
  await page.selectOption('select[name="accountType"]', 'Savings');
}

// ─────────────────────────────────────────────────────────────────
// TEST SUITE 1 — Validation Tests
// ─────────────────────────────────────────────────────────────────

test.describe('Employee Registration — Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.waitForLoadState('networkidle');
    // Clear any existing draft
    await page.evaluate(() => localStorage.removeItem('employee_registration_draft_v1'));
  });

  test('TC-01: Submit empty form shows required field errors', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    // SweetAlert should appear with validation summary
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.swal2-html-container')).toContainText(['mandatory', 'required', 'is mandatory'].join(''));
    await page.click('.swal2-confirm');
  });

  test('TC-02: Invalid PAN format shows error', async ({ page }) => {
    const suffix = String(Date.now()).slice(-4);
    await fillEmploymentInfo(page, `T${suffix}`);
    await fillContactInfo(page, suffix);
    await page.fill('input[name="pan"]', 'INVALID_PAN'); // bad format
    await page.fill('input[name="aadhaar"]', '234123412347');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.swal2-html-container')).toContainText('PAN');
    await page.click('.swal2-confirm');
  });

  test('TC-03: Invalid Aadhaar fails Verhoeff checksum', async ({ page }) => {
    const suffix = String(Date.now()).slice(-4);
    await fillEmploymentInfo(page, `T${suffix}`);
    await fillContactInfo(page, suffix);
    await page.fill('input[name="pan"]', `ABCDE${suffix.slice(0, 4)}F`);
    await page.fill('input[name="aadhaar"]', '111111111111'); // starts with 1 — invalid
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.swal2-html-container')).toContainText('Aadhaar');
    await page.click('.swal2-confirm');
  });

  test('TC-04: Invalid IFSC format shows error', async ({ page }) => {
    const suffix = String(Date.now()).slice(-4);
    await fillEmploymentInfo(page, `T${suffix}`);
    await fillContactInfo(page, suffix);
    await fillStatutoryInfo(page, suffix.slice(0, 4));
    await page.fill('input[name="bankName"]', 'Test Bank');
    await page.fill('input[name="bankAccount"]', '123456789');
    await page.fill('input[name="confirmBankAccount"]', '123456789');
    await page.fill('input[name="ifscCode"]', 'BADIFSC');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.swal2-html-container')).toContainText('IFSC');
    await page.click('.swal2-confirm');
  });

  test('TC-05: Mismatched bank account numbers show error', async ({ page }) => {
    const suffix = String(Date.now()).slice(-4);
    await fillEmploymentInfo(page, `T${suffix}`);
    await fillContactInfo(page, suffix);
    await fillStatutoryInfo(page, suffix.slice(0, 4));
    await page.fill('input[name="bankName"]', 'SBI');
    await page.fill('input[name="bankAccountHolder"]', 'Test User');
    await page.fill('input[name="bankAccount"]', '12345678');
    await page.fill('input[name="confirmBankAccount"]', '87654321'); // different
    await page.fill('input[name="ifscCode"]', 'SBIN0001234');
    await page.selectOption('select[name="accountType"]', 'Savings');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.swal2-html-container')).toContainText('match');
    await page.click('.swal2-confirm');
  });

  test('TC-06: Future date of birth is rejected', async ({ page }) => {
    const suffix = String(Date.now()).slice(-4);
    await fillEmploymentInfo(page, `T${suffix}`);
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    await page.fill('input[type="date"][name="dob"]', futureDate.toISOString().split('T')[0]);
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.swal2-html-container')).toContainText('future');
    await page.click('.swal2-confirm');
  });

  test('TC-07: Probation end date before joining date is rejected', async ({ page }) => {
    const suffix = String(Date.now()).slice(-4);
    await fillPersonalInfo(page, suffix);
    await fillEmploymentInfo(page, `T${suffix}`);
    await page.fill('input[type="date"][name="joiningDate"]', '2026-06-01');
    await page.fill('input[type="date"][name="probationEndDate"]', '2026-01-01'); // before joining
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.swal2-html-container')).toContainText('Probation');
    await page.click('.swal2-confirm');
  });

  test('TC-08: UAN with wrong digit count is rejected', async ({ page }) => {
    const suffix = String(Date.now()).slice(-4);
    await fillPersonalInfo(page, suffix);
    await fillEmploymentInfo(page, `T${suffix}`);
    await fillContactInfo(page, suffix);
    await fillEmergencyContact(page);
    await page.fill('input[name="pan"]', `ABCDE${suffix.slice(0, 4)}F`);
    await page.fill('input[name="aadhaar"]', '234123412347');
    await page.fill('input[name="uan"]', '123'); // too short
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.swal2-html-container')).toContainText('UAN');
    await page.click('.swal2-confirm');
  });
});
