const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

function analyzeFile(filePath, label) {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n================== ${label} ==================`);
  
  // Find all tab switch branches
  const tabRegex = /activeTab\s*===\s*['"`]([^'"`]+)['"`]/g;
  const tabs = new Set();
  let m;
  while ((m = tabRegex.exec(content)) !== null) {
    tabs.add(m[1]);
  }
  console.log('Active Tabs checked:', Array.from(tabs));

  // Find all modals
  const modalMatches = content.match(/<div[^>]*position:\s*['"]fixed['"][^>]*>/g) || [];
  console.log(`Modals / Fixed overlays found: ${modalMatches.length}`);

  // Find all tables
  const tableMatches = content.match(/<table/g) || [];
  console.log(`<table> tags found: ${tableMatches.length}`);

  // Find all grid styles
  const gridMatches = content.match(/gridTemplateColumns\s*:\s*['"`][^'"`]+['"`]/g) || [];
  console.log(`gridTemplateColumns styles found: ${gridMatches.length}`);
  console.log('Sample grids:', Array.from(new Set(gridMatches)).slice(0, 10));
}

analyzeFile(path.join(frontendRoot, 'modules/plant-head/pages/PlantHeadPortal.jsx'), 'PlantHeadPortal.jsx');
analyzeFile(path.join(frontendRoot, 'modules/production/pages/ProductionPortal.jsx'), 'ProductionPortal.jsx');
