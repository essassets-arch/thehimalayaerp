const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mhcCount = await prisma.product.count({ where: { name: { contains: 'MHC' } } });
  const wgcCount = await prisma.product.count({ where: { name: { contains: 'WGC' } } });
  const rcsCount = await prisma.product.count({ where: { name: { contains: 'RCS' } } });
  const ongcCount = await prisma.product.count({ where: { name: { contains: 'ONGC' } } });
  const totalFRP = await prisma.product.count({ where: { category: { in: ['FRP COVER', 'FRP COVERS'] } } });

  console.log('=== PRODUCT CATALOG COUNTS ===');
  console.log('MHC Products:', mhcCount);
  console.log('WGC Products:', wgcCount);
  console.log('RCS Products:', rcsCount);
  console.log('ONGC Products:', ongcCount);
  console.log('Total FRP Cover Products in DB:', totalFRP);

  const spotChecks = [
    'HIMALAYA FRP MHC 1200X1200 E600',
    'HIMALAYA FRP MHC 1500X1500 F900',
    'HIMALAYA FRP MHC 1800X1800 D400',
    'HIMALAYA FRP WGC 1200X1200 F900',
    'HIMALAYA FRP WGC 900X1200 D400',
    'HIMALAYA FRP RCS 1800X1800 E600',
    'HIMALAYA FRP RCS 750X450 C250',
    'HIMALAYA FRP ONGC 600X1000 F900 SINGLE',
  ];

  console.log('\n=== SPOT CHECKS ===');
  for (const name of spotChecks) {
    const p = await prisma.product.findFirst({ where: { name: { contains: name } } });
    if (p) {
      console.log(`✅ ${p.name} | Size: ${p.size} | Class: ${p.capacity} | Type: ${p.type} | Covers: ${p.coversPerSet}`);
    } else {
      console.log(`❌ NOT FOUND: ${name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
