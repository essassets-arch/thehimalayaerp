const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      coversPerSet: true,
      framesPerSet: true,
      weight: true
    }
  });

  console.log('Total products:', products.length);
  const byComp = {};
  for (const p of products) {
    const key = (p.coversPerSet ?? 'null') + 'C + ' + (p.framesPerSet ?? 'null') + 'F';
    byComp[key] = (byComp[key] || 0) + 1;
  }
  console.log('Composition counts:', byComp);

  const dhmcOrDouble = products.filter(p => 
    /dhmc|double|triple|single|cover|frame/i.test(p.name) || 
    /dhmc|double|triple|single/i.test(p.sku || '')
  );
  console.log('Total products with keyword matches:', dhmcOrDouble.length);
  console.log('Sample matched products:');
  console.log(JSON.stringify(dhmcOrDouble.slice(0, 30).map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    coversPerSet: p.coversPerSet,
    framesPerSet: p.framesPerSet
  })), null, 2));

  const non1C = products.filter(p => p.coversPerSet !== 1 || p.framesPerSet !== 1);
  console.log('\nAll products not 1C+1F (' + non1C.length + '):');
  console.log(JSON.stringify(non1C, null, 2));

  const potentialMultiCover = allProductsFull.filter(p => {
    const text = `${p.name} ${p.sku} ${p.type || ''} ${p.size || ''} ${p.description || ''}`.toLowerCase();
    return text.includes('dhmc') ||
           text.includes('double') ||
           text.includes('triple') ||
           text.includes('multi') ||
           text.includes('2 cover') ||
           text.includes('2c') ||
           text.includes('3 cover') ||
           text.includes('pair');
  });

  console.log('\nPotential multi-cover products found:', potentialMultiCover.length);
  console.log(JSON.stringify(potentialMultiCover.map(p => ({
    name: p.name,
    sku: p.sku,
    type: p.type,
    size: p.size,
    category: p.category,
    coversPerSet: p.coversPerSet,
    framesPerSet: p.framesPerSet,
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
