const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const frontendRoot = path.join(root, 'frontend');
const backendRoot = path.join(root, 'backend');

console.log('=== PHASE 9 MASTER DISCOVERY: PRODUCTION READINESS AUDIT ===');

// 1. Discover all App Router routes
function getAppRoutes(dir, baseRoute = '') {
  let routes = [];
  if (!fs.existsSync(dir)) return routes;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
        routes.push(...getAppRoutes(full, baseRoute));
      } else {
        routes.push(...getAppRoutes(full, `${baseRoute}/${entry.name}`));
      }
    } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx' || entry.name === 'page.js') {
      routes.push(baseRoute === '' ? '/' : baseRoute);
    }
  }
  return routes;
}

const appRoutes = getAppRoutes(path.join(frontendRoot, 'app'));
console.log(`Discovered ${appRoutes.length} active Next.js App Router route entrypoints.`);

// 2. Discover all Prisma Schema Models
const prismaSchema = fs.readFileSync(path.join(backendRoot, 'prisma/schema.prisma'), 'utf8');
const models = (prismaSchema.match(/model\s+(\w+)\s+\{/g) || []).map(m => m.replace(/model\s+/, '').replace(/\s+\{/, ''));
console.log(`Discovered ${models.length} Prisma Schema Models.`);

// 3. Discover all Test Suites in frontend/tests/
function getTestFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getTestFiles(full));
    } else if (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.spec.js')) {
      files.push(path.relative(frontendRoot, full));
    }
  }
  return files;
}

const testSuites = getTestFiles(path.join(frontendRoot, 'tests'));
console.log(`Discovered ${testSuites.length} Playwright test suite files across all categories.`);

const summary = {
  routeCount: appRoutes.length,
  routes: appRoutes,
  prismaModelsCount: models.length,
  testSuitesCount: testSuites.length,
  testSuites
};

fs.writeFileSync(
  path.join(frontendRoot, 'phase9-discovery-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log('✅ Phase 9 discovery summary generated.');
