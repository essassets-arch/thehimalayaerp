const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const backendRoot = path.join(root, 'backend');
const frontendRoot = path.join(root, 'frontend');

console.log('=== PHASE 8 DISCOVERY: BACKEND & SECURITY ARCHITECTURE ===');

// 1. Discover Prisma Schema Models
const prismaSchemaPath = path.join(backendRoot, 'prisma/schema.prisma');
let models = [];
if (fs.existsSync(prismaSchemaPath)) {
  const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
  const modelMatches = schemaContent.match(/model\s+(\w+)\s+\{/g) || [];
  models = modelMatches.map(m => m.replace(/model\s+/, '').replace(/\s+\{/, ''));
}
console.log(`Prisma Models Discovered (${models.length}):`, models.slice(0, 10), `... and ${models.length - 10} more`);

// 2. Discover Backend Controllers & Guards
const modulesDir = path.join(backendRoot, 'src/modules');
let backendModules = [];
let totalControllers = 0;
let totalServices = 0;

if (fs.existsSync(modulesDir)) {
  const entries = fs.readdirSync(modulesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const modPath = path.join(modulesDir, entry.name);
      const files = fs.readdirSync(modPath);
      const controllers = files.filter(f => f.endsWith('.controller.ts'));
      const services = files.filter(f => f.endsWith('.service.ts'));
      totalControllers += controllers.length;
      totalServices += services.length;
      backendModules.push({
        name: entry.name,
        controllers,
        services
      });
    }
  }
}
console.log(`Backend Modules: ${backendModules.length}, Controllers: ${totalControllers}, Services: ${totalServices}`);

// 3. Scan for Security Decorators & Guards
let publicEndpoints = 0;
let guardedEndpoints = 0;

backendModules.forEach(m => {
  m.controllers.forEach(c => {
    const cPath = path.join(modulesDir, m.name, c);
    const content = fs.readFileSync(cPath, 'utf8');
    if (content.includes('@Public(') || content.includes('@Public()')) publicEndpoints++;
    if (content.includes('@RequirePermissions(') || content.includes('@Roles(') || content.includes('@UseGuards(')) guardedEndpoints++;
  });
});

console.log(`Guarded Controller files: ${guardedEndpoints}, Explicit Public endpoints: ${publicEndpoints}`);

const summary = {
  prismaModelsCount: models.length,
  prismaModels: models,
  backendModulesCount: backendModules.length,
  backendModules,
  totalControllers,
  totalServices,
  guardedControllers: guardedEndpoints,
  publicControllers: publicEndpoints
};

fs.writeFileSync(
  path.join(frontendRoot, 'phase8-discovery-raw.json'),
  JSON.stringify(summary, null, 2)
);

console.log('✅ Phase 8 discovery raw summary saved to phase8-discovery-raw.json');
