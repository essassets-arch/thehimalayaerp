const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
      }
    }
  });

  const user = await prisma.user.findFirst({
    where: { role: { name: 'Plant Head' } },
    include: { role: true }
  });

  const secret = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  const token = jwt.sign({
    sub: user.id,
    id: user.id,
    email: user.email,
    role: user.role.name,
    companyId: user.companyId
  }, secret, { expiresIn: '1h' });

  const res = await axios.get('http://localhost:4001/api/v1/products?scope=catalog&limit=5000', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
  const apiByName = new Map();
  const apiBySku = new Map();

  list.forEach(p => {
    if (p.name) apiByName.set(p.name.toUpperCase().trim(), p);
    if (p.sku) apiBySku.set(p.sku.toUpperCase().trim(), p);
  });

  const rawMatches = JSON.parse(fs.readFileSync('scratch/parsed_matches.json', 'utf8'));
  const uniqueRaw = Array.from(new Set(rawMatches.map(r => r.trim().replace(/\s+/g, ' '))));

  console.log(`Checking all ${uniqueRaw.length} unique items from user's request against API...`);

  let found = 0;
  let missing = [];

  uniqueRaw.forEach(name => {
    const norm = name.toUpperCase();
    const clean = norm.replace(/[^A-Z0-9]/g, '');

    const p = apiByName.get(norm) || apiBySku.get(clean);
    if (p && (p.productType === 'MANUFACTURING' || p.product_type === 'MANUFACTURING')) {
      found++;
    } else {
      missing.push({ name, norm, clean, foundProd: p });
    }
  });

  console.log(`\n======================================================`);
  console.log(`RESULT: ${found} / ${uniqueRaw.length} products verified in Manufacturing catalog.`);
  console.log(`======================================================`);

  if (missing.length > 0) {
    console.log(`Missing (${missing.length}):`, missing.slice(0, 10));
  } else {
    console.log('🎉 100% of products from user prompt are present in Manufacturing catalog!');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
