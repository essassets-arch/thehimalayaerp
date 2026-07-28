const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

// Helper to recursively read all files
function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

async function auditNavigation() {
  console.log('--- Starting Navigation Route Audit ---');
  
  // 1. Read navigation config
  // Note: we can't easily require the ES module from here in a simple way if it has JSX or non-standard syntax, 
  // so let's parse it with a quick regex or dynamically import if it's pure JS.
  const configPath = path.join(rootDir, 'config', 'navigationConfig.js');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Extract all paths using regex
  const pathRegex = /path:\s*['"`]([^'"`]+)['"`]/g;
  let match;
  const navPaths = new Set();
  const allRoutes = [];
  
  while ((match = pathRegex.exec(configContent)) !== null) {
    const route = match[1].split('?')[0]; // remove query params
    navPaths.add(route);
    allRoutes.push(route);
  }
  
  console.log(`Found ${navPaths.size} unique routes in navigationConfig.js`);
  
  // Find duplicates
  const counts = {};
  allRoutes.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
  const duplicates = Object.keys(counts).filter(x => counts[x] > 1);
  if (duplicates.length > 0) {
    console.warn(`\n[WARNING] Duplicate navigation paths found:`);
    duplicates.forEach(d => console.warn(`  - ${d} (${counts[d]} times)`));
  }
  
  // 2. Check Next.js app directory handlers
  const appDir = path.join(rootDir, 'app', '(dashboard)');
  const allAppFiles = getAllFiles(appDir);
  const pageFiles = allAppFiles.filter(f => f.endsWith('page.tsx') || f.endsWith('page.jsx'));
  
  console.log(`\nChecking against Next.js app directory...`);
  const missingPageFiles = [];
  const handledByCatchAll = [];
  
  for (const route of navPaths) {
    // Route like '/store/grn-inspection'
    // Look for app/(dashboard)/store/grn-inspection/page.tsx
    // Or app/(dashboard)/store/[[...slug]]/page.tsx
    const parts = route.split('/').filter(Boolean);
    if (parts.length === 0) continue;
    
    const exactPageTsx = path.join(appDir, ...parts, 'page.tsx');
    const exactPageJsx = path.join(appDir, ...parts, 'page.jsx');
    
    if (fs.existsSync(exactPageTsx) || fs.existsSync(exactPageJsx)) {
      // Exists exactly
      continue;
    }
    
    // Check for catch-all in the module base
    const moduleBase = parts[0];
    const catchAllTsx = path.join(appDir, moduleBase, '[[...slug]]', 'page.tsx');
    const catchAllJsx = path.join(appDir, moduleBase, '[[...slug]]', 'page.jsx');
    
    if (fs.existsSync(catchAllTsx) || fs.existsSync(catchAllJsx)) {
      handledByCatchAll.push(route);
    } else {
      missingPageFiles.push(route);
    }
  }
  
  if (missingPageFiles.length > 0) {
    console.error(`\n[ERROR] Routes with NO page handler (not even catch-all):`);
    missingPageFiles.forEach(r => console.error(`  - ${r}`));
  }
  
  console.log(`\n[INFO] Routes handled by catch-all (needs portal verification):`);
  handledByCatchAll.forEach(r => console.log(`  - ${r}`));
  
  console.log('\n--- Audit Complete ---');
}

auditNavigation().catch(console.error);
