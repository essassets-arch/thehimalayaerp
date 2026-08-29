const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

function findFiles(dir, matchExt = /\.(jsx?|tsx?)$/) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(fullPath, matchExt));
    } else if (matchExt.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

const plantHeadAppDir = path.join(frontendRoot, 'app/(dashboard)/plant-head');
const productionAppDir = path.join(frontendRoot, 'app/(dashboard)/production');
const plantHeadModuleDir = path.join(frontendRoot, 'modules/plant-head');
const productionModuleDir = path.join(frontendRoot, 'modules/production');

const plantHeadPages = findFiles(plantHeadAppDir);
const productionPages = findFiles(productionAppDir);
const plantHeadModules = findFiles(plantHeadModuleDir);
const productionModules = findFiles(productionModuleDir);

console.log('=== PLANT HEAD APP PAGES ===');
plantHeadPages.forEach(p => console.log(path.relative(frontendRoot, p)));

console.log('\n=== PRODUCTION APP PAGES ===');
productionPages.forEach(p => console.log(path.relative(frontendRoot, p)));

console.log('\n=== PLANT HEAD MODULES ===');
plantHeadModules.forEach(p => console.log(path.relative(frontendRoot, p)));

console.log('\n=== PRODUCTION MODULES ===');
productionModules.forEach(p => console.log(path.relative(frontendRoot, p)));

// Check navigationConfig.js for Plant Head and Production items
const navConfigPath = path.join(frontendRoot, 'config/navigationConfig.js');
let navConfigContent = '';
if (fs.existsSync(navConfigPath)) {
  navConfigContent = fs.readFileSync(navConfigPath, 'utf8');
}

fs.writeFileSync(
  path.join(frontendRoot, 'plant-head-production-discovery.json'),
  JSON.stringify({
    plantHeadPages: plantHeadPages.map(p => path.relative(frontendRoot, p)),
    productionPages: productionPages.map(p => path.relative(frontendRoot, p)),
    plantHeadModules: plantHeadModules.map(p => path.relative(frontendRoot, p)),
    productionModules: productionModules.map(p => path.relative(frontendRoot, p)),
  }, null, 2)
);
