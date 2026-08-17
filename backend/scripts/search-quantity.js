const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'frontend', 'modules', 'plant-head', 'pages', 'PlantHeadPortal.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('quantity') || line.includes('Qty') || line.includes('qty')) {
    if (line.includes('row') || line.includes('order') || line.includes('render')) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  }
});
