const https = require('https');
const http = require('http');

function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const indentId = process.argv[2];
  if (!indentId) {
    console.error("Usage: node test-approve.js <indent-id>");
    process.exit(1);
  }
  
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const items = await prisma.purchaseIndentItem.findMany({ where: { purchaseIndentId: indentId } });
  console.log('Stored indent items:', JSON.stringify(items, null, 2));
  await prisma.$disconnect();
  
  const payload = {
    items: items.map(i => ({
      productId: i.productId,
      approvedQuantity: Number(i.quantity),
      quantity: Number(i.quantity)
    })),
    remarks: 'Approved by test script'
  };
  
  console.log('Sending approval payload:', JSON.stringify(payload, null, 2));
  
  const res = await httpPost(
    `http://localhost:4000/api/v1/procurement/indents/${indentId}/approve`,
    JSON.stringify(payload)
  );
  
  console.log(`Response ${res.status}:`, res.body);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
