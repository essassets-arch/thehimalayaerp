const babel = require('@babel/parser');
const fs = require('fs');

console.log('Testing JSX syntax of all modified files...');

const files = [
  'frontend/modules/plant-head/pages/PlantHeadProductionAnalytics.jsx',
  'frontend/app/(dashboard)/plant-head/production-analytics/page.tsx',
];

for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  try {
    babel.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log(`- ${f}: PASSED ✅`);
  } catch (e) {
    console.error(`- ${f}: FAILED ❌ ->`, e.message);
  }
}
