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
        if (/accessorKey:\s*["'][^"']+\.[^"']+\.[^"']+["']/.test(line) || /accessorKey:\s*["'][^"']+\.customer["']/.test(line)) {
          console.log(`${fullPath}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

console.log('--- FINDING NESTED ACCESSOR KEYS THAT CAUSE TANSTACK TABLE CRASHES ---');
searchDir('d:/prototype-next-main/frontend');
