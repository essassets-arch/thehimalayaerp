const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', '.git', 'dist'].includes(file)) {
        searchDir(fullPath);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // match any .customer where preceding is not ? or after is not ?
        if (/\.\s*customer\s*\./.test(line) && !/\?\.\s*customer\s*\?\./.test(line)) {
          console.log(`${fullPath}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

searchDir('d:/prototype-next-main/frontend/app');
searchDir('d:/prototype-next-main/frontend/modules');
searchDir('d:/prototype-next-main/frontend/shared');
