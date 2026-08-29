const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');

// 1. Parse navigationConfig.js
function parseNavigationConfig() {
  const navFilePath = path.join(frontendRoot, 'config/navigationConfig.js');
  const content = fs.readFileSync(navFilePath, 'utf8');

  // Simple parser to extract navigation items per panel
  const panels = {};
  let currentPanel = null;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const panelMatch = line.match(/^\s*['"]([^'"]+)['"]\s*:\s*\[/);
    if (panelMatch) {
      currentPanel = panelMatch[1];
      panels[currentPanel] = [];
      continue;
    }

    if (currentPanel) {
      const pathMatch = line.match(/path:\s*['"]([^'"]+)['"]/);
      const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
      const labelMatch = line.match(/label:\s*['"]([^'"]+)['"]/);
      const groupMatch = line.match(/group:\s*['"]([^'"]+)['"]/);

      if (pathMatch) {
        panels[currentPanel].push({
          id: idMatch ? idMatch[1] : '',
          label: labelMatch ? labelMatch[1] : '',
          path: pathMatch[1].trim(),
          group: groupMatch ? groupMatch[1] : null
        });
      }

      if (line.match(/^\s*\]/)) {
        // check if closing panel
        if (lines[i-1] && !lines[i-1].includes('subItems')) {
          // might be end of panel
        }
      }
    }
  }

  return panels;
}

// 2. Discover all Next.js filesystem routes
function discoverFilesystemRoutes() {
  const appDir = path.join(frontendRoot, 'app');
  const routes = [];

  function walk(dir, currentRoute = '') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let pageFile = null;
    let layoutFile = null;

    for (const e of entries) {
      if (e.isFile()) {
        if (e.name.startsWith('page.')) pageFile = path.join(dir, e.name);
        if (e.name.startsWith('layout.')) layoutFile = path.join(dir, e.name);
      }
    }

    if (pageFile) {
      let cleanRoute = currentRoute === '' ? '/' : currentRoute;
      cleanRoute = cleanRoute.replace(/\/\([^)]+\)/g, '');
      if (cleanRoute === '') cleanRoute = '/';
      routes.push({
        route: cleanRoute,
        rawRoute: currentRoute || '/',
        pageFile: path.relative(frontendRoot, pageFile).replace(/\\/g, '/'),
        layoutFile: layoutFile ? path.relative(frontendRoot, layoutFile).replace(/\\/g, '/') : null,
        dir: path.relative(frontendRoot, dir).replace(/\\/g, '/')
      });
    }

    for (const e of entries) {
      if (e.isDirectory() && !e.name.startsWith('.')) {
        walk(path.join(dir, e.name), currentRoute + '/' + e.name);
      }
    }
  }

  walk(appDir);
  return routes;
}

// 3. Scan for high-risk CSS patterns in CSS and JSX files
function scanRiskPatterns() {
  const riskPatterns = [
    { name: 'fixed_large_width_px', regex: /width:\s*([4-9]\d\d|1\d\d\d+)px/g, desc: 'Fixed width >= 400px in CSS/inline styles' },
    { name: 'fixed_min_width_px', regex: /min-width:\s*([4-9]\d\d|1\d\d\d+)px/g, desc: 'Fixed min-width >= 400px' },
    { name: 'fixed_tailwind_w', regex: /\bw-\[(?:[4-9]\d\d|1\d\d\d+)px\]/g, desc: 'Tailwind arbitrary fixed width >= 400px' },
    { name: 'fixed_tailwind_min_w', regex: /\bmin-w-\[(?:[4-9]\d\d|1\d\d\d+)px\]/g, desc: 'Tailwind arbitrary min-width >= 400px' },
    { name: 'whitespace_nowrap', regex: /\bwhitespace-nowrap\b|white-space:\s*nowrap/g, desc: 'Whitespace nowrap preventing natural reflow' },
    { name: 'overflow_hidden_clipping', regex: /overflow:\s*hidden\b|overflow-x:\s*hidden\b|\boverflow-hidden\b/g, desc: 'Overflow hidden that may clip without horizontal scroll fallback' },
    { name: 'fixed_grid_columns', regex: /grid-template-columns:\s*(repeat\([4-9]|\d+\s*px)/g, desc: 'Fixed multi-column grid layout without responsive reflow' },
    { name: 'vw_units_inside_container', regex: /100vw/g, desc: '100vw causing scrollbar overflow on mobile' }
  ];

  const results = {};
  riskPatterns.forEach(p => results[p.name] = []);

  const searchDirs = ['app', 'components', 'modules', 'shared', 'layouts'];

  function scanDir(dir) {
    const full = path.join(frontendRoot, dir);
    if (!fs.existsSync(full)) return;
    const entries = fs.readdirSync(full, { withFileTypes: true });

    for (const e of entries) {
      const fullPath = path.join(full, e.name);
      if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
        scanDir(path.join(dir, e.name));
      } else if (e.isFile() && (e.name.endsWith('.jsx') || e.name.endsWith('.tsx') || e.name.endsWith('.js') || e.name.endsWith('.css'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const relPath = path.relative(frontendRoot, fullPath).replace(/\\/g, '/');

        riskPatterns.forEach(p => {
          const matches = content.match(p.regex);
          if (matches) {
            results[p.name].push({
              file: relPath,
              count: matches.length,
              sample: matches.slice(0, 3)
            });
          }
        });
      }
    }
  }

  searchDirs.forEach(scanDir);
  return results;
}

// 4. Discover all shared components and their usage
function scanSharedComponents() {
  const componentDirs = ['components', 'shared/components', 'components/ui'];
  const components = [];

  componentDirs.forEach(cDir => {
    const full = path.join(frontendRoot, cDir);
    if (!fs.existsSync(full)) return;
    const files = fs.readdirSync(full, { withFileTypes: true });

    for (const f of files) {
      if (f.isFile() && (f.name.endsWith('.jsx') || f.name.endsWith('.tsx'))) {
        const compName = f.name.replace(/\.(jsx|tsx)$/, '');
        const fullPath = path.join(full, f.name);
        const content = fs.readFileSync(fullPath, 'utf8');
        const relPath = path.relative(frontendRoot, fullPath).replace(/\\/g, '/');

        // Check features
        const hasTable = content.includes('<table') || content.includes('DataTable') || content.includes('Tabulator');
        const hasForm = content.includes('<form') || content.includes('<input') || content.includes('<select');
        const hasModal = content.includes('modal') || content.includes('Dialog') || content.includes('fixed inset-0') || content.includes('overlay');
        const hasChart = content.includes('ResponsiveContainer') || content.includes('BarChart') || content.includes('LineChart') || content.includes('PieChart');
        const hasMediaQueries = content.includes('@media') || content.includes('sm:') || content.includes('md:') || content.includes('lg:');

        components.push({
          name: compName,
          path: relPath,
          sizeBytes: fs.statSync(fullPath).size,
          hasTable,
          hasForm,
          hasModal,
          hasChart,
          hasMediaQueries
        });
      }
    }
  });

  return components;
}

const navPanels = parseNavigationConfig();
const fsRoutes = discoverFilesystemRoutes();
const riskReport = scanRiskPatterns();
const sharedComps = scanSharedComponents();

console.log('--- SUMMARY ---');
console.log('Panels configured:', Object.keys(navPanels).length);
console.log('Total nav routes:', Object.values(navPanels).reduce((acc, v) => acc + v.length, 0));
console.log('Total Next.js App routes:', fsRoutes.length);
console.log('Shared components identified:', sharedComps.length);

fs.writeFileSync(
  path.join(frontendRoot, 'responsive-route-inventory.json'),
  JSON.stringify({ navPanels, fsRoutes, sharedComps }, null, 2)
);

fs.writeFileSync(
  path.join(frontendRoot, 'responsive-risk-inventory.json'),
  JSON.stringify(riskReport, null, 2)
);

console.log('Wrote responsive-route-inventory.json and responsive-risk-inventory.json');
