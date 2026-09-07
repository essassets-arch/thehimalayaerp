const fs = require('fs');
const path = require('path');

const root = 'd:/prototype-next-main';
const files = {
  himalayaLogo: 'frontend/public/himalaya-logo-trimmed.png',
  himalayaLogoMark: 'frontend/public/himalaya-logo-mark.png',
  himalayaStamp: 'frontend/public/himalaya-stamp.png',
  himalayaSignature: 'frontend/public/himalaya-signature.png',
  relianceLogo: 'frontend/public/client-logos/reliance-logo.png',
  adaniLogo: 'frontend/public/client-logos/adani-logo.png',
  ltLogo: 'frontend/public/client-logos/lt-logo.png',
  ashridharLogo: 'frontend/public/client-logos/ashridhar-logo.png',
};

let output = '// Pre-inlined Base64 assets for 100% reliable quotation image generation without CORS or network dependencies\n';

for (const [key, relPath] of Object.entries(files)) {
  const fullPath = path.resolve(root, relPath);
  if (fs.existsSync(fullPath)) {
    const buf = fs.readFileSync(fullPath);
    const b64 = buf.toString('base64');
    output += `export const ${key}Base64 = "data:image/png;base64,${b64}";\n`;
    console.log('Processed', key, buf.length, 'bytes');
  } else {
    console.warn('Missing file:', fullPath);
  }
}

fs.writeFileSync(path.resolve(root, 'frontend/services/quotationAssetsBase64.js'), output);
console.log('Saved to frontend/services/quotationAssetsBase64.js');
