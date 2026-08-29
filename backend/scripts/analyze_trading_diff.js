const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawUserList = `
FRP MOULDED GRATING 25MM

FRP MOULDED GRATING 30MM

FRP MOULDED GRATING 38MM

FRP MOULDED FRATINGS 50MM



RCC HUME PIPE NP2 CLASS

RCC HUME PIPE NP3 CLASS

RCC HUME PIPE NP4 CLASS



FRCSQRC24x24 LD3

FRCSQRC24x24 LD5

FRCSQRC24x24 MD10

FRCSQRC30x30 LD5

FRCSQRC30x30 MD10

FRCSQRC30x30 HD20

FRCSQRC33x33 HD20

FRCSQRC34x34 LD5

FRCSQRC34x34 HD20

FRCSQRC34x34 EHD35

FRCSQRC36x36 LD5

FRCSQRC36x36 MD10

FRCSQRC36x36 HD20

FRCSQRC36x36 EHD35

FRCSQRC42x42 LD5

FRCSQRC42x42 HD20

FRCSQRC42x42 EHD35

FRCSQRC48x48 LD5

FRCSQRC48x48 HD20

FRCSQRC48x48 EHD35

FRCRFRC24x18 LD1

FRCRFRC28x22 LD2

FRCRFRC28x22 LD5

FRCRFRC28x22 MD10

FRCRFRC30x24 LD3

FRCRFRC32x26 LD5

FRCRFRC32x26 MD10

FRCRFRC32x26 HD20

FRCRFRC36x24 MD10

FRCRFRC38x26 LD5

FRCRFRC44x26 LD5

FRCRFRC38x32 MD10

FRCRFRC38x32 HD20

FRCRFRC41x35.5 EHD35

FRCRFRC44x26 MD10

FRCRFRC44x26 HD20

FRCRFRC44x34 MD10

FRCRFRC44x34 HD20

FRCRFRC42x48 HD20

FRCRFRC48x44 HD20

FRCRFRC52x42 EHD35

FRCRFRC60x48 LD5

FRCRFRC60x48 HD20

FRCRFRC60x48 EHD35

FRCSFSC12x12

FRCSFSC15x15

FRCSFSC18x18 LD1

FRCSFSC18x18 MD10

FRCSFSC18x18 HD20

FRCSFSC24x24 LD2

FRCSFSC24x24 LD5

FRCSFSC24x24 HD20

FRCSFSC27x27 LD3

FRCSFSC30x30 LD5

FRCSFSC30x30 MD10

FRCSFSC30x30 HD20

FRCSFSC30x30 EHD35

FRCSFSC32.5x32.5 LD5

FRCSFSC32.5x32.5 MD10

FRCSFSC36x36 HD20

FRCSFSC36x36 EHD35

FRCSFSC38x38 LD5

FRCSFSC42x42 MD10

FRCSFSC42x42 HD20

FRCSFSC42x42 EHD35

FRCSFSC48x48 HD20

FRCSFSC48x48 EHD35

FRCSFSC55x55 HD20

FRCSFSC55x55 EHD35

FRCSFSC63x63 HD20

FRCSFSC63x63 EHD35

FRCSFSC67x67 HD20

FRCSFSC67x67 EHD35

FRCROFROC30 dia MD10

FRCROFROC30 dia HD20

FRCROFROC31.5 dia HD20

FRCROFROC31.5 dia EHD35

FRCROFROC33 dia HD20

FRCROFROC34 dia HD20

FRCROFROC34 dia EHD35

FRCROFROC34 dia HD20

FRCROFROC34 dia EHD35

FRCCP24x24 LD5

FRCCP24x24 HD20

FRCCP28x22 MD10

FRCCP30x30 LD5

FRCCP30x30 MD10

FRCCP30x30 HD20

FRCCP32x26 LD5

FRCCP32x26 MD10

FRCCP32x26 HD20

FRCCP32.5x32.5 LD5

FRCCP32.5x32.5 MD10

FRCCP36x36 HD20

FRCCP36x36 EHD35

FRCCP42x42 MD10

FRCCP42x42 HD20

FRCCP42x42 EHD35

FRCCP44x34 MD10

FRCCP44x34 HD20

FRCCP48x48 HD20

FRCCP48x48 EHD35

FRCCP60x48 HD20

FRCCP60x48 EHD35

FRCGT ONLY CO12x12

FRCGT FC 12x12

FRCTSOC 24 x 12x2

FRCTSOC 28 x 12x2

FRCTSOC 24 x 18x2

FRCTSOC 24 x 24x2R

FRCTSOC 36 x 18x2

FRCTSOC 36 x 24x2R

FRCTSOC 36 x 24x4R

FRCTPEC 24 x 12x2

FRCTPEC 24 x 16x2

FRCTPEC 24 x 18x2

FRCTPEC 30 x 24x2
`;

async function main() {
  const lines = rawUserList.split('\n').map(s => s.trim()).filter(Boolean);
  const uniqueItems = Array.from(new Set(lines));
  console.log(`Total input lines: ${lines.length}, Unique products: ${uniqueItems.length}`);

  const allProducts = await prisma.product.findMany({});
  console.log(`Total products in DB: ${allProducts.length}`);

  // Check what products currently have productType = 'TRADING'
  const currentTrading = allProducts.filter(p => (p.productType || '').toUpperCase() === 'TRADING');
  console.log(`Current TRADING products count in DB: ${currentTrading.length}`);

  const currentTradingNames = Array.from(new Set(currentTrading.map(p => p.name)));
  console.log(`Unique names of current TRADING products: ${currentTradingNames.length}`);

  const toBeRemovedTrading = currentTradingNames.filter(name => !uniqueItems.includes(name));
  console.log(`Current TRADING products NOT in requested list (${toBeRemovedTrading.length}):`, toBeRemovedTrading);

  const toBeAddedTrading = uniqueItems.filter(name => !currentTradingNames.includes(name));
  console.log(`Requested products NOT currently TRADING (${toBeAddedTrading.length}):`, toBeAddedTrading);

  // Check if toBeAddedTrading exist as MANUFACTURING or other type
  const existingOtherType = allProducts.filter(p => toBeAddedTrading.includes(p.name));
  console.log(`Of the toBeAdded, how many exist in DB under another type: ${existingOtherType.length}`);
  existingOtherType.forEach(p => console.log(` - ${p.name} (type: ${p.productType}, cat: ${p.category})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
