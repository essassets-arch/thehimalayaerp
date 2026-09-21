// Isolated browser verification. Responses are test fixtures; no application API/database is used.
const { build } = require('esbuild');
const { chromium } = require('@playwright/test');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const root = path.resolve(__dirname, '../..');
  const bundle = await build({
    stdin: { contents: "import React from 'react'; import {createRoot} from 'react-dom/client'; import Page from './frontend/modules/plant-head/components/MaterialWiseAnalysisView.jsx'; createRoot(document.getElementById('root')).render(<Page />);", resolveDir: root, loader: 'jsx' },
    bundle: true, write: false, outdir: 'out', loader: { '.jsx': 'jsx' },
    plugins: [{ name: 'isolated-api', setup(b) { b.onResolve({ filter: /^@\/lib\/backendFetch$/ }, () => ({ path: 'api', namespace: 'fixture' })); b.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export async function backendFetch(url) { const response = await fetch(url); if (!response.ok) throw new Error("Unavailable"); return response.json(); }', loader: 'js' })); } }],
  });
  const js = bundle.outputFiles.find(file => file.path.endsWith('.js')).text;
  const css = bundle.outputFiles.find(file => file.path.endsWith('.css')).text;
  const materials = Array.from({ length: 236 }, (_, i) => ({ materialId: `m${i}`, materialName: `Material ${String(i).padStart(3, '0')}`, materialSku: `RM-${i}`, category: 'Raw Material', unit: 'KG', isActive: true, currentStock: 10, openingStock: 8, received: 4, issued: 2, adjustment: 0, closingStock: 10, minimumStock: 1, stockStatus: 'IN_STOCK', movement: 'ACTIVE', transactions: 2 }));
  let fail = false;
  const requests = [];
  const server = http.createServer((req, res) => {
    if (req.url === '/app.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(js); }
    if (req.url === '/app.css') { res.setHeader('Content-Type', 'text/css'); return res.end(css); }
    if (req.url.startsWith('/api/')) {
      requests.push(req.url);
      res.setHeader('Content-Type', 'application/json');
      if (fail) { res.statusCode = 503; return res.end('{}'); }
      if (req.url.includes('/transactions?')) return res.end(JSON.stringify({ data: [], total: 0, totalPages: 1 }));
      const month = new URL(req.url, 'http://localhost').searchParams.get('month');
      return res.end(JSON.stringify({ period: { periodLabel: month, startDate: '2026-08-31T18:30:00.000Z', endDate: '2026-09-30T18:30:00.000Z' }, generatedAt: '2026-09-21T00:00:00Z', materials, kpis: { totalMaterials: 236, materialsWithMovement: 236, lowStockCount: 0, outOfStockCount: 0, unknownStockCount: 0, totalTransactions: 472 }, totalsByUnit: [{ unit: 'KG', materials: 236, currentStock: 2360, openingStock: 1888, received: 944, issued: 472, adjustment: 0, closingStock: 2360 }], dataQuality: { unknownTransactions: 0 }, dailyFlow: [] }));
    }
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="root"></div><script src="/app.js"></script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.getByText('236 matching of 236 materials. No catalog or export limit.').waitFor();
    await page.getByLabel('Rows per page').selectOption('250');
    await page.getByRole('rowheader', { name: /Material 235/ }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'View movements' }).count(), 236);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export 236 materials' }).click();
    const stream = await (await download).createReadStream(); const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    assert.equal(Buffer.concat(chunks).toString('utf8').split('\r\n').length, 237);
    await page.getByLabel('Search', { exact: true }).fill('RM-235');
    assert.equal(await page.getByRole('button', { name: 'View movements' }).count(), 1);
    await page.getByRole('button', { name: 'View movements' }).click();
    await page.getByText('No transactions in this period.').waitFor();
    assert(requests.some(url => url.includes('m235/transactions') && url.includes('endDate=2026-09-30')));
    await page.getByLabel('Month', { exact: true }).fill('2026-10');
    await page.getByRole('button', { name: 'Apply period' }).click();
    await page.getByText('2026-10', { exact: true }).waitFor();
    assert(requests.some(url => url.includes('month=2026-10')));
    await page.setViewportSize({ width: 375, height: 812 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    fail = true;
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByRole('heading', { name: 'All Store materials' }).count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: 236-material rendering/export, search, period filtering, history dates, mobile width, error state; no browser runtime errors.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
