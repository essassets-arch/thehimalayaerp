const fs = require('fs');
const content = fs.readFileSync('frontend/modules/plant-head/pages/PlantHeadPortal.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('ProductMasterUI') || line.includes("activeTab === 'products'")) {
    console.log((idx + 1) + ': ' + line.trim());
  }
});
