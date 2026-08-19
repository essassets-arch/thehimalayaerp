const fs = require('fs');

const content = fs.readFileSync('d:/prototype-next-main/frontend/modules/super-admin/pages/SuperAdminPortal.jsx', 'utf8');

// Look for rendering lines or sidebar references
const lines = content.split('\n');
console.log('Total lines:', lines.length);

console.log('--- SCANNING FOR MENU OR SIDEBAR RENDERING ---');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('sidebar') || line.includes('nav') || line.includes('Cpu') || line.includes('navigation') || line.includes('navigationConfig')) {
    if (line.includes('render') || line.includes('return') || line.includes('import') || line.includes('const') || line.includes('let')) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
    }
  }
}
