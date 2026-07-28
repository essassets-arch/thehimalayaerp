const fs = require('fs');
const path1 = 'd:/prototype-next/config/navigationConfig.js';
let content1 = fs.readFileSync(path1, 'utf8');

const target1 = "{ id: 'replacements', label: 'Replacement Requests', icon: RefreshCw, path: '/plant-head/replacements' },";
const replacement1 = `{ id: 'replacements', label: 'Replacement Requests', icon: RefreshCw, path: '/plant-head/replacements' },
      { id: 'returns', label: 'Return Requests', icon: RefreshCw, path: '/plant-head/returns' },`;
content1 = content1.replace(target1, replacement1);
fs.writeFileSync(path1, content1, 'utf8');

const path2 = 'd:/prototype-next/modules/plant-head/pages/PlantHeadPortal.jsx';
let content2 = fs.readFileSync(path2, 'utf8');

if (!content2.includes("import ReplacementsView from './ReplacementsView';")) {
  content2 = content2.replace("import O2PWorkflowBanner from '../../../shared/components/O2PWorkflowBanner';", "import O2PWorkflowBanner from '../../../shared/components/O2PWorkflowBanner';\nimport ReplacementsView from './ReplacementsView';\nimport ReturnsView from './ReturnsView';");
}

const target2 = "{currentView === 'replacements' && renderReplacementRequests()}";
const replacement2 = "{currentView === 'replacements' && <ReplacementsView />}\n      {currentView === 'returns' && <ReturnsView />}";
content2 = content2.replace(target2, replacement2);

fs.writeFileSync(path2, content2, 'utf8');

console.log('Patched PlantHeadPortal and navigationConfig successfully.');
