const fs = require('fs');
const content = fs.readFileSync('backend/src/modules/plant-head/plant-head.service.ts', 'utf8');
const lines = content.split('\n');
console.log('Searching plant-head.service.ts...');
lines.forEach((line, idx) => {
  if (line.includes('2975') || line.includes('2876') || line.includes('buildCertifiedOctober') || line.includes('buildCertifiedAllTime')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
