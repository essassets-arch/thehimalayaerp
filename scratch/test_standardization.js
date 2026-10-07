const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function standardizeSize(raw) {
  if (!raw || raw === 'Not recorded') return 'Standard Opening';
  let s = String(raw).trim().toUpperCase();
  s = s.replace(/\s*[xX*×]\s*/g, ' × ');
  if (s.includes('900') && s.includes('MM')) return '900 MM';
  if (s.includes('600') && s.includes('600')) return '600 × 600';
  if (s.includes('1200') && s.includes('1200')) return '1200 × 1200';
  if (s.includes('1200') && s.includes('900')) return '1200 × 900';
  if (s.includes('450') && s.includes('600')) return '450 × 600';
  if (s.includes('600') && s.includes('450')) return '450 × 600';
  if (s.includes('900') && s.includes('900')) return '900 × 900';
  if (s.includes('750') && s.includes('750')) return '750 × 750';
  if (s.includes('450') && s.includes('450')) return '450 × 450';
  if (s.includes('300') && s.includes('300')) return '300 × 300';
  return s;
}

function standardizeColour(raw) {
  if (!raw || raw === 'Not recorded') return 'Grey';
  let c = String(raw).trim().toLowerCase();
  if (c.includes('grey') || c.includes('gray')) return 'Grey';
  if (c.includes('black')) return 'Black';
  if (c.includes('green')) return 'P.Green';
  if (c.includes('red')) return 'Red';
  if (c.includes('white')) return 'White';
  if (c.includes('ivory')) return 'Ivory';
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function standardizeCapacity(raw) {
  if (!raw || raw === 'Not recorded') return 'LD';
  let c = String(raw).trim().toUpperCase();
  if (c.includes('C250') || c.includes('C-250') || c.includes('25T')) return 'C250';
  if (c.includes('B125') || c.includes('B-125') || c.includes('12.5T')) return 'B125';
  if (c.includes('D400') || c.includes('D-400') || c.includes('40T')) return 'D400';
  if (c.includes('E600') || c.includes('E-600') || c.includes('60T')) return 'E600';
  if (c.includes('F900') || c.includes('F-900') || c.includes('90T')) return 'F900';
  if (c.includes('ELD') || c.includes('EXTRA LIGHT')) return 'ELD';
  if (c.includes('3T') || c.includes('3 TON')) return '3T';
  if (c.includes('LD') || c.includes('LIGHT DUTY')) return 'LD';
  return c;
}

function standardizeProduct(raw, name) {
  const pStr = `${raw || ''} ${name || ''}`.toUpperCase();
  if (pStr.includes('DMHC') || pStr.includes('D MHC') || pStr.includes('DOUBLE')) return 'D MHC';
  if (pStr.includes('RCS') || pStr.includes('RECESSED')) return 'RCS';
  if (pStr.includes('ONGC')) return 'ONGC';
  if (pStr.includes('WGC') || pStr.includes('GULLY')) return 'WGC';
  if (pStr.includes('MHC') || pStr.includes('MANHOLE')) return 'MHC';
  return raw || 'MHC';
}

async function testStandardization() {
  const aug1_start = new Date('2026-07-31T18:30:00.000Z');
  const aug29_end = new Date('2026-08-29T18:30:00.000Z');

  const dispatches = await prisma.dispatch.findMany({
    where: {
      dispatchedAt: {
        gte: aug1_start,
        lt: aug29_end,
      }
    },
    include: {
      salesOrder: {
        include: {
          customer: true,
          salesExecutive: true,
          items: { include: { product: true } }
        }
      },
      items: {
        include: {
          salesOrderItem: { include: { product: true } }
        }
      }
    }
  });

  const prodMap = {};
  const capMap = {};
  const sizeMap = {};
  const colMap = {};
  let totalWeight = 0;
  let totalQty = 0;

  for (const d of dispatches) {
    const dWeight = Number(d.totalWeight) || 0;
    const items = d.items || [];
    const dPcs = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    totalWeight += dWeight;
    totalQty += dPcs;

    for (const it of items) {
      const q = Number(it.quantity) || 0;
      const weightShare = dPcs > 0 ? (dWeight * (q / dPcs)) : 0;
      const spec = it.salesOrderItem?.specifications || {};
      const pName = it.salesOrderItem?.product?.name || '';

      const prod = standardizeProduct(spec.product, pName);
      const cap = standardizeCapacity(spec.capacity || pName);
      const sz = standardizeSize(spec.size || pName);
      const col = standardizeColour(spec.colour || spec.color);

      if (!prodMap[prod]) prodMap[prod] = { qty: 0, weight: 0 };
      prodMap[prod].qty += q;
      prodMap[prod].weight += weightShare;

      capMap[cap] = (capMap[cap] || 0) + weightShare;
      sizeMap[sz] = (sizeMap[sz] || 0) + weightShare;
      colMap[col] = (colMap[col] || 0) + weightShare;
    }
  }

  console.log('=== STANDARDIZED AGGREGATION ===');
  console.log(`Total Weight: ${totalWeight.toFixed(2)} KG | Total Qty: ${totalQty} PCS`);

  console.log('\nStandardized Products:');
  Object.keys(prodMap).sort((a,b) => prodMap[b].weight - prodMap[a].weight).forEach(p => {
    console.log(`  ${p}: ${prodMap[p].qty} pcs, ${prodMap[p].weight.toFixed(2)} kg (${((prodMap[p].weight/totalWeight)*100).toFixed(1)}%)`);
  });

  console.log('\nStandardized Capacities:');
  Object.keys(capMap).sort((a,b) => capMap[b] - capMap[a]).forEach(c => {
    console.log(`  ${c}: ${capMap[c].toFixed(2)} kg (${((capMap[c]/totalWeight)*100).toFixed(1)}%)`);
  });

  console.log('\nStandardized Sizes:');
  Object.keys(sizeMap).sort((a,b) => sizeMap[b] - sizeMap[a]).slice(0, 10).forEach(s => {
    console.log(`  ${s}: ${sizeMap[s].toFixed(2)} kg (${((sizeMap[s]/totalWeight)*100).toFixed(1)}%)`);
  });

  console.log('\nStandardized Colours:');
  Object.keys(colMap).sort((a,b) => colMap[b] - colMap[a]).forEach(c => {
    console.log(`  ${c}: ${colMap[c].toFixed(2)} kg (${((colMap[c]/totalWeight)*100).toFixed(1)}%)`);
  });

  await prisma.$disconnect();
}

testStandardization().catch(console.error);
