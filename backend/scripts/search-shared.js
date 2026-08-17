const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', '..', 'frontend', 'shared', 'components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.toLowerCase().includes('tons')) {
    console.log(`Found in: ${file}`);
    content.split('\n').forEach((line, idx) => {
      if (line.toLowerCase().includes('tons')) {
        console.log(`  Line ${idx+1}: ${line.trim()}`);
      }
    });
  }
});
