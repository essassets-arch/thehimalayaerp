const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.join(rootDir, 'frontend');
const docsDir = path.join(rootDir, 'docs/phase-f');

if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFrontendFiles = getFiles(frontendDir);
const pageFiles = allFrontendFiles.filter((f) => f.includes('/app/') && (f.endsWith('page.tsx') || f.endsWith('page.ts') || f.endsWith('page.jsx') || f.endsWith('page.js')));
const apiBridgeFiles = allFrontendFiles.filter((f) => f.includes('/app/api/'));
const componentFiles = allFrontendFiles.filter((f) => f.includes('/components/'));
const serviceFiles = allFrontendFiles.filter((f) => f.includes('/services/') || f.includes('/lib/'));
const storeFiles = allFrontendFiles.filter((f) => f.includes('/store/'));

let branch = '';
let commitSha = '';
let gitStatus = '';
let nodeVersion = process.version;
let npmVersion = '';

try { branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(); } catch {}
try { commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(); } catch {}
try { gitStatus = execSync('git status --short', { encoding: 'utf8' }).trim(); } catch {}
try { npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim(); } catch {}

const pkg = JSON.parse(fs.readFileSync(path.join(frontendDir, 'package.json'), 'utf8'));

const report = `# 00 — Frontend Baseline Snapshot Report

## 1. Environment & Version Control Snapshot

- **Current Branch**: \`${branch}\`
- **Commit SHA**: \`${commitSha}\`
- **Node.js Version**: \`${nodeVersion}\`
- **npm Version**: \`${npmVersion}\`
- **Next.js Version**: \`${pkg.dependencies?.next || '15.5.20'}\`
- **React Version**: \`${pkg.dependencies?.react || '19.1.0'}\`
- **Workspace Target Directory**: [\`frontend/\`](file:///d:/prototype-next-main/frontend)

---

## 2. Codebase Inventory Metrics

- **Total Frontend Files**: \`${allFrontendFiles.length}\` files
- **App Router Pages**: \`${pageFiles.length}\` page components
- **Next.js API Bridge Routes**: \`${apiBridgeFiles.length}\` API routes
- **UI Components**: \`${componentFiles.length}\` components
- **Frontend Services & Client Libraries**: \`${serviceFiles.length}\` files
- **State Stores & Contexts**: \`${storeFiles.length}\` files

---

## 3. Package Scripts & Configurations

\`\`\`json
${JSON.stringify(pkg.scripts, null, 2)}
\`\`\`

---

## 4. Git Workspace Status

\`\`\`text
${gitStatus || 'Clean workspace'}
\`\`\`
`;

fs.writeFileSync(path.join(docsDir, '00-FRONTEND-BASELINE.md'), report);
console.log('Saved docs/phase-f/00-FRONTEND-BASELINE.md');
