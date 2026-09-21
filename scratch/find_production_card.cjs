const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') searchDir(full);
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('Production')) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i];
          if (l.includes('>Production<') || l.includes(">'Production'<") || l.includes('title: "Production"') || l.includes("label: 'Production'") || l.includes("label: \"Production\"") || l.includes("name: 'Production'")) {
            console.log(`${full}:${i + 1}: ${l.trim()}`);
          }
        }
      }
    }
  }
}

searchDir('frontend');
