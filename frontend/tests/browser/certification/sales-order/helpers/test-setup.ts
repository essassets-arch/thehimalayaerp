const path = require('path');
const fs = require('fs');

// Load browser-test env explicitly without depending on dotenv
const envPath = path.resolve(__dirname, '../../../../../../.env.browser-test');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line: string) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const backendTestEnvPath = path.resolve(__dirname, '../../../../../../backend/.env.browser-test');
const backendEnvPath = path.resolve(__dirname, '../../../../../../backend/.env');
const targetEnv = fs.existsSync(backendTestEnvPath) ? backendTestEnvPath : backendEnvPath;

if (fs.existsSync(targetEnv)) {
  const envContent = fs.readFileSync(targetEnv, 'utf-8');
  envContent.split('\n').forEach((line: string) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const val = match[2].trim();
      process.env[match[1].trim()] = val.startsWith('"') && val.endsWith('"') ? val.slice(1, -1) : val;
    }
  });
}

let PrismaClient;
try {
  // Try backend node_modules first
  PrismaClient = require(path.resolve(__dirname, '../../../../../../backend/node_modules/@prisma/client')).PrismaClient;
} catch (e1) {
  try {
    // Fallback to hoisted root node_modules
    PrismaClient = require(path.resolve(__dirname, '../../../../../../node_modules/@prisma/client')).PrismaClient;
  } catch (e2) {
    throw new Error('Could not resolve @prisma/client from backend or root node_modules');
  }
}

const prisma = new PrismaClient();

export function getPrismaClient() {
  return prisma;
}

export function generateTestSuffix() {
  return Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString();
}

/**
 * Safely ages a sample by 21 days for return eligibility.
 * Modifies ONLY deliveredAt and expectedDeliveryDate as required by the business rule.
 * Immutable audit timestamps (createdAt/updatedAt) are preserved.
 */
export async function ageSampleForReturnEligibility(sampleId: string) {
  const sample = await prisma.sampleRequest.findUnique({ where: { id: sampleId } });
  if (!sample) throw new Error(`Sample ${sampleId} not found`);

  const twentyOneDaysAgo = new Date();
  twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);

  await prisma.sampleRequest.update({
    where: { id: sampleId },
    data: {
      deliveredAt: twentyOneDaysAgo,
      expectedDeliveryDate: twentyOneDaysAgo,
      // We do NOT modify createdAt or updatedAt here.
    }
  });
  
  return twentyOneDaysAgo;
}

export const DUMMY_PNG_BUFFER = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

import { expect, Page } from '@playwright/test';

/**
 * Performs a robust login resisting Next.js React hydration wipes.
 */
export async function performRobustLogin(
  page: Page,
  email: string,
  pwd = process.env.E2E_COMMON_PASSWORD || 'admin123',
  targetUrl: RegExp | string = /\/sales(?:\/dashboard)?(?:[/?#]|$)/
) {
  if (typeof targetUrl === 'string' && page.url().includes(targetUrl)) return;
  if (targetUrl instanceof RegExp && targetUrl.test(page.url())) return;

  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  if (typeof targetUrl === 'string' && page.url().includes(targetUrl)) return;
  if (targetUrl instanceof RegExp && targetUrl.test(page.url())) return;

  for (let attempt = 0; attempt < 3; attempt++) {
    const emailInput = page.getByTestId('login-email');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill(email);
      await page.getByTestId('login-password').fill(pwd);
      await page.getByTestId('login-submit').click();
    }
    try {
      await expect(page).toHaveURL(targetUrl, { timeout: 8000 });
      return;
    } catch (e) {
      if (attempt === 2) throw e;
      await page.waitForTimeout(1000);
    }
  }
}
