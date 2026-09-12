const fs = require('fs');

function checkFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8').replace(/\r/g, '');
  const lines = code.split('\n');
  const decls = [];
  lines.forEach((l, idx) => {
    const m = l.match(/^\s*const\s+([a-zA-Z0-9_]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/);
    if (m) decls.push({ name: m[1], line: idx + 1 });
  });

  decls.forEach(d => {
    for (let i = 0; i < d.line - 1; i++) {
      const line = lines[i];
      // skip imports or comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      const re = new RegExp('\\b' + d.name + '\\b');
      if (re.test(line)) {
        console.log(`${filePath}: ${d.name} declared on line ${d.line} but referenced on line ${i + 1}: "${line.trim()}"`);
      }
    }
  });
}

checkFile('frontend/modules/procurement/finance/DeliveryAudit.jsx');
checkFile('frontend/modules/procurement/finance/PartialDelivery.jsx');
checkFile('frontend/modules/procurement/store/VerifyPODelivery.jsx');
checkFile('frontend/modules/finance/pages/FinancePortal.jsx');
