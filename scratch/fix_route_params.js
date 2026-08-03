const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('d:/prototype-next-main/frontend/app/api');
let count = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('{ params }:') && !content.includes('{ params }: { params: Promise<')) {
    // Replace { params }: { params: { ... } } or { params }: { params: any } with { params }: { params: Promise<any> }
    const updated = content.replace(/\{ params \}:\s*\{\s*params:\s*\{[^}]+\}\s*\}/g, '{ params }: { params: Promise<any> }')
                           .replace(/\{ params \}:\s*\{\s*params:\s*any\s*\}/g, '{ params }: { params: Promise<any> }');
    if (updated !== content) {
      fs.writeFileSync(filePath, updated, 'utf8');
      count++;
      console.log(`Updated ${filePath}`);
    }
  }
});

console.log(`Total route files updated: ${count}`);
