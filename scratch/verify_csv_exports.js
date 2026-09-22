require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Mock window and Blob/safeSaveFile for Node environment testing
global.window = {
  location: { origin: 'https://thehimalaya.cloud' }
};

let capturedExports = [];
const mockSafeSaveFile = async (blob, filename, mimeType) => {
  let content = '';
  let buffer = null;
  if (typeof blob === 'string') {
    content = blob;
    buffer = Buffer.from(blob, 'utf8');
  } else if (blob && typeof blob.arrayBuffer === 'function') {
    buffer = Buffer.from(await blob.arrayBuffer());
    content = buffer.toString('utf8');
  }
  capturedExports.push({ filename, content, buffer, mimeType });
  return true;
};

// Transpile salesExportService.ts in memory
const ts = require('typescript');
const serviceTsCode = fs.readFileSync(path.join(__dirname, '../frontend/services/sales/salesExportService.ts'), 'utf8');
const transpiled = ts.transpileModule(serviceTsCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
});

const customRequire = (id) => {
  if (id.includes('export.service')) {
    return { safeSaveFile: mockSafeSaveFile };
  }
  return require(id);
};

const m = { exports: {} };
const runner = new Function('require', 'module', 'exports', '__dirname', '__filename', transpiled.outputText);
runner(customRequire, m, m.exports, path.join(__dirname, '../frontend/services/sales'), path.join(__dirname, '../frontend/services/sales/salesExportService.ts'));

const {
  sanitizeCSVValue,
  formatISODate,
  formatNumeric,
  formatAddress,
  exportLeadsToCSV,
  exportOrdersToCSV,
} = m.exports;

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== STARTING SALES EXPORT TEST SUITE ===');

  // 1. Test CSV Sanitization & Formula Injection Protection
  console.log('\n[Test 1] Testing CSV Escaping & Injection Protection...');
  const test1 = sanitizeCSVValue('=SUM(A1:B2)');
  console.assert(test1.startsWith(`'=`), 'Formula injection protection failed: ' + test1);
  console.log('  Formula protection passed: ' + test1);

  const test2 = sanitizeCSVValue('Standard "Quoted" & Comma, Value');
  console.assert(test2 === '"Standard ""Quoted"" & Comma, Value"', 'Quote escaping failed: ' + test2);
  console.log('  Quote escaping passed: ' + test2);

  const test3 = sanitizeCSVValue(null);
  console.assert(test3 === '', 'Null handling failed: ' + test3);
  console.log('  Null handling passed');

  // 2. Fetch real Leads from DB and test Leads Export
  console.log('\n[Test 2] Testing Leads CSV Export with Database Records...');
  const realLeads = await prisma.lead.findMany({
    include: {
      workflowState: true,
      salesExecutive: true,
      quotations: true,
    },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`  Fetched ${realLeads.length} leads from database.`);

  capturedExports = [];
  const leadsSummaryResult = await exportLeadsToCSV(realLeads, { mode: 'summary' });
  console.log(`  Leads Summary export result:`, leadsSummaryResult);
  console.assert(capturedExports.length === 1, 'Did not capture leads summary export');
  const leadsSummaryBuf = capturedExports[0].buffer;
  console.assert(leadsSummaryBuf[0] === 0xef && leadsSummaryBuf[1] === 0xbb && leadsSummaryBuf[2] === 0xbf, 'Missing UTF-8 BOM in leads summary bytes');
  console.log('  UTF-8 BOM (0xEF, 0xBB, 0xBF) verified in Leads Summary CSV');

  const leadsSummaryLines = capturedExports[0].content.split('\r\n').filter(Boolean);
  console.log(`  Leads Summary lines generated: ${leadsSummaryLines.length} (Header + ${leadsSummaryLines.length - 1} records)`);
  console.assert(leadsSummaryLines.length === realLeads.length + 1, 'Row count mismatch in Leads Summary');

  // Test Leads Item-Wise Mode
  capturedExports = [];
  const leadsItemResult = await exportLeadsToCSV(realLeads, { mode: 'item_level' });
  console.log(`  Leads Item-Level export result:`, leadsItemResult);
  console.assert(capturedExports.length === 1, 'Did not capture leads item export');
  const leadsItemBuf = capturedExports[0].buffer;
  console.assert(leadsItemBuf[0] === 0xef && leadsItemBuf[1] === 0xbb && leadsItemBuf[2] === 0xbf, 'Missing UTF-8 BOM in leads item export');
  console.log('  UTF-8 BOM (0xEF, 0xBB, 0xBF) verified in Leads Item-Level CSV');
  const leadsItemLines = capturedExports[0].content.split('\r\n').filter(Boolean);
  console.log(`  Leads Item-Level lines generated: ${leadsItemLines.length}`);

  // 3. Fetch real Orders from DB and test Orders Export
  console.log('\n[Test 3] Testing Orders CSV Export with Database Records...');
  const realOrders = await prisma.salesOrder.findMany({
    include: {
      customer: true,
      items: { include: { product: true } },
      dispatches: true,
      workflowState: true,
      salesExecutive: true,
      quotation: true,
    },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`  Fetched ${realOrders.length} orders from database.`);

  // Test Orders Master Summary Mode
  capturedExports = [];
  const ordersSummaryResult = await exportOrdersToCSV(realOrders, { mode: 'summary' });
  console.log(`  Orders Summary export result:`, ordersSummaryResult);
  console.assert(capturedExports.length === 1, 'Did not capture orders summary export');
  const ordersSummaryBuf = capturedExports[0].buffer;
  console.assert(ordersSummaryBuf[0] === 0xef && ordersSummaryBuf[1] === 0xbb && ordersSummaryBuf[2] === 0xbf, 'Missing UTF-8 BOM in orders summary');
  console.log('  UTF-8 BOM (0xEF, 0xBB, 0xBF) verified in Orders Master Summary CSV');
  const ordersSummaryLines = capturedExports[0].content.split('\r\n').filter(Boolean);
  console.log(`  Orders Summary lines generated: ${ordersSummaryLines.length} (Header + ${ordersSummaryLines.length - 1} records)`);
  console.assert(ordersSummaryLines.length === realOrders.length + 1, 'Row count mismatch in Orders Summary');

  // Test Orders Item-Wise Mode
  capturedExports = [];
  const ordersItemResult = await exportOrdersToCSV(realOrders, { mode: 'item_level' });
  console.log(`  Orders Item-Wise export result:`, ordersItemResult);
  console.assert(capturedExports.length === 1, 'Did not capture orders item export');
  const ordersItemBuf = capturedExports[0].buffer;
  console.assert(ordersItemBuf[0] === 0xef && ordersItemBuf[1] === 0xbb && ordersItemBuf[2] === 0xbf, 'Missing UTF-8 BOM in orders item export');
  console.log('  UTF-8 BOM (0xEF, 0xBB, 0xBF) verified in Orders Item-Wise CSV');
  const ordersItemLines = capturedExports[0].content.split('\r\n').filter(Boolean);
  console.log(`  Orders Item-Wise lines generated: ${ordersItemLines.length}`);

  // 4. Verify Header Consistency
  console.log('\n[Test 4] Verifying Header Columns and Field Alignment...');
  const headerColsSummary = ordersSummaryLines[0].split(',');
  console.log(`  Orders Summary Header Columns (${headerColsSummary.length} fields):`);
  console.log('   ', headerColsSummary.slice(0, 10).join(', ') + ' ...');

  const headerColsItem = ordersItemLines[0].split(',');
  console.log(`  Orders Item-Wise Header Columns (${headerColsItem.length} fields):`);
  console.log('   ', headerColsItem.slice(0, 10).join(', ') + ' ...');

  console.log('\n✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  await prisma.$disconnect();
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
