/* Isolated browser regression: test fixtures never enter the application bundle. */
const { build } = require('esbuild');
const { chromium } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const XLSX = require('xlsx');

(async () => {
  const root = path.resolve(__dirname, '..', '..');
  const bundle = await build({
    stdin: { contents: "import React from 'react'; import {createRoot} from 'react-dom/client'; import Page from './frontend/modules/super-admin/pages/BusinessReportsPage.jsx'; createRoot(document.getElementById('root')).render(<Page/>);", resolveDir: root, loader: 'jsx' },
    bundle: true, write: false, platform: 'browser', format: 'iife', loader: { '.css': 'empty' },
    plugins: [{ name: 'isolated-transport', setup(builder) {
      builder.onResolve({ filter: /^@\/lib\/backendFetch$/ }, () => ({ path: 'test-transport', namespace: 'test' }));
      builder.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: "export async function backendFetch(url) { const res=await fetch(url); const data=await res.json(); if(!res.ok) throw new Error(data.message); return data; }" }));
    } }],
  });
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', req.url === '/app.js' ? 'application/javascript' : 'text/html');
    res.end(req.url === '/app.js' ? bundle.outputFiles[0].text : '<html><div id="root"></div><script src="/app.js"></script></html>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ acceptDownloads: true });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const columns = [{ key: 'id', label: 'Id', type: 'String' }, { key: 'amount', label: 'Amount', type: 'Decimal' }];
    const registers = [{ key: 'orders', title: 'Sales Orders', department: 'Sales & CRM', columns, scope: 'Recorded orders.' }, { key: 'employees', title: 'Employees', department: 'HR & Payroll', columns, scope: 'Current employee records.' }];
    let fail = false;
    const observed = [];
    const full = key => ({ ...registers.find(r => r.key === key), period: { label: 'All recorded dates' }, generatedAt: '2026-09-23T12:00:00Z', ignoredFilters: [], total: 26, rows: Array.from({ length: 26 }, (_, i) => ({ id: `${key}-${i + 1}`, amount: i === 0 ? null : i === 1 ? '0' : '1234567890123.45' })) });
    await page.route('**/api/backend/super-admin/reports**', async route => {
      const url = new URL(route.request().url()); observed.push(url);
      let result;
      if (url.pathname.endsWith('/workbook')) result = { generatedAt: '2026-09-23T12:00:00Z', reports: registers.map(r => full(r.key)) };
      else if (url.pathname.endsWith('/records/export')) result = { csv: { filename: 'all-orders.csv', content: 'id,amount\norders-1,Not recorded\norders-26,1234567890123.45' } };
      else if (url.pathname.endsWith('/records')) {
        if (fail) return route.fulfill({ status: 500, json: { message: 'Database unavailable' } });
        const key = url.searchParams.get('dataset'); const number = Number(url.searchParams.get('page'));
        result = full(key); result.rows = result.rows.slice((number - 1) * 25, number * 25);
      } else result = { registers, sections: [{ key: 'sales', title: 'Sales', scope: 'Recorded data', metrics: [{ key: 'count', label: 'Orders', unit: 'Orders', value: 26 }] }], generatedAt: '2026-09-23T12:00:00Z', period: { label: 'All recorded dates' }, filters: { branches: [], customers: [], vendors: [], products: [] }, appliedFilters: {}, csv: { filename: 'summary.csv', content: 'Orders,26' } };
      await route.fulfill({ json: result });
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.getByText('26 matching records', { exact: true }).waitFor();
    assert.equal(observed[0].searchParams.get('rangePreset'), 'ALL_TIME');
    assert.equal(await page.getByRole('cell', { name: 'Not recorded', exact: true }).count(), 1);
    assert.equal(await page.getByRole('cell', { name: '0', exact: true }).count(), 1);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('cell', { name: 'orders-26', exact: true }).waitFor();
    const csvDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export Entire Report CSV', exact: true }).click();
    assert.match(await fs.readFile(await (await csvDownload).path(), 'utf8'), /orders-26,1234567890123.45/);
    const workbookDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export All Module Reports (Excel)', exact: true }).click();
    const workbook = XLSX.read(await fs.readFile(await (await workbookDownload).path()), { type: 'buffer' });
    assert.deepEqual(workbook.SheetNames, ['orders', 'employees', 'Report scope']);
    assert.equal(workbook.Sheets.orders.B27.v, '1234567890123.45');
    const pdfDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'All Displayed Summaries PDF', exact: true }).click();
    assert.equal((await fs.readFile(await (await pdfDownload).path())).subarray(0, 4).toString(), '%PDF');
    await page.getByLabel('Detailed report', { exact: true }).selectOption('employees');
    await page.getByRole('cell', { name: 'employees-1', exact: true }).waitFor();
    fail = true;
    await page.getByLabel('Detailed report', { exact: true }).selectOption('orders');
    await page.getByRole('alert').filter({ hasText: 'Database unavailable' }).waitFor();
    assert.equal(await page.getByRole('cell').count(), 0);
    fail = false;
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await page.getByRole('cell', { name: 'orders-1', exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log('PASS: All Time, null versus zero, pagination, full CSV and workbook exports, PDF, module switching, errors and retry.');
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
