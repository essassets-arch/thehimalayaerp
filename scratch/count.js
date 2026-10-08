const fs = require('fs');
const content = fs.readFileSync('frontend/shared/initialMaterials.js', 'utf8');
const count = content.split('"id": "RM-').length - 1;
console.log('Count:', count);
