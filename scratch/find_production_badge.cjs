const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    if (f.name === 'node_modules' || f.name === '.next' || f.name === '.git') continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      walk(p);
    } else if (p.endsWith('.jsx') || p.endsWith('.tsx') || p.endsWith('.css')) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes('Production')) {
        // Look for cards where a number and 'Production' are displayed
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i];
          if (/<div>\s*Production\s*<\/div>/i.test(l) ||
              /<span>\s*Production\s*<\/span>/i.test(l) ||
              /<p>\s*Production\s*<\/p>/i.test(l) ||
              /label:\s*['"]Production['"]/i.test(l) ||
              /name:\s*['"]Production['"]/i.test(l) ||
              /title:\s*['"]Production['"]/i.test(l)) {
            console.log(`${p}:${i+1}: ${l.trim()}`);
          }
        }
      }
    }
  }
}

walk('frontend');
