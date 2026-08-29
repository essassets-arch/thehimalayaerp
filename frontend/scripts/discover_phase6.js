const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

function getFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFiles(full));
    } else if (/\.(jsx?|tsx?|css)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const allAppFiles = getFiles(path.join(frontendRoot, 'app'));
const allModuleFiles = getFiles(path.join(frontendRoot, 'modules'));
const allComponentFiles = getFiles(path.join(frontendRoot, 'components'));
const allSharedFiles = getFiles(path.join(frontendRoot, 'shared'));

console.log('Total App Files:', allAppFiles.length);
console.log('Total Module Files:', allModuleFiles.length);
console.log('Total Component Files:', allComponentFiles.length);
console.log('Total Shared Files:', allSharedFiles.length);
console.log('Total Frontend Source Files:', allAppFiles.length + allModuleFiles.length + allComponentFiles.length + allSharedFiles.length);

const summary = {
  appFiles: allAppFiles.map(f => path.relative(frontendRoot, f)),
  moduleFiles: allModuleFiles.map(f => path.relative(frontendRoot, f)),
  componentFiles: allComponentFiles.map(f => path.relative(frontendRoot, f)),
  sharedFiles: allSharedFiles.map(f => path.relative(frontendRoot, f))
};

fs.writeFileSync(
  path.join(frontendRoot, 'phase6-discovery-raw.json'),
  JSON.stringify(summary, null, 2)
);
