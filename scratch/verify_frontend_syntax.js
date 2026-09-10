const fs = require('fs');
const babel = require('@babel/parser');

const files = [
  'frontend/modules/finance/pages/FinancePortal.jsx',
  'frontend/modules/procurement/components/DeliveryDocumentUploader.jsx',
  'frontend/modules/procurement/store/VerifyPODelivery.jsx',
  'frontend/modules/store/pages/StorePortal.jsx'
];

let allOk = true;
for (const f of files) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    babel.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log('✓ Syntax OK:', f);
  } catch (err) {
    console.error('✗ Syntax Error in', f, ':', err.message);
    allOk = false;
  }
}

if (!allOk) process.exit(1);
console.log('\nAll frontend files passed syntax checks!');
