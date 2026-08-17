const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
const content = fs.readFileSync(seedPath, 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('plant.head') || lines[i].includes('plantHead')) {
    console.log(`${i+1}: ${lines[i].trim()}`);
  }
}
