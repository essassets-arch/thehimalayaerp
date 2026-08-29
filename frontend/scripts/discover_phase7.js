const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

// 1. Inspect navigationConfig.js to discover all configured roles and routes
const navPath = path.join(frontendRoot, 'config/navigationConfig.js');
let roles = [];
if (fs.existsSync(navPath)) {
  const content = fs.readFileSync(navPath, 'utf8');
  const roleMatches = content.match(/export const \w+Navigation/g) || [];
  roles = roleMatches.map(r => r.replace('export const ', '').replace('Navigation', ''));
}

console.log('Roles discovered in navigationConfig.js:', roles);

// 2. Discover all routes in app directory
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

const discoveredRoutes = getAppRoutes(path.join(frontendRoot, 'app'));
console.log('Total App Router endpoints discovered:', discoveredRoutes.length);

const summary = {
  roles,
  routeCount: discoveredRoutes.length,
  routes: discoveredRoutes
};

fs.writeFileSync(
  path.join(frontendRoot, 'phase7-discovery-raw.json'),
  JSON.stringify(summary, null, 2)
);
