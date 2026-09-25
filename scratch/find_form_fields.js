const fs = require('fs');
const content = fs.readFileSync('frontend/shared/components/ProductMasterUI.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('formData.product_type') || line.includes('formData.dispatch_category') || line.includes('dispatch_category:')) {
    console.log((idx + 1) + ': ' + line.trim().slice(0, 100));
  }
});
