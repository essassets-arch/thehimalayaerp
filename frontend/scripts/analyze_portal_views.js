const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

const plantHeadPortalPath = path.join(frontendRoot, 'modules/plant-head/pages/PlantHeadPortal.jsx');
const productionPortalPath = path.join(frontendRoot, 'modules/production/pages/ProductionPortal.jsx');

function analyzePortal(filePath, name) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`\n=================== ${name} ANALYSIS ===================`);
  console.log(`Total lines: ${lines.length}`);
  
  // Find route/tab matches like activeTab === '...' or pathname.includes(...) or activeView === '...'
  const tabMatches = new Set();
  const viewMatches = new Set();
  const routeMatches = new Set();
  
  const tabRegex = /(?:activeTab|tab|activeView|currentView|view)\s*===?\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = tabRegex.exec(content)) !== null) {
    tabMatches.add(match[1]);
  }
  
  const subviewRegex = /(?:currentTab|subView|subTab|activeSection)\s*===?\s*['"`]([^'"`]+)['"`]/g;
  while ((match = subviewRegex.exec(content)) !== null) {
    viewMatches.add(match[1]);
  }

  const routerRegex = /case\s+['"`]([^'"`]+)['"`]:/g;
  while ((match = routerRegex.exec(content)) !== null) {
    routeMatches.add(match[1]);
  }

  console.log('Discovered Tabs / Views:', Array.from(tabMatches));
  console.log('Discovered Sub-views:', Array.from(viewMatches));
  console.log('Discovered Switch Cases / Routes:', Array.from(routeMatches));
}

analyzePortal(plantHeadPortalPath, 'PLANT HEAD');
analyzePortal(productionPortalPath, 'PRODUCTION');
